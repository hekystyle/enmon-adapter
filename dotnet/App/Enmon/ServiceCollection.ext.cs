using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace HekyLab.EnmonAdapter.Enmon;

public static class EnmonServiceCollectionExtensions
{
  public static IServiceCollection AddEnmon(this IServiceCollection services)
  {
    const string ProductionName = "app.enmon.tech";
    const string StagingName = "dev.enmon.tech";

    services.AddHttpClient(ProductionName, client =>
    {
      client.BaseAddress = new Uri("https://app.enmon.tech");
    });

    services.AddHttpClient(StagingName, client =>
    {
      client.BaseAddress = new Uri("https://dev.enmon.tech");
    });

    services.AddKeyedScoped<IApiClient, ApiClient>(Env.app, (services, key) =>
    {
      return new ApiClient(
        services.GetRequiredService<ILogger<ApiClient>>(),
        services.GetRequiredService<IHttpClientFactory>().CreateClient(ProductionName)
        );
    }).AddKeyedScoped<IApiClient, ApiClient>(Env.dev, (services, key) =>
    {
      return new ApiClient(
        services.GetRequiredService<ILogger<ApiClient>>(),
        services.GetRequiredService<IHttpClientFactory>().CreateClient(StagingName)
        );
    });

    services.AddScoped<IApiClientFactory, ApiClientFactory>();

    services.AddHealthChecks()
      .AddCheck<HealthCheck>(ProductionName)
      .AddCheck<HealthCheck>(StagingName);

    return services;
  }
}
