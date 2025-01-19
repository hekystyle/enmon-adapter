using Hangfire;
using Microsoft.Extensions.Logging;

namespace HekyLab.EnmonAdapter.Core.Measurements;

internal class SourceJobProcessor(ILogger<SourceJobProcessor> logger, IConfigRepository configRepository)
{
  private IEnumerable<ISourceConfig> Sources => configRepository.Sources;

  public void EnqueueFetchJobForEachSource()
  {
    foreach (var source in configRepository.Sources)
    {
      BackgroundJob.Enqueue<FetchJobProcessor>(x => x.ProcessFetchJobAsync(source.Id, CancellationToken.None));
    }

    var count = Sources.Count();
    logger.Log(count == 0 ? LogLevel.Warning : LogLevel.Information, "Enqueued fetch jobs of {Count} sources", count);
  }
}
