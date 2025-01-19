using HekyLab.EnmonAdapter.Model;

namespace HekyLab.EnmonAdapter.Core.Measurements;

public interface IMeasurementsSource
{
  Task<IReadOnlyCollection<Measurement>> GetMeasurementsAsync(Uri source, CancellationToken cancellationToken);
}
