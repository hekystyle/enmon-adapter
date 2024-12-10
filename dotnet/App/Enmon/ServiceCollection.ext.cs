
using Microsoft.Extensions.DependencyInjection;

namespace HekyLab.EnmonAdapter.Enmon;

public static class ServiceCollectionExtensions
{
  public static IServiceCollection AddEnmon(this IServiceCollection services)
  {
    return services
      .AddHttpClient()
      .AddSingleton<IApiClient, ApiClient>();
  }
}
