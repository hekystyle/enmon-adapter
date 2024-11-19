namespace WATTrouter;

public class MxApiClient
{

  public async Task<AllTimeStats> GetAllTimeStatsAsync(Uri origin)
  {
    using var httpClient = new HttpClient();
    httpClient.BaseAddress = origin;

    var response = await httpClient.GetAsync("stat_alltime.xml");

    response.EnsureSuccessStatusCode();

    var stream = await response.Content.ReadAsStreamAsync();

    return AllTimeStats.Parse(stream);
  }

  public async Task<Measurement> GetMeasurementAsync(Uri origin)
  {
    using var httpClient = new HttpClient();
    httpClient.BaseAddress = origin;

    var response = await httpClient.GetAsync("meas.xml");

    response.EnsureSuccessStatusCode();

    var stream = await response.Content.ReadAsStreamAsync();

    return Measurement.Parse(stream);
  }
}
