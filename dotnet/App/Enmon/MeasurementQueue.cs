using Hangfire;
using MongoDB.Driver;
using MongoDB.Entities;

namespace HekyLab.EnmonAdapter.Enmon;

public class UploadReadingRepository() : IMeasurementsQueue
{
  public async Task Push(IEnumerable<MeasurementUploadData> items)
  {
    await DB.SaveAsync(items);
  }

  public async Task<IAsyncCursor<MeasurementUploadData>> GetSorterCursorAsync(CancellationToken cancellationToken)
  {
    return await DB.Find<MeasurementUploadData>().Sort(x => Prop.Path<MeasurementUploadData>(r => r.Reading.ReadAt)).ExecuteCursorAsync(cancellationToken);
  }

  public Task ScheduleInstantProcessing()
  {
    BackgroundJob.Enqueue<MeasurementsQueueProcessor>(x => x.UploadReadingsAsync(CancellationToken.None));
    return Task.CompletedTask;
  }
}
