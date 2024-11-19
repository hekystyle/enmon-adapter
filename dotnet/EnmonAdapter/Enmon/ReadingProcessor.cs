using Hangfire;
using Microsoft.Extensions.Logging;
using MongoDB.Entities;

namespace Enmon;

[Queue(Constants.ReadingsQueueName)]
public class ReadingProcessor(
    ILogger<ReadingProcessor> logger,
    ApiClient enmonApiClient,
    UploadReadingRepository uploadReadingRepository)
{
  private readonly ILogger<ReadingProcessor> logger = logger;
  private readonly ApiClient enmonApiClient = enmonApiClient;
  private readonly UploadReadingRepository uploadReadingRepository = uploadReadingRepository;


  [AutomaticRetry(Attempts = 3)]
  public async Task HandleUploadJobAsync()
  {
    logger.LogInformation("Processing upload job...");

    var cursor = await uploadReadingRepository.GetSorterCursorAsync();

    while (await cursor.MoveNextAsync())
    {
      foreach (var document in cursor.Current)
      {
        try
        {
          await UploadReadingAsync(document);
          logger.LogInformation("Deleting uploaded reading...");
          await document.DeleteAsync();
        }
        catch (Exception ex)
        {
          HandleUploadReadingError(ex);
        }
      }
    }

    logger.LogInformation("All readings uploaded.");
  }

  private async Task UploadReadingAsync(UploadReading data)
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

    logger.LogInformation($"Uploading reading with payload: {payload}");

    try
    {
      var response = await enmonApiClient.PostMeterPlainValue(new PostMeterPlainValueArgs
      {
        Env = config.Env,
        CustomerId = config.CustomerId,
        Token = config.Token,
        Payload = payload
      });
      logger.LogInformation($"Reading uploaded successfully. Status: {response.StatusCode}, StatusText: {response.ReasonPhrase}");
    }
    catch (HttpRequestException ex)
    {
      logger.LogError($"HTTP Request failed: {ex.Message}");
      throw;
    }
  }

  private void HandleUploadReadingError(Exception ex)
  {
    if (ex is HttpRequestException httpRequestException)
    {
      logger.LogError($"Upload reading failed. Status: {httpRequestException.StatusCode}, Message: {httpRequestException.Message}");
    }
    else
    {
      logger.LogError($"An unexpected error occurred: {ex.Message}");
      throw ex;
    }
  }
}
