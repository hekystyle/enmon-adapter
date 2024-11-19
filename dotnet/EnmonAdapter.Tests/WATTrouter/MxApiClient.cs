using Microsoft.AspNetCore.TestHost;

namespace WATTrouter;

public class MxApiClientTests
{
    [Fact]
    public async Task GetAllTimeStatsAsync_ReturnsValidDataObject()
    {
        // Arrange
        using var server = MxServerBuilder.Create();
        var httpClient = server.GetTestClient();
        var apiClient = new MxApiClient(httpClient);

        // Act
        var allTimeStats = await apiClient.GetAllTimeStatsAsync();

        // Assert
        Assert.Equal(1476.53, allTimeStats.SAS4);
        Assert.Equal(5276.82, allTimeStats.SAH4);
        Assert.Equal(11574.53, allTimeStats.SAL4);
        Assert.Equal(22330.82, allTimeStats.SAP4);
    }

    [Fact]
    public async Task GetMeasurementAsync_ReturnsValidDataObject()
    {
        // Arrange
        using var server = MxServerBuilder.Create();
        var httpClient = server.GetTestClient();
        var apiClient = new MxApiClient(httpClient);

        // Act
        var meas = await apiClient.GetMeasurementAsync();

        // Assert
        Assert.Equal(241, meas.VAC);
    }
}
