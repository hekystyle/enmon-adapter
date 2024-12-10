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

public interface IApiClient
{
  Task<PostMeterPlainCounterMultiResult> PostMeterPlainCounterMulti(PostMeterCounterArgs args);

  Task<HttpResponseMessage> PostMeterPlainValue(PostMeterPlainValueArgs args, CancellationToken cancellationToken);
}
