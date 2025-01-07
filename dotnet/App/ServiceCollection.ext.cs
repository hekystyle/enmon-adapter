using HekyLab.EnmonAdapter.Measurements;
using HekyLab.EnmonAdapter.WATTrouter;
using Microsoft.Extensions.DependencyInjection;

namespace HekyLab.EnmonAdapter;

public static class ServiceCollectionExtensions
{
  public static IServiceCollection AddEnmonAdapter(this IServiceCollection services)
  {
    return services
      .AddHostedService<FetchJobScheduler>()
      .AddSingleton<ISourceSelector, DefaultSourceSelector>()
      .AddTransient<ISource, MxAdapter>();
  }
}
