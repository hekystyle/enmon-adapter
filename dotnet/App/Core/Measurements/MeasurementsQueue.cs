using Hangfire;
using HekyLab.EnmonAdapter.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HekyLab.EnmonAdapter.Core.Measurements;

internal class MeasurementsQueue(ILogger<MeasurementsQueue> logger, AppDbContext context) : IMeasurementsQueue
{
  public async Task PushAsync(IEnumerable<MeasurementUploadInstruction> items, CancellationToken cancellationToken)
  {
    await context.Measurements.AddRangeAsync(items, cancellationToken);
    await context.SaveChangesAsync(cancellationToken);
    logger.LogInformation("Added {Count} measurements", items.Count());
  }

  public async Task<MeasurementUploadInstruction?> PeekAsync(CancellationToken cancellationToken)
  {
    return await context.Measurements.AsNoTracking().OrderBy(s => s.Measurement.MeasuredAt).FirstOrDefaultAsync(cancellationToken);
  }

  public async Task RemoveAsync(MeasurementUploadInstruction measurement, CancellationToken cancellationToken)
  {
    context.Measurements.Remove(measurement);
    await context.SaveChangesAsync(cancellationToken);
    logger.LogInformation("Measurement {ID} deleted", measurement.Id);
  }

  public void ScheduleInstantProcessing()
  {
    BackgroundJob.Enqueue<UploadJobProcessor>(x => x.ProcessUploadJobAsync(CancellationToken.None));
    logger.LogInformation("Measurements upload job enqueued");
  }
}
