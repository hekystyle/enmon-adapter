namespace WATTrouter;

public class MxApiClient(HttpClient httpClient)
{
  public async Task<AllTimeStats> GetAllTimeStatsAsync()
  {
    var response = await httpClient.GetAsync("/stat_alltime.xml");

    response.EnsureSuccessStatusCode();

    var stream = await response.Content.ReadAsStreamAsync();

    return AllTimeStats.Parse(stream);
  }

  public async Task<Measurement> GetMeasurementAsync()
  {
    var response = await httpClient.GetAsync("/meas.xml");

    response.EnsureSuccessStatusCode();

    var stream = await response.Content.ReadAsStreamAsync();

    return Measurement.Parse(stream);
  }
}
