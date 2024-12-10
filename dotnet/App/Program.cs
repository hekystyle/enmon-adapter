using Microsoft.Extensions.DependencyInjection;
using MongoDB.Entities;
using MongoDB.Driver;
using Hangfire;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Builder;
using HekyLab.EnmonAdapter.WATTrouter;
using HekyLab.EnmonAdapter.Enmon;

var builder = WebApplication.CreateBuilder();

builder.Host.ConfigureServices(static (context, services) =>
{
  services.Configure<IReadOnlyCollection<HekyLab.EnmonAdapter.WATTrouter.Config>>(context.Configuration.GetSection("Targets"));

  services
    .AddHangfire(hangfire =>
    {
      hangfire
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UseInMemoryStorage();
    })
    .AddHangfireServer();

  services
    .AddSingleton(async () =>
    {
      await DB.InitAsync(
        "enmon-adapter",
        MongoClientSettings.FromConnectionString(context.Configuration.GetConnectionString("App"))
      );
    })
    .AddEnmon()
    .AddWATTrouter();
});

var app = builder.Build();

app.MapHangfireDashboard();

await app.RunAsync();
