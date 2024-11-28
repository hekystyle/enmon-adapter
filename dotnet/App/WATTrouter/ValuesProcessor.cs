using Enmon;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace WATTrouter;

public class ValuesProcessor(ILogger<ValuesProcessor> logger, IAdapterSelector adapterSelector, IOptions<IReadOnlyCollection<Config>> _configs)
{
  IReadOnlyCollection<Config> Configs => _configs.Value ?? [];

  public async void HandleFetchJob()
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
            await ProcessConfig(config);
          }
          catch (Exception e)
          {
            logger.LogError(e, "failed to process config");
          }
        }
      })
    );

    logger.LogInformation("job completed");
  }

  async Task ProcessConfig(Config config)
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

    logger.LogInformation("fetching values from {Source}", config.BaseURL);

    var readings = await adapter.GetReadings(config.BaseURL);

    await Task.WhenAll(config.Targets.Select(async (target, targetIndex) =>
    {
      using (logger.BeginScope(new { TargetIndex = targetIndex }))
      {
        try
        {
          await ProcessTarget(target, readings);
        }
        catch (Exception e)
        {
          logger.LogError(e, "failed to process target");
        }
      }
    }));

    logger.LogInformation("config processed");
  }

  async Task ProcessTarget(Enmon.Config target, IReadOnlyCollection<Reading> readings)
  {
    // TODO: implement
  }
}
