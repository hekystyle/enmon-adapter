using HekyLab.EnmonAdapter.Enmon;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HekyLab.EnmonAdapter.WATTrouter;

public class ValuesProcessor(
  ILogger<ValuesProcessor> logger,
  IAdapterSelector adapterSelector,
  IOptions<IReadOnlyCollection<Config>> _configs,
  IMeasurementsQueue measurementQueue
  )
{
  IReadOnlyCollection<Config> Configs => _configs.Value ?? [];

  public async Task HandleFetchJob(CancellationToken cancellationToken)
  {
    logger.LogInformation("handling fetch job...");

    if (Configs.Count == 0)
    {
      logger.LogWarning("no WATTrouters configured!");
      return;
    }

    await Task.WhenAll(
      Configs.Select(async (config, index) =>
      {
        using (logger.BeginScope(new { ConfigIndex = index }))
        {
          try
          {
            await ProcessConfig(config, cancellationToken);
          }
          catch (Exception e)
          {
            logger.LogError(e, "failed to process config");
          }
        }
      })
    );

    logger.LogInformation("scheduling immediate measurements processing...");

    measurementQueue.ScheduleInstantProcessing();

    logger.LogInformation("scheduler, job handling completed");
  }

  async Task ProcessConfig(Config config, CancellationToken cancellationToken)
  {
    logger.LogInformation("processing config...");

    string defaultModel = "Mx";

    if (config.Model is null)
      logger.LogWarning("model not set in config, falling back to {defaultModel}", defaultModel);

    var selectedModel = config.Model ?? defaultModel;

    IAdapter? adapter = adapterSelector.GetAdapter(selectedModel);

    if (adapter is null)
    {
      logger.LogError("adapter not found by model {Model}", selectedModel);
      return;
    }

    logger.LogInformation("fetching values from {Source}", config.Source);

    var readings = await adapter.GetReadings(config.Source, cancellationToken);

    await Task.WhenAll(config.Targets.Select(async (target, targetIndex) =>
    {
      using (logger.BeginScope(new { TargetIndex = targetIndex }))
      {
        try
        {
          await ProcessTarget(target, readings, cancellationToken);
        }
        catch (Exception e)
        {
          logger.LogError(e, "failed to process target");
        }
      }
    }));

    logger.LogInformation("config processed");
  }

  async Task ProcessTarget(Enmon.Config target, IReadOnlyCollection<Measurement> readings, CancellationToken cancellationToken)
  {
    logger.LogInformation("mapping {Count} readings to jobs...", readings.Count);

    var jobs = readings.Select(reading => new MeasurementUploadData
    {
      Reading = reading,
      Config = target,
    });

    logger.LogInformation("pushing {Count} jobs to queue...", jobs.Count());

    await measurementQueue.Push(jobs, cancellationToken);

    logger.LogInformation("jobs pushed to queue, target processed");
  }
}
