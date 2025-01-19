using HekyLab.EnmonAdapter.Enmon;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace HekyLab.EnmonAdapter.Tests.Enmon;

public class ApiClientTests
{
  [Fact]
  public async Task UploadMeasurement_ReturnsValidDataObject()
  {
    // Arrange
    var server = ApiServerBuilder.Create();
    var httpClient = server.GetTestClient();
    var apiClient = new ApiClient(
      server.Services.GetRequiredService<ILogger<ApiClient>>(),
      httpClient
    );

    // Act
    await apiClient.UploadMeasurementAsync(
      new Model.Measurement { Value = 3584, Register = "1-1.8.0", MeasuredAt = DateTime.Now },
      new Config.Target { CustomerId = "customer", DevEUI = "devEUI", Env = Env.dev, Id = "unknown", Token = "token" },
      CancellationToken.None
   );

    // Assert
  }
}
