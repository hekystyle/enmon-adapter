using HekyLab.EnmonAdapter.Config;
using HekyLab.EnmonAdapter.Core;
using HekyLab.EnmonAdapter.Core.Measurements;
using HekyLab.EnmonAdapter.Enmon;
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

    services.AddSingleton<IValidateOptions<AppSettings>, AppSettingsValidation>();

    services.AddHttpClient();

    services.AddEnmon();

    services.AddHostedService<FetchJobSchedulerHostedService>();

    services.AddScoped<IMeasurementsQueue, MeasurementsQueue>()
      .AddScoped<FetchJobProcessor>()
      .AddScoped<UploadJobProcessor>()
      .AddSingleton<IConfigRepository, StaticConfigRepository>()
      .AddSingleton<IMeasurementsSourceFactory, MeasurementsSourceFactory>()
      .AddKeyedSingleton<IMeasurementsSource, MxAdapter>(typeof(MxAdapter).FullName);

    return services;
  }
}
