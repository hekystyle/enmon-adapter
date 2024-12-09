using MongoDB.Driver;

namespace HekyLab.EnmonAdapter.Enmon;

public interface IUploadJobQueue
{
  Task Push(IEnumerable<UploadReading> uploadJobs);

  Task ScheduleInstantProcessing();

  Task<IAsyncCursor<UploadReading>> GetSorterCursorAsync();
}
