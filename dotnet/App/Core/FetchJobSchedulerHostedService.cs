using Hangfire;
using HekyLab.EnmonAdapter.Core.Measurements;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HekyLab.EnmonAdapter.Core;

internal class FetchJobSchedulerHostedService(ILogger<FetchJobSchedulerHostedService> logger, IHostEnvironment hostEnvironment) : IHostedService
{
  public Task StartAsync(CancellationToken cancellationToken)
  {
    ScheduleFetchJob();
    return Task.CompletedTask;
  }

  public Task StopAsync(CancellationToken cancellationToken)
  {
    return Task.CompletedTask;
  }

  private void ScheduleFetchJob()
  {
    var minute = hostEnvironment.IsProduction() ? 15 : 1;

    var jobName = "sources.fetch.schedule";

    RecurringJob.AddOrUpdate<SourceJobProcessor>(
      jobName,
      x => x.EnqueueFetchJobForEachSource(),
      Cron.EveryNthMinute(minute)
    );

    logger.LogInformation("Scheduled {JobName} to execute every {Minutes} minutes...", jobName, minute);
  }
}
