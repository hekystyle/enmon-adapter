using Hangfire;
using HekyLab.EnmonAdapter.Enmon;
using Microsoft.Extensions.Logging;

namespace HekyLab.EnmonAdapter.Core.Measurements;

[Queue(IMeasurementsQueue.Name)]
internal class UploadJobProcessor(
    ILogger<UploadJobProcessor> logger,
    IConfigRepository configRepository,
    IApiClientFactory apiClientFactory,
    IMeasurementsQueue measurementsQueue)
{
  [AutomaticRetry(Attempts = int.MaxValue)]
  [DisableConcurrentExecution(1)]
  public async Task ProcessUploadJobAsync(CancellationToken cancellationToken)
  {
    var uploadInstructions = await measurementsQueue.PeekAsync(cancellationToken);
    while (uploadInstructions is not null)
    {
      cancellationToken.ThrowIfCancellationRequested();

      var target = configRepository.Targets.FirstOrDefault(t => t.Id == uploadInstructions.TargetId) ?? throw new Exception($"Target not found by ID: {uploadInstructions.TargetId}");

      var client = apiClientFactory.CreateClient(target.Env);

      await client.UploadMeasurementAsync(uploadInstructions.Measurement, target, cancellationToken);
      logger.LogInformation("Measurement {ID} uploaded successfully", uploadInstructions.Id);

      await measurementsQueue.RemoveAsync(uploadInstructions, cancellationToken);

      uploadInstructions = await measurementsQueue.PeekAsync(cancellationToken);
    }

    logger.LogInformation("All measurements successfully uploaded");
  }
}
