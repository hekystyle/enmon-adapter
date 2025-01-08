namespace HekyLab.EnmonAdapter.Enmon;

public interface IHttpClientFactory
{
  HttpClient CreateClient(Env? env);
}

internal class DefaultHttpClientFactory(System.Net.Http.IHttpClientFactory httpClientFactory) : IHttpClientFactory
{
  public HttpClient CreateClient(Env? env)
  {
    var client = httpClientFactory.CreateClient();
    client.BaseAddress = new Uri($"https://{env ?? Env.app}.enmon.tech");
    return client;
  }
}
