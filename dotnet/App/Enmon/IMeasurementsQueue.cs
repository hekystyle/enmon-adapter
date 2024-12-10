
using MongoDB.Driver;

namespace HekyLab.EnmonAdapter.Enmon;

public interface IMeasurementsQueue
{
  public const string Name = "measurements";

  Task Push(IEnumerable<MeasurementUploadData> uploadJobs);

  Task ScheduleInstantProcessing();

  Task<IAsyncCursor<MeasurementUploadData>> GetSorterCursorAsync(CancellationToken cancellationToken);
}
