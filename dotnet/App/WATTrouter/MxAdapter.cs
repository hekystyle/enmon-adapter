
using Enmon;
using Microsoft.Extensions.Logging;

namespace WATTrouter;

public class MxAdapter(ILogger<MxAdapter> logger, IMxApiClientFactory factory) : IAdapter
{
  public string Model => "Mx";

  public async Task<IReadOnlyCollection<Reading>> GetReadings(Uri baseUrl)
  {
    var apiClient = factory.Create(baseUrl);

    logger.LogInformation("fetching all time stats and measurements...");
    var allTimeStatsTask = apiClient.GetAllTimeStatsAsync();
    var measurementTask = apiClient.GetMeasurementAsync();

    await Task.WhenAll(allTimeStatsTask, measurementTask);
    logger.LogInformation("all time stats and measurements fetched successfully");

    var allTimeStats = await allTimeStatsTask;
    var measurement = await measurementTask;
    var readAt = DateTime.Now;

    return [
      new Reading { ReadAt = readAt, Register = "1-1.8.2", Value = allTimeStats.SAH4 },
      new Reading { ReadAt = readAt, Register = "1-1.8.3", Value = allTimeStats.SAL4 },
      new Reading { ReadAt = readAt, Register = "1-1.8.4", Value = allTimeStats.SAP4 },
      new Reading { ReadAt = readAt, Register = "1-2.8.0", Value = allTimeStats.SAS4 },
      new Reading { ReadAt = readAt, Register = "1-32.7.0", Value = measurement.VAC },
    ];
  }
}
