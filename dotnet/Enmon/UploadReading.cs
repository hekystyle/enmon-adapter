using MongoDB.Bson;
using MongoDB.Entities;

namespace Enmon;

public class UploadReading : Entity
{
  public required Reading Reading { get; set; }
  public required ConfigEnmon Config { get; set; }
}

public class Reading
{
  public required string Register { get; set; }
  public double Value { get; set; }
  public DateTime ReadAt { get; set; }
}

public class ConfigEnmon
{
  public required Env Env { get; set; }
  public ObjectId CustomerId { get; set; }
  public required string DevEUI { get; set; }
  public required string Token { get; set; }
}
