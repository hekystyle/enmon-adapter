
using Microsoft.Extensions.DependencyInjection;

namespace HekyLab.EnmonAdapter.WATTrouter;

public static class ServiceCollectionExtensions
{
  public static IServiceCollection AddWATTrouter(this IServiceCollection services)
  {
    return services
      .AddHostedService<FetchJobScheduler>()
      .AddTransient<IMxApiClientFactory, MxApiClientFactory>()
      .AddTransient<IAdapter, MxAdapter>()
      .AddSingleton<IAdapterSelector, AdapterSelector>();
  }
}
