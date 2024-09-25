using MongoDB.Bson;
using MongoDB.Entities;

namespace Enmon;

public class UploadReading : Entity
{
    public Reading Reading { get; set; }
    public ConfigEnmon Config { get; set; }
}

public class Reading
{
    public string Register { get; set; }
    public double Value { get; set; }
    public DateTime ReadAt { get; set; }
}

public class ConfigEnmon
{
    public Env Env { get; set; }
    public ObjectId CustomerId { get; set; }
    public string DevEUI { get; set; }
    public string Token { get; set; }
}