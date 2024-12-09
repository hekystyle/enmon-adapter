using System.ComponentModel.DataAnnotations;

namespace HekyLab.EnmonAdapter.WATTrouter;

public record Config
{
  public required string Model { get; init; }

  [Url]
  public required Uri Source { get; set; }

  public required IEnumerable<Enmon.Config> Targets { get; init; }
}
