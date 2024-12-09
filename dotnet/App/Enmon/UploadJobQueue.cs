using MongoDB.Driver;

namespace Enmon;

public interface IUploadJobQueue
{
  Task Push(IEnumerable<UploadReading> uploadJobs);

  Task ScheduleInstantProcessing();

  Task<IAsyncCursor<UploadReading>> GetSorterCursorAsync();
}
