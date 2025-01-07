using HekyLab.EnmonAdapter.WATTrouter.Model;

namespace HekyLab.EnmonAdapter.WATTrouter;

public class MxApiClient(HttpClient httpClient)
{
  public async Task<StatAllTime> GetAllTimeStatsAsync(CancellationToken cancellationToken)
  {
    var response = await httpClient.GetAsync("/stat_alltime.xml", cancellationToken);

    response.EnsureSuccessStatusCode();

    var stream = await response.Content.ReadAsStreamAsync(cancellationToken);

    return StatAllTime.Parse(stream);
  }

  public async Task<Meas> GetMeasurementAsync(CancellationToken cancellationToken)
  {
    var response = await httpClient.GetAsync("/meas.xml", cancellationToken);

    response.EnsureSuccessStatusCode();

    var stream = await response.Content.ReadAsStreamAsync(cancellationToken);

    return Meas.Parse(stream);
  }
}
