using HekyLab.EnmonAdapter.Config;
using HekyLab.EnmonAdapter.Enmon;
using HekyLab.EnmonAdapter.Measurements;
using HekyLab.EnmonAdapter.WATTrouter;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace HekyLab.EnmonAdapter;

public static class ServiceCollectionExtensions
{
  public static IServiceCollection AddEnmonAdapter(this IServiceCollection services, IConfiguration config)
  {
    services.AddOptions<AppSettings>()
      .Bind(config)
      .ValidateDataAnnotations()
      .ValidateOnStart();

    return services
      .AddSingleton<IValidateOptions<AppSettings>, AppSettingsValidation>()
      .AddHttpClient()
      .AddSingleton<Enmon.IHttpClientFactory, DefaultHttpClientFactory>()
      .AddSingleton<IApiClient, DefaultApiClient>()
      .AddHostedService<FetchJobScheduler>()
      .AddSingleton<ISourceSelector, DefaultSourceSelector>()
      .AddTransient<ISource, MxAdapter>();
  }
}
