using System.ComponentModel;

namespace WATTrouter;

public record Config
{
  [DefaultValue("Mx")]
  public string Model { get; init; } = "Mx";

  public required string BaseURL { get; set; }

  public required IEnumerable<Enmon.Config> Targets { get; init; }
}
