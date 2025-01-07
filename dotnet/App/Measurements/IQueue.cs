using HekyLab.EnmonAdapter.Model;
using MongoDB.Driver;

namespace HekyLab.EnmonAdapter.Measurements;

internal interface IQueue
{
  public const string Name = "measurements";

  Task Push(IEnumerable<MeasurementUploadData> uploadJobs, CancellationToken cancellationToken);

  void ScheduleInstantProcessing();

  Task<IAsyncCursor<MeasurementUploadData>> GetSorterCursorAsync(CancellationToken cancellationToken);
}
