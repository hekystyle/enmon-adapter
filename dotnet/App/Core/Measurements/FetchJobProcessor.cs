using Hangfire;
using HekyLab.EnmonAdapter.Model;
using Microsoft.Extensions.Logging;

namespace HekyLab.EnmonAdapter.Core.Measurements;

internal class FetchJobProcessor(
  ILogger<FetchJobProcessor> logger,
  IMeasurementsSourceFactory sourceFactory,
  IConfigRepository configRepository,
  IMeasurementsQueue measurementsQueue
  )
{
  public async Task ProcessFetchJobAsync(string sourceId, CancellationToken cancellationToken)
  {
    var source = configRepository.Sources.FirstOrDefault(s => s.Id == sourceId) ?? throw new Exception($"Source not found by ID: {sourceId}");

    await ProcessSource(source, cancellationToken);

    measurementsQueue.ScheduleInstantProcessing();
  }

  async Task ProcessSource(ISourceConfig source, CancellationToken cancellationToken)
  {
    var targets = configRepository.FindTargetsBy(source);

    if (!targets.Any())
    {
      logger.LogWarning("No targets found by source {Id} so measurements fetch was skipped", source.Id);
      return;
    }

    IMeasurementsSource adapter = sourceFactory.CreateSource(source.ServiceKey) ?? throw new Exception($"Source not found by key: {source.ServiceKey}");

    var readings = await adapter.GetMeasurementsAsync(new Uri(source.Url), cancellationToken);

    logger.LogInformation("Fetched {Count} measurements from source {Url}", readings.Count, source.Url);

    await Task.WhenAll(targets.Select(async (target, targetIndex) =>
    {
      await CreateMeasurementUploadInstructions(target, readings, cancellationToken);
    }));
  }

  async Task CreateMeasurementUploadInstructions(ITargetConfig target, IReadOnlyCollection<Measurement> readings, CancellationToken cancellationToken)
  {
    var jobs = readings.Select(reading => new MeasurementUploadInstruction
    {
      Measurement = reading,
      TargetId = target.Id,
    });

    await measurementsQueue.PushAsync(jobs, cancellationToken);
  }
}
