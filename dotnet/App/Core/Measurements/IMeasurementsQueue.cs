using HekyLab.EnmonAdapter.Model;

namespace HekyLab.EnmonAdapter.Core.Measurements;

internal interface IAsyncQueue<T>
{
  Task PushAsync(IEnumerable<T> measurements, CancellationToken cancellationToken);
  Task<T?> PeekAsync(CancellationToken cancellationToken);
  Task RemoveAsync(T measurement, CancellationToken cancellationToken);
}

internal interface IMeasurementsQueue : IAsyncQueue<MeasurementUploadInstruction>
{
  public const string Name = "measurements";
  void ScheduleInstantProcessing();
}
