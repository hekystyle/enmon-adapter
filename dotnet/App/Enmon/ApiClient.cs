using System.Net.Http.Headers;
using System.Text.Json;

namespace HekyLab.EnmonAdapter.Enmon;

public class ApiClient(Env env) : IApiClient
{
  private readonly HttpClient httpClient = new();
  private readonly Env defaultEnv = env;

  private static readonly JsonSerializerOptions LowercaseOptions = new JsonSerializerOptions
  {
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
  };

  public async Task<PostMeterPlainCounterMultiResult> PostMeterPlainCounterMulti(PostMeterCounterArgs args)
  {
    var baseUrl = $"https://{args.Env ?? defaultEnv}.enmon.tech";
    httpClient.BaseAddress = new Uri(baseUrl);
    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", args.Token);

    var jsonPayload = JsonSerializer.Serialize(args.Payload, LowercaseOptions);
    var content = new StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json");

    var response = await httpClient.PostAsync($"meter/plain/{args.CustomerId}/counter-multi", content);
    response.EnsureSuccessStatusCode();

    var responseData = await response.Content.ReadAsStringAsync();
    return JsonSerializer.Deserialize<PostMeterPlainCounterMultiResult>(responseData);
  }

  public async Task<HttpResponseMessage> PostMeterPlainValue(PostMeterPlainValueArgs args, CancellationToken cancellationToken)
  {
    var baseUrl = $"https://{args.Env?.ToString().ToLower() ?? defaultEnv.ToString().ToLower()}.enmon.tech";
    httpClient.BaseAddress = new Uri(baseUrl);
    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", args.Token);

    var jsonPayload = JsonSerializer.Serialize(args.Payload, LowercaseOptions);
    var content = new StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json");

    return await httpClient.PostAsync($"meter/plain/{args.CustomerId}/value", content, cancellationToken);
  }
}
