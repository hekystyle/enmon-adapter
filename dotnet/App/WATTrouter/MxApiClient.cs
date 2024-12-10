namespace HekyLab.EnmonAdapter.WATTrouter;

public interface IMxApiClientFactory
{
  MxApiClient Create(Uri baseUrl);
}

public class MxApiClient(HttpClient httpClient)
{
  public async Task<AllTimeStats> GetAllTimeStatsAsync()
  {
    var response = await httpClient.GetAsync("/stat_alltime.xml");

    response.EnsureSuccessStatusCode();

    var stream = await response.Content.ReadAsStreamAsync();

    return AllTimeStats.Parse(stream);
  }

  public async Task<Meas> GetMeasurementAsync()
  {
    var response = await httpClient.GetAsync("/meas.xml");

    response.EnsureSuccessStatusCode();

    var stream = await response.Content.ReadAsStreamAsync();

    return Meas.Parse(stream);
  }
}

public class MxApiClientFactory(IHttpClientFactory factory) : IMxApiClientFactory
{
  public MxApiClient Create(Uri baseUrl)
  {
    var http = factory.CreateClient();
    http.BaseAddress = baseUrl;
    return new MxApiClient(http);
  }
}
