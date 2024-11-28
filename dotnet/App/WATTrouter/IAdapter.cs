namespace WATTrouter;

public interface IAdapter
{
  string Model { get; }

  Task<IReadOnlyCollection<Enmon.Reading>> GetReadings(Uri baseUrl);
}

public interface IAdapterSelector
{
  IAdapter? GetAdapter(string model);
}

public class AdapterSelector(IEnumerable<IAdapter> adapters) : IAdapterSelector
{
  public IAdapter? GetAdapter(string model)
  {
    return adapters.FirstOrDefault(a => a.Model.Equals(model, StringComparison.OrdinalIgnoreCase));
  }
}
