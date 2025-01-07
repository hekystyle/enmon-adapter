using HekyLab.EnmonAdapter.Model;

namespace HekyLab.EnmonAdapter.Measurements;

public interface ISource
{
  string Id { get; }
  Task<IReadOnlyCollection<Measurement>> GetMeasurementsAsync(Uri source, CancellationToken cancellationToken);
}
