
using Microsoft.Extensions.DependencyInjection;

namespace WATTrouter;

public static class ServiceCollectionExtensions
{
  public static IServiceCollection AddWATTrouter(this IServiceCollection services)
  {
    return services
      .AddTransient<IMxApiClientFactory, MxApiClientFactory>()
      .AddTransient<IAdapter, MxAdapter>()
      .AddSingleton<AdapterFactory>();
  }
}
