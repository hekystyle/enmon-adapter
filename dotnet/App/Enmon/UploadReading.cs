using MongoDB.Entities;

namespace Enmon;

public class UploadReading : Entity
{
  public required Reading Reading { get; set; }
  public required Config Config { get; set; }
}

public record Reading
{
  public required string Register { get; set; }
  public double Value { get; set; }
  public DateTime ReadAt { get; set; }
}

