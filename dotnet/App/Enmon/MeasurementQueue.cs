using Hangfire;
using MongoDB.Driver;
using MongoDB.Entities;

namespace HekyLab.EnmonAdapter.Enmon;

public class UploadReadingRepository() : IMeasurementsQueue
{
  public async Task Push(IEnumerable<MeasurementUploadData> items, CancellationToken cancellationToken)
  {
    await DB.SaveAsync(items, null, cancellationToken);
  }

  public async Task<IAsyncCursor<MeasurementUploadData>> GetSorterCursorAsync(CancellationToken cancellationToken)
  {
    return await DB.Find<MeasurementUploadData>().Sort(x => Prop.Path<MeasurementUploadData>(r => r.Reading.ReadAt)).ExecuteCursorAsync(cancellationToken);
  }

  public void ScheduleInstantProcessing()
  {
    BackgroundJob.Enqueue<MeasurementsQueueProcessor>(x => x.UploadReadingsAsync(CancellationToken.None));
  }
}
