using HekyLab.EnmonAdapter.Config;
using HekyLab.EnmonAdapter.Model;

namespace HekyLab.EnmonAdapter.Enmon;

internal interface IApiClient
{
  Task UploadMeasurementAsync(Measurement measurement, Target target, CancellationToken cancellationToken);
}
