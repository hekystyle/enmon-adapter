
using Hangfire;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HekyLab.EnmonAdapter.WATTrouter;

public class FetchJobScheduler(ILogger<FetchJobScheduler> logger, IHostEnvironment hostEnvironment) : IHostedService
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

  private  void Schedule()
  {
    var minute = hostEnvironment.IsProduction() ? 15 : 1;

    logger.LogInformation("scheduling {JobName} every {Minute} minute...", JobName, minute);

    RecurringJob.AddOrUpdate<ValuesProcessor>(
      JobName,
      x => x.HandleFetchJob(CancellationToken.None),
      EveryNthMinute(minute)
    );

    logger.LogInformation("scheduled");
  }

  private static string EveryNthMinute(int minute) => $"*/{minute} * * * *";
}
