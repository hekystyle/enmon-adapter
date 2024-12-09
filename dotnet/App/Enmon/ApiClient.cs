using System.Net.Http.Headers;
using System.Text.Json;
using MongoDB.Bson;

namespace HekyLab.EnmonAdapter.Enmon;

public record PlainDataPoint
{
  public required string DevEUI { get; init; }
  public DateTime Date { get; init; }
  public required string MeterRegister { get; init; }
  public double? Value { get; init; } // Nullable to represent either value or counter
  public double? Counter { get; init; } // Nullable to represent either value or counter
}

public record PostMeterCounterArgs
{
  public Env? Env { get; init; }
  public required List<PlainDataPoint> Payload { get; init; }
  public required string CustomerId { get; init; }
  public required string Token { get; init; }
}

public record ValidationErrorItem
{
  public required string Message { get; init; }
  public required List<object> Path { get; init; }
  public required string Type { get; init; }
}

public record PostMeterPlainCounterMultiResult
{
  public int SuccessCount { get; init; }
  public int ErrorCount { get; init; }
  public required List<PlainDataPointError> ErrorDocs { get; init; }
}

public record PlainDataPointError : PlainDataPoint
{
  public required object Error { get; init; } // Can be a string or a list of ValidationErrorItem
}

public record PostMeterPlainValueArgs
{
  public Env? Env { get; init; }
  public required PlainDataPoint Payload { get; init; }
  public ObjectId CustomerId { get; init; }
  public required string Token { get; init; }
}

public class ApiClient(Env env)
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
