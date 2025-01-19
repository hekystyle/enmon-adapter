using HekyLab.EnmonAdapter.Enmon;
using System.Text.Json;

namespace HekyLab.EnmonAdapter.Tests;

public class EnvTests
{
  [Fact]
  public void ShouldStringifyCorrectly()
  {
    Assert.Equal("app", $"{Env.app}");
    Assert.Equal("dev", $"{Env.dev}");
  }

  [Fact]
  public void ShouldSerializeToJson()
  {
    Assert.Equal("\"app\"", JsonSerializer.Serialize(Env.app));
    Assert.Equal("\"dev\"", JsonSerializer.Serialize(Env.dev));
  }

  [Fact]
  public void ShouldDeserializeFromJson()
  {
    Assert.Equal(Env.app, JsonSerializer.Deserialize<Env>("\"app\""));
    Assert.Equal(Env.dev, JsonSerializer.Deserialize<Env>("\"dev\""));
  }
}

