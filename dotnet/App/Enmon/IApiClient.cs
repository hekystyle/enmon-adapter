using HekyLab.EnmonAdapter.Config;
using HekyLab.EnmonAdapter.Model;
using System.ComponentModel.DataAnnotations;

namespace HekyLab.EnmonAdapter.Enmon;

public interface ITarget
{
  [Required, ObjectId]
  string CustomerId { get; }
  [Required, MinLength(1)]
  string DevEUI { get; }
  [Required, MinLength(1)]

  string Token { get; }
}

internal interface IApiClient
{
  Task UploadMeasurementAsync(Measurement measurement, ITarget target, CancellationToken cancellationToken);
}
