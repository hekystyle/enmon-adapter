using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace HekyLab.EnmonAdapter.Tests.WATTrouter;

public static class ApiServerBuilder
{
  public static IHost Create()
  {
    return Host.CreateDefaultBuilder()
      .ConfigureWebHostDefaults(builder =>
      {
        builder.UseTestServer();
        builder.Configure(app =>
        {
          app.UseRouting();
          app.UseEndpoints(endpoints =>
          {
            endpoints.MapGet("/stat_alltime.xml", async context =>
            {

              context.Response.ContentType = "application/xml";
              using var stream = File.OpenRead(Path.Join("./__fixtures__", context.Request.Path));
              await stream.CopyToAsync(context.Response.Body, context.RequestAborted);
            });

            endpoints.MapGet("/meas.xml", async context =>
            {
              context.Response.ContentType = "application/xml";
              using var stream = File.OpenRead(Path.Join("./__fixtures__", context.Request.Path));
              await stream.CopyToAsync(context.Response.Body, context.RequestAborted);
            });
          });
        });
      }).Start();
  }
}
