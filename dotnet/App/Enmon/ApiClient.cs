using HekyLab.EnmonAdapter.Config;
using HekyLab.EnmonAdapter.Model;
using Microsoft.Extensions.Logging;
using System.ComponentModel.DataAnnotations;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace HekyLab.EnmonAdapter.Enmon;

public record PlainDataPoint
{
  public required string DevEUI { get; init; }
  public DateTime Date { get; init; }
  public required string MeterRegister { get; init; }
  public double Value { get; init; }
}

public record PostMeterPlainValueContext
{
  public required PlainDataPoint Payload { get; init; }
  [ObjectId, MinLength(1)]
  public required string CustomerId { get; init; }
  [MinLength(1)]
  public required string Token { get; init; }
}

public class ApiClient(ILogger<ApiClient> logger, HttpClient httpClient) : IApiClient
{
  private static JsonSerializerOptions LowercaseOptions => new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

  private static MediaTypeHeaderValue MediaType => new("application/json", "utf-8");

  public async Task UploadMeasurementAsync(Measurement measurement, ITarget target, CancellationToken cancellationToken)
  {
    var payload = new PlainDataPoint
    {
      DevEUI = target.DevEUI,
      Date = measurement.MeasuredAt,
      Value = measurement.Value,
      MeterRegister = measurement.Register
    };
    logger.LogInformation("Uploading measurement {Payload}", payload);
    var ctx = new PostMeterPlainValueContext
    {
      CustomerId = target.CustomerId,
      Token = target.Token,
      Payload = payload
    };
    await PostMeterPlainValue(ctx, cancellationToken);
    logger.LogInformation("Measurement uploaded successfully");
  }

  private async Task<HttpResponseMessage> PostMeterPlainValue(PostMeterPlainValueContext args, CancellationToken cancellationToken)
  {
    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", args.Token);

    var content = JsonContent.Create(args.Payload, MediaType, LowercaseOptions);

    var response = await httpClient.PostAsync($"meter/plain/{args.CustomerId}/value", content, cancellationToken);

    response.EnsureSuccessStatusCode();

    return response;
  }
}
