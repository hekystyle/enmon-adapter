using System.Text.Json.Serialization;

namespace HekyLab.EnmonAdapter.Enmon;

[JsonConverter(typeof(JsonStringEnumConverter<Env>))]
public enum Env
{
  app,
  dev,
}
