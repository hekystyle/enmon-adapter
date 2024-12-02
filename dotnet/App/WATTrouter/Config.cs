using System.ComponentModel.DataAnnotations;

namespace WATTrouter;

public record Config
{
  public required string Model { get; init; }

  [Url]
  public required Uri BaseURL { get; set; }

  public required IEnumerable<Enmon.Config> Targets { get; init; }
}
