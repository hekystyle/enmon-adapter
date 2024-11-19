using System.Text.Json.Serialization;

namespace Enmon;

[JsonConverter(typeof(JsonStringEnumConverter<Env>))]
public enum Env
{
  app,
  dev,
}
