using Microsoft.Extensions.Logging;

namespace HekyLab.EnmonAdapter.WATTrouter;

public class MxAdapter(ILogger<MxAdapter> logger, IMxApiClientFactory factory) : IAdapter
{
  public string Model => "Mx";

  public async Task<IReadOnlyCollection<Enmon.Measurement>> GetReadings(Uri baseUrl, CancellationToken cancellationToken)
  {
    var apiClient = factory.Create(baseUrl);

    logger.LogInformation("fetching all time stats and measurements...");
    var allTimeStatsTask = apiClient.GetAllTimeStatsAsync(cancellationToken);
    var measurementTask = apiClient.GetMeasurementAsync(cancellationToken);

    await Task.WhenAll(allTimeStatsTask, measurementTask);
    logger.LogInformation("all time stats and measurements fetched successfully");

    var allTimeStats = await allTimeStatsTask;
    var measurement = await measurementTask;
    var readAt = DateTime.Now;

    return [
      new Enmon.Measurement { ReadAt = readAt, Register = "1-1.8.2", Value = allTimeStats.SAH4 },
      new Enmon.Measurement { ReadAt = readAt, Register = "1-1.8.3", Value = allTimeStats.SAL4 },
      new Enmon.Measurement { ReadAt = readAt, Register = "1-1.8.4", Value = allTimeStats.SAP4 },
      new Enmon.Measurement { ReadAt = readAt, Register = "1-2.8.0", Value = allTimeStats.SAS4 },
      new Enmon.Measurement { ReadAt = readAt, Register = "1-32.7.0", Value = measurement.VAC },
    ];
  }
}
