namespace HekyLab.EnmonAdapter.Measurements;

internal interface ISourceSelector
{
  ISource? GetAdapter(string id);
}

internal class DefaultSourceSelector(IEnumerable<ISource> sources) : ISourceSelector
{
  public ISource? GetAdapter(string id)
  {
    return sources.FirstOrDefault(s => s.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
  }
}
