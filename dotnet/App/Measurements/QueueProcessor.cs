using Hangfire;
using HekyLab.EnmonAdapter.Enmon;
using HekyLab.EnmonAdapter.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Entities;

namespace HekyLab.EnmonAdapter.Measurements;

[Queue(IQueue.Name)]
internal class QueueProcessor(
    ILogger<QueueProcessor> logger,
    IOptions<Config.AppSettings> appSettings,
    IApiClient apiClient,
    IQueue uploadJobQueue)
{
  [AutomaticRetry(Attempts = int.MaxValue)]
  public async Task UploadReadingsAsync(CancellationToken cancellationToken)
  {
    logger.LogInformation("Processing upload job...");

    var cursor = await uploadJobQueue.GetSorterCursorAsync(cancellationToken);

    while (await cursor.MoveNextAsync(cancellationToken))
    {
      foreach (var document in cursor.Current)
      {
        cancellationToken.ThrowIfCancellationRequested();
        try
        {
          await UploadReadingAsync(document, cancellationToken);
          logger.LogInformation("Deleting uploaded reading...");
          await document.DeleteAsync(null, cancellationToken);
        }
        catch (OperationCanceledException)
        {
          throw;
        }
        catch (Exception ex)
        {
          HandleUploadReadingError(ex);
        }
      }
    }

    logger.LogInformation("All readings uploaded.");
  }

  private async Task UploadReadingAsync(MeasurementUploadData data, CancellationToken cancellationToken)
  {
    var target = appSettings.Value.Targets.FirstOrDefault(t => t.Id == data.TargetId) ?? throw new Exception($"Target not found by ID: {data.TargetId}");
    try
    {
      await apiClient.UploadMeasurementAsync(data.Measurement, target, cancellationToken);
    }
    catch (HttpRequestException ex)
    {
      logger.LogError("HTTP Request failed: {Message}", ex.Message);
      throw;
    }
  }

  private void HandleUploadReadingError(Exception ex)
  {
    if (ex is HttpRequestException httpRequestException)
    {
      logger.LogError("Upload reading failed. Status: {StatusCode}, Message: {Message}", httpRequestException.StatusCode, httpRequestException.Message);
    }
    else
    {
      logger.LogError("An unexpected error occurred: {Message}", ex.Message);
      throw ex;
    }
  }
}
