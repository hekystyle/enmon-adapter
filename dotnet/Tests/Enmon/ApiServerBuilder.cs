using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace HekyLab.EnmonAdapter.Tests.Enmon;

public static class ApiServerBuilder
{
  public static IHost Create()
  {
    return Host.CreateDefaultBuilder()
      .ConfigureWebHostDefaults(static builder =>
      {
        builder.UseTestServer();
        builder.Configure(static app =>
        {
          app.UseRouting();
          app.UseEndpoints(static endpoints =>
          {
            endpoints.MapPost("/meter/plain/{customerId}/value", async static context =>
            {
              Assert.Single(context.Request.Headers.Authorization);
              Assert.Equal("application/json; charset=utf-8", context.Request.ContentType);
              context.Response.ContentType = "application/json";
              context.Response.StatusCode = StatusCodes.Status201Created;
              await Task.CompletedTask;
            });
          });
        });
      }).Start();
  }
}
