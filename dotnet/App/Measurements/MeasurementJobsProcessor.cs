using HekyLab.EnmonAdapter.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HekyLab.EnmonAdapter.Measurements;

internal class MeasurementJobsProcessor(
  ILogger<MeasurementJobsProcessor> logger,
  ISourceSelector adapterSelector,
  IOptions<Config.AppSettings> appSettings,
  IQueue measurementsQueue
  )
{
  IEnumerable<Config.Source> Sources => appSettings.Value.Sources ?? [];

  public async Task HandleFetchJob(CancellationToken cancellationToken)
  {
    logger.LogInformation("handling fetch job...");

    if (!Sources.Any())
    {
      logger.LogWarning("no sources configured!");
      return;
    }

    await Task.WhenAll(
      Sources.Select(async (source, index) =>
      {
        using (logger.BeginScope(new { ConfigIndex = index }))
        {
          try
          {
            await ProcessSource(source, cancellationToken);
          }
          catch (Exception e)
          {
            logger.LogError(e, "failed to process config");
          }
        }
      })
    );

    logger.LogInformation("scheduling immediate measurements processing...");

    measurementsQueue.ScheduleInstantProcessing();

    logger.LogInformation("scheduler, job handling completed");
  }

  async Task ProcessSource(Config.Source source, CancellationToken cancellationToken)
  {
    logger.LogInformation("processing config...");

    ISource? adapter = adapterSelector.GetAdapter(source.AdapterId);

    if (adapter is null)
    {
      logger.LogError("adapter not found by ID: {ID}", source.AdapterId);
      return;
    }

    logger.LogInformation("fetching values from {Source}", source.Url);

    var readings = await adapter.GetMeasurementsAsync(new Uri(source.Url), cancellationToken);

    await Task.WhenAll(source.Targets.Select(async (targetId, targetIndex) =>
    {
      using (logger.BeginScope(new { Target = new { Id = targetId, Index = targetIndex } }))
      {
        try
        {
          await ProcessTarget(targetId, readings, cancellationToken);
        }
        catch (Exception e)
        {
          logger.LogError(e, "failed to process target");
        }
      }
    }));

    logger.LogInformation("config processed");
  }

  async Task ProcessTarget(string targetId, IReadOnlyCollection<Measurement> readings, CancellationToken cancellationToken)
  {
    logger.LogInformation("mapping {Count} readings to jobs...", readings.Count);

    var jobs = readings.Select(reading => new MeasurementUploadData
    {
      Measurement = reading,
      TargetId = targetId,
    });

    logger.LogInformation("pushing {Count} jobs to queue...", jobs.Count());

    await measurementsQueue.Push(jobs, cancellationToken);

    logger.LogInformation("jobs pushed to queue, target processed");
  }
}
