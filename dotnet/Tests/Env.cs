using Newtonsoft.Json;
using Xunit;

namespace Enmon.Tests
{
  public class EnvTests
  {
    [Fact]
    public void Serialize_EnvEnum_ReturnsCorrectString()
    {
      var env = Env.App;

      var serialized = JsonConvert.SerializeObject(env);

      Assert.Equal("\"app\"", serialized);
    }

    [Fact]
    public void Deserialize_EnvEnum_ReturnsCorrectEnum()
    {
      var json = "\"app\"";

      var deserialized = JsonConvert.DeserializeObject<Env>(json);

      Assert.Equal(Env.App, deserialized);
    }

    [Fact]
    public void Format_EnvEnum_ReturnsCorrectString()
    {
      Assert.Equal("app", $"{Env.App}");
    }

    [Fact]
    public void Serialize_EnvEnumWithSystemTextJson_ReturnsCorrectString()
    {
      var env = Env.Dev;

      string serialized = JsonConvert.SerializeObject(env);

      Assert.Equal("\"dev\"", serialized);
    }

    [Fact]
    public void Deserialize_EnvEnumWithSystemTextJson_ReturnsCorrectEnum()
    {
      var json = "\"dev\"";

      var deserialized = JsonConvert.DeserializeObject<Env>(json);

      Assert.Equal(Env.Dev, deserialized);
    }

    [Fact]
    public void Format_EnvDev_ReturnsCorrectString()
    {
      Assert.Equal("dev", $"{Env.Dev}");
    }
  }
}
