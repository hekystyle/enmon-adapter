using HekyLab.EnmonAdapter.Enmon;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using IHttpClientFactory = HekyLab.EnmonAdapter.Enmon.IHttpClientFactory;

namespace HekyLab.EnmonAdapter.Tests.Enmon;

public class ApiClientTests
{
  class FakeHttpClientFactory(HttpClient client) : IHttpClientFactory
  {
    public HttpClient CreateClient(Env? env) => client;
  }

  [Fact]
  public async Task UploadMeasurement_ReturnsValidDataObject()
  {
    // Arrange
    var server = ApiServerBuilder.Create();
    var httpClient = server.GetTestClient();
    var apiClient = new DefaultApiClient(
      server.Services.GetRequiredService<ILogger<DefaultApiClient>>(),
      new FakeHttpClientFactory(httpClient)
    );

    // Act
    await apiClient.UploadMeasurementAsync(
      new Model.Measurement { Value = 3584, Register = "1-1.8.0", ReadAt = DateTime.Now },
      new Config.Target { CustomerId = "customer", DevEUI = "devEUI", Env = Env.dev, Id = "unknown", Token = "token" },
      CancellationToken.None
   );

    // Assert
  }
}
