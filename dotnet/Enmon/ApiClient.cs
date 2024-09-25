using System.Net.Http.Headers;
using System.Text.Json;
using MongoDB.Bson;

namespace Enmon;

public class PlainDataPoint
{
    public string DevEUI { get; set; }
    public DateTime Date { get; set; }
    public string MeterRegister { get; set; }
    public double? Value { get; set; } // Nullable to represent either value or counter
    public double? Counter { get; set; } // Nullable to represent either value or counter
}

public class PostMeterCounterArgs
{
    public Enmon.Env? Env { get; set; }
    public List<PlainDataPoint> Payload { get; set; }
    public string CustomerId { get; set; }
    public string Token { get; set; }
}

public class ValidationErrorItem
{
    public string Message { get; set; }
    public List<object> Path { get; set; }
    public string Type { get; set; }
}

public class PostMeterPlainCounterMultiResult
{
    public int SuccessCount { get; set; }
    public int ErrorCount { get; set; }
    public List<PlainDataPointError> ErrorDocs { get; set; }
}

public class PlainDataPointError : PlainDataPoint
{
    public object Error { get; set; } // Can be a string or a list of ValidationErrorItem
}

public class PostMeterPlainValueArgs
{
    public Env? Env { get; set; }
    public PlainDataPoint Payload { get; set; }
    public ObjectId CustomerId { get; set; }
    public string Token { get; set; }
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
        var baseUrl = $"https://{args.Env?.ToString().ToLower() ?? defaultEnv.ToString().ToLower()}.enmon.tech";
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
