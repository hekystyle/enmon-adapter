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

public record PostMeterPlainValueContext
{
  public Env? Env { get; init; }
  public required PlainDataPoint Payload { get; init; }
  public ObjectId CustomerId { get; init; }
  public required string Token { get; init; }
}

public interface IApiClient
{
  Task<HttpResponseMessage> PostMeterPlainValue(PostMeterPlainValueContext context, CancellationToken cancellationToken);
}
