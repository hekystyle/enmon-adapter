using HekyLab.EnmonAdapter.Config;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using HekyLab.EnmonAdapter.Model;

namespace HekyLab.EnmonAdapter.Enmon;

public record PlainDataPoint
{
  public required string DevEUI { get; init; }
  public DateTime Date { get; init; }
  public required string MeterRegister { get; init; }
  public double? Value { get; init; } // Nullable to represent either value or counter
  public double? Counter { get; init; } // Nullable to represent either value or counter
}

public record PostMeterPlainValueContext
{
  public Env? Env { get; init; }
  public required PlainDataPoint Payload { get; init; }
  public ObjectId CustomerId { get; init; }
  public required string Token { get; init; }
}

internal class DefaultApiClient(ILogger<DefaultApiClient> logger, IHttpClientFactory httpClientFactory) : IApiClient
{
  private static JsonSerializerOptions LowercaseOptions => new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

  private static MediaTypeHeaderValue MediaType => new("application/json", "utf8");

  public async Task UploadMeasurementAsync(Measurement measurement, Target target, CancellationToken cancellationToken)
  {
    var payload = new PlainDataPoint
    {
      DevEUI = target.DevEUI,
      Date = measurement.ReadAt,
      Value = measurement.Value,
      MeterRegister = measurement.Register
    };
    logger.LogInformation("Uploading reading with payload: {Payload}", payload);
    var ctx = new PostMeterPlainValueContext
    {
      Env = target.Env,
      CustomerId = new ObjectId(target.CustomerId),
      Token = target.Token,
      Payload = payload
    };
    var response = await PostMeterPlainValue(ctx, cancellationToken);
    logger.LogInformation("Reading uploaded successfully. Status: {StatusCode}, StatusText: {ReasonPhrase}", response.StatusCode, response.ReasonPhrase);
  }

  private async Task<HttpResponseMessage> PostMeterPlainValue(PostMeterPlainValueContext args, CancellationToken cancellationToken)
  {
    using var httpClient = httpClientFactory.CreateClient();

    httpClient.BaseAddress = new Uri($"https://{args.Env}.enmon.tech");
    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", args.Token);

    var content = JsonContent.Create(args.Payload, MediaType, LowercaseOptions);

    var response = await httpClient.PostAsync($"meter/plain/{args.CustomerId}/value", content, cancellationToken);

    response.EnsureSuccessStatusCode();

    return response;
  }
}
