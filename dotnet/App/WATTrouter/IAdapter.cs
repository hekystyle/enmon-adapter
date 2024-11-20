using Microsoft.Extensions.DependencyInjection;

namespace WATTrouter;

public record Values(AllTimeStats AllTimeStats, Measurement Measurement);

public interface IAdapter
{
  string Model { get; }

  Task<Values> GetValues(Uri baseUrl);
}

public class AdapterFactory(IServiceProvider serviceProvider)
{
  public IAdapter GetAdapter(string model)
  {
    var adapters = serviceProvider.GetServices<IAdapter>();

    var adapter = adapters.FirstOrDefault(a => a.Model.Equals(model, StringComparison.OrdinalIgnoreCase));

    return adapter ?? throw new ArgumentException($"Adapter for model '{model}' not found.", nameof(model));
  }
}
