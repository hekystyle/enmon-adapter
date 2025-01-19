using Microsoft.Extensions.DependencyInjection;

namespace HekyLab.EnmonAdapter.Core.Measurements;

internal interface IMeasurementsSourceFactory
{
  IMeasurementsSource? CreateSource(string serviceKey);
}

internal class MeasurementsSourceFactory(IServiceProvider serviceProvider) : IMeasurementsSourceFactory
{
  public IMeasurementsSource? CreateSource(string serviceKey)
  {
    return serviceProvider.GetKeyedService<IMeasurementsSource>(serviceKey);
  }
}
