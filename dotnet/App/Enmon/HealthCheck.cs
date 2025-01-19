using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace HekyLab.EnmonAdapter.Enmon;

internal class HealthCheck(IHttpClientFactory httpClientFactory) : IHealthCheck
{
  public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
  {
    var httpClient = httpClientFactory.CreateClient(context.Registration.Name);
    var response = await httpClient.GetAsync("/healthz", cancellationToken);
    return response.IsSuccessStatusCode ? HealthCheckResult.Healthy() : HealthCheckResult.Degraded();
  }
}
