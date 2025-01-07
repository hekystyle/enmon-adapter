using HekyLab.EnmonAdapter.Model;
using HekyLab.EnmonAdapter.Measurements;
using Microsoft.Extensions.Logging;

namespace HekyLab.EnmonAdapter.WATTrouter;

public class MxAdapter(ILogger<MxAdapter> logger, IHttpClientFactory factory) : ISource
{
  public string Id => "WATTrouter:Mx";

  public static readonly string[] SupportedSchemes = ["http", "https"];

  public async Task<IReadOnlyCollection<Measurement>> GetMeasurementsAsync(Uri source, CancellationToken cancellationToken)
  {
    return source.Scheme switch
    {
      "http" or "https" => await GetMeasurementsViaHttpAsync(source, cancellationToken),
      _ => throw new Exception($"Unsupported source scheme: {source.Scheme}"),
    };
  }

  private async Task<IReadOnlyCollection<Measurement>> GetMeasurementsViaHttpAsync(Uri baseUrl, CancellationToken cancellationToken)
  {
    var httpClient = factory.CreateClient();
    httpClient.BaseAddress = baseUrl;
    var apiClient = new MxApiClient(httpClient);

    logger.LogInformation("fetching all time stats and measurements...");
    var allTimeStatsTask = apiClient.GetAllTimeStatsAsync(cancellationToken);
    var measurementTask = apiClient.GetMeasurementAsync(cancellationToken);

    await Task.WhenAll(allTimeStatsTask, measurementTask);
    logger.LogInformation("all time stats and measurements fetched successfully");

    var allTimeStats = await allTimeStatsTask;
    var measurement = await measurementTask;
    var readAt = DateTime.Now;

    return [
      new Measurement { ReadAt = readAt, Register = "1-1.8.2", Value = allTimeStats.SAH4 },
      new Measurement { ReadAt = readAt, Register = "1-1.8.3", Value = allTimeStats.SAL4 },
      new Measurement { ReadAt = readAt, Register = "1-1.8.4", Value = allTimeStats.SAP4 },
      new Measurement { ReadAt = readAt, Register = "1-2.8.0", Value = allTimeStats.SAS4 },
      new Measurement { ReadAt = readAt, Register = "1-32.7.0", Value = measurement.VAC },
    ];
  }
}
