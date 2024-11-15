using System.Net.Http.Headers;
using System.Text.Json;
using MongoDB.Bson;

namespace Enmon;

public record PlainDataPoint
{
  public required string DevEUI { get; set; }
  public DateTime Date { get; set; }
  public required string MeterRegister { get; set; }
  public double? Value { get; set; } // Nullable to represent either value or counter
  public double? Counter { get; set; } // Nullable to represent either value or counter
}

public record PostMeterCounterArgs
{
  public Env? Env { get; set; }
  public required List<PlainDataPoint> Payload { get; set; }
  public required string CustomerId { get; set; }
  public required string Token { get; set; }
}

public record ValidationErrorItem
{
  public required string Message { get; set; }
  public required List<object> Path { get; set; }
  public required string Type { get; set; }
}

public record PostMeterPlainCounterMultiResult
{
  public int SuccessCount { get; set; }
  public int ErrorCount { get; set; }
  public required List<PlainDataPointError> ErrorDocs { get; set; }
}

public record PlainDataPointError : PlainDataPoint
{
  public required object Error { get; set; } // Can be a string or a list of ValidationErrorItem
}

public record PostMeterPlainValueArgs
{
  public Env? Env { get; set; }
  public required PlainDataPoint Payload { get; set; }
  public ObjectId CustomerId { get; set; }
  public required string Token { get; set; }
}

public class ApiClient(Env env)
{
  private readonly HttpClient httpClient = new HttpClient();
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

  public async Task<HttpResponseMessage> PostMeterPlainValue(PostMeterPlainValueArgs args)
  {
    var baseUrl = $"https://{args.Env?.ToString().ToLower() ?? defaultEnv.ToString().ToLower()}.enmon.tech";
    httpClient.BaseAddress = new Uri(baseUrl);
    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", args.Token);

    var jsonPayload = JsonSerializer.Serialize(args.Payload, LowercaseOptions);
    var content = new StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json");

    return await httpClient.PostAsync($"meter/plain/{args.CustomerId}/value", content);
  }
}
