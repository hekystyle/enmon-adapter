using Hangfire;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Entities;

namespace HekyLab.EnmonAdapter.Enmon;

[Queue(IMeasurementsQueue.Name)]
public class MeasurementsQueueProcessor(
    ILogger<MeasurementsQueueProcessor> logger,
    IApiClient enmonApiClient,
    IMeasurementsQueue uploadJobQueue)
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
    var config = data.Config;
    var reading = data.Reading;

    var payload = new PlainDataPoint
    {
      DevEUI = config.DevEUI,
      Date = reading.ReadAt,
      Value = reading.Value,
      MeterRegister = reading.Register
    };

    logger.LogInformation("Uploading reading with payload: {Payload}", payload);

    try
    {
      var response = await enmonApiClient.PostMeterPlainValue(new PostMeterPlainValueArgs
      {
        Env = config.Env,
        CustomerId = new ObjectId(config.CustomerId),
        Token = config.Token,
        Payload = payload
      }, cancellationToken);
      logger.LogInformation("Reading uploaded successfully. Status: {StatusCode}, StatusText: {ReasonPhrase}", response.StatusCode, response.ReasonPhrase);
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
