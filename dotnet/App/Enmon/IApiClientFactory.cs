using Microsoft.Extensions.DependencyInjection;

namespace HekyLab.EnmonAdapter.Enmon;

internal interface IApiClientFactory
{
  IApiClient CreateClient(Env env);
}

internal class ApiClientFactory(IServiceProvider serviceProvider) : IApiClientFactory
{
  public IApiClient CreateClient(Env env)
  {
    return serviceProvider.GetRequiredKeyedService<IApiClient>(env);
  }
}
