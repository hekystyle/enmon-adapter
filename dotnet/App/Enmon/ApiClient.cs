using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace HekyLab.EnmonAdapter.Enmon;

public class ApiClient(IHttpClientFactory httpClientFactory) : IApiClient
{
  public const Env DefaultEnv = Env.app;

  private static JsonSerializerOptions LowercaseOptions => new()
  {
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
  };

  private static MediaTypeHeaderValue MediaType => new("application/json", "utf8");

  public async Task<HttpResponseMessage> PostMeterPlainValue(PostMeterPlainValueContext args, CancellationToken cancellationToken)
  {
    using var httpClient = httpClientFactory.CreateClient();

    httpClient.BaseAddress = new Uri($"https://{args.Env ?? DefaultEnv}.enmon.tech");
    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", args.Token);

    var content = JsonContent.Create(args.Payload, MediaType, LowercaseOptions);

    var response = await httpClient.PostAsync($"meter/plain/{args.CustomerId}/value", content, cancellationToken);

    response.EnsureSuccessStatusCode();

    return response;
  }
}
