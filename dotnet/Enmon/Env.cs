namespace Enmon;

public record Env
{
  public static readonly Env App = new("app");
  public static readonly Env Dev = new("dev");

  private readonly string value;

  private Env(string value)
  {
    this.value = value;
  }

  public override string ToString() => value;

  public static implicit operator string(Env environment) => environment.value;
  public static implicit operator Env(string value) => FromString(value);

  public static Env FromString(string value)
  {
    return value switch
    {
      "app" => App,
      "dev" => Dev,
      _ => throw new ArgumentException($"Invalid value: {value}", nameof(value)),
    };
  }
}

