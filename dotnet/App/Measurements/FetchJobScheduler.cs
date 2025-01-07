
using Hangfire;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HekyLab.EnmonAdapter.Measurements;

internal class FetchJobScheduler(ILogger<FetchJobScheduler> logger, IHostEnvironment hostEnvironment) : IHostedService
{
  private const string JobName = "fetch";

  public Task StartAsync(CancellationToken cancellationToken)
  {
    Schedule();
    return Task.CompletedTask;
  }

  public Task StopAsync(CancellationToken cancellationToken)
  {
    return Task.CompletedTask;
  }

  private void Schedule()
  {
    var minute = hostEnvironment.IsProduction() ? 15 : 1;

    logger.LogInformation("scheduling {JobName} every {Minute} minute...", JobName, minute);

    RecurringJob.AddOrUpdate<MeasurementJobsProcessor>(
      JobName,
      x => x.HandleFetchJob(CancellationToken.None),
      Cron.EveryNthMinute(minute)
    );

    logger.LogInformation("scheduled");
  }
}
