
using Microsoft.Extensions.Logging;

namespace WATTrouter;

public class MxAdapter(ILogger<MxAdapter> logger, MxApiClient apiClient) : IAdapter
{
    public async Task<Values> GetValues(Uri baseUrl)
    {
        logger.LogInformation("fetching all time stats and measurements...");
        var allTimeStatsTask = apiClient.GetAllTimeStatsAsync(baseUrl);
        var measurementTask = apiClient.GetMeasurementAsync(baseUrl);

        await Task.WhenAll(allTimeStatsTask, measurementTask);
        logger.LogInformation("all time stats and measurements fetched successfully");

        return new Values(await allTimeStatsTask, await measurementTask);
    }
}
