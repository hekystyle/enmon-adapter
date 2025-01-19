using System.ComponentModel.DataAnnotations;

namespace HekyLab.EnmonAdapter.Core;

public interface ISourceConfig
{
  [Required, MinLength(1)]
  string Id { get; }

  /// <summary>
  /// Key under which <see cref="Core.Measurements.IMeasurementsSource"/> implementation is registered in DI container.
  /// </summary>
  [Required, MinLength(1)]
  string ServiceKey { get; }

  [Required, Url]
  string Url { get; }
}
