
using Microsoft.Extensions.Logging;

namespace WATTrouter;

public class MxAdapter(ILogger<MxAdapter> logger, IMxApiClientFactory factory) : IAdapter
{
  public async Task<Values> GetValues(Uri baseUrl)
  {
    var apiClient = factory.Create(baseUrl);

    logger.LogInformation("fetching all time stats and measurements...");
    var allTimeStatsTask = apiClient.GetAllTimeStatsAsync();
    var measurementTask = apiClient.GetMeasurementAsync();

    await Task.WhenAll(allTimeStatsTask, measurementTask);
    logger.LogInformation("all time stats and measurements fetched successfully");

    return new Values(await allTimeStatsTask, await measurementTask);
  }
}
