using MongoDB.Entities;

namespace HekyLab.EnmonAdapter.Enmon;

public class MeasurementUploadData : Entity
{
  public required Measurement Reading { get; set; }
  public required Config Config { get; set; }
}

public record Measurement
{
  public required string Register { get; set; }
  public double Value { get; set; }
  public DateTime ReadAt { get; set; }
}

