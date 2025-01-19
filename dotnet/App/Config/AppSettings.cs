using HekyLab.EnmonAdapter.Core;
using System.ComponentModel.DataAnnotations;

namespace HekyLab.EnmonAdapter.Config;

internal record AppSettings
{
  public required IEnumerable<Source> Sources { get; init; } = [];
  public required IEnumerable<Target> Targets { get; init; } = [];
  public required Dictionary<string, IEnumerable<string>> Relations { get; init; } = [];
}

internal record Source : ISourceConfig
{
  [Required, MinLength(1)]
  public required string Id { get; init; }
  /// <summary>
  /// Key under which <see cref="Core.Measurements.IMeasurementsSource"/> implementation is registered in DI container.
  /// </summary>
  [Required, MinLength(1)]
  public required string ServiceKey { get; init; }

  [Required, Url]
  public required string Url { get; init; }
}

public record Target : Enmon.ITarget, ITargetConfig
{
  [Required, MinLength(1)]
  public required string Id { get; init; }

  [Required]
  public required Enmon.Env Env { get; init; }

  [Required, ObjectId]
  public required string CustomerId { get; init; }

  [Required, MinLength(1)]
  public required string DevEUI { get; init; }

  [Required, MinLength(1)]
  public required string Token { get; init; }
}
