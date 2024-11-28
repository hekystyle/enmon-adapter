using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace WATTrouter;

public record Config
{
  [DefaultValue("Mx")]
  public string? Model { get; init; };

  [Url]
  public required Uri BaseURL { get; set; }

  public required IEnumerable<Enmon.Config> Targets { get; init; }
}
