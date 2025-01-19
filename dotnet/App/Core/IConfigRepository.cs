using HekyLab.EnmonAdapter.Config;
using Microsoft.Extensions.Options;

namespace HekyLab.EnmonAdapter.Core;

public interface IConfigRepository
{
  IEnumerable<ISourceConfig> Sources { get; }
  IEnumerable<ITargetConfig> Targets { get; }
  IEnumerable<ITargetConfig> FindTargetsBy(ISourceConfig source);
}

internal class StaticConfigRepository(IOptions<AppSettings> options) : IConfigRepository
{
  public IEnumerable<ISourceConfig> Sources { get; } = options.Value.Sources.Where(s => options.Value.Relations.ContainsKey(s.Id));
  public IEnumerable<ITargetConfig> Targets => options.Value.Targets;

  public IEnumerable<ITargetConfig> FindTargetsBy(ISourceConfig source)
  {
    return options.Value.Targets.Where(target => options.Value.Relations.TryGetValue(source.Id, out var targets) && targets.Contains(target.Id));
  }
}
