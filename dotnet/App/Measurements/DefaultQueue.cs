using Hangfire;
using HekyLab.EnmonAdapter.Model;
using MongoDB.Driver;
using MongoDB.Entities;

namespace HekyLab.EnmonAdapter.Measurements;

internal class DefaultQueue() : IQueue
{
  public async Task Push(IEnumerable<MeasurementUploadData> items, CancellationToken cancellationToken)
  {
    await DB.SaveAsync(items, null, cancellationToken);
  }

  public async Task<IAsyncCursor<MeasurementUploadData>> GetSorterCursorAsync(CancellationToken cancellationToken)
  {
    return await DB.Find<MeasurementUploadData>().Sort(x => Prop.Path<MeasurementUploadData>(r => r.Measurement.ReadAt)).ExecuteCursorAsync(cancellationToken);
  }

  public void ScheduleInstantProcessing()
  {
    BackgroundJob.Enqueue<QueueProcessor>(x => x.UploadReadingsAsync(CancellationToken.None));
  }
}
