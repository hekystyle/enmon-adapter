
using MongoDB.Driver;

namespace HekyLab.EnmonAdapter.Enmon;

public interface IMeasurementsQueue
{
  public const string Name = "measurements";

  Task Push(IEnumerable<MeasurementUploadData> uploadJobs, CancellationToken cancellationToken);

  void ScheduleInstantProcessing();

  Task<IAsyncCursor<MeasurementUploadData>> GetSorterCursorAsync(CancellationToken cancellationToken);
}
