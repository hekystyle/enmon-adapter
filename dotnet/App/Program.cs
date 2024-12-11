using Microsoft.Extensions.DependencyInjection;
using MongoDB.Entities;
using MongoDB.Driver;
using Hangfire;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Builder;
using HekyLab.EnmonAdapter.WATTrouter;
using HekyLab.EnmonAdapter.Enmon;

var builder = WebApplication.CreateBuilder();

builder.Services
  .Configure<IReadOnlyCollection<HekyLab.EnmonAdapter.WATTrouter.Config>>(builder.Configuration.GetSection("Targets"))
  .AddHangfire(hangfire =>
  {
    hangfire
      .UseSimpleAssemblyNameTypeSerializer()
      .UseRecommendedSerializerSettings()
      .UseInMemoryStorage();
  })
  .AddHangfireServer()
  .AddEnmon()
  .AddWATTrouter();

var app = builder.Build();

app.MapHangfireDashboard();

await DB.InitAsync(
  "enmon-adapter",
  MongoClientSettings.FromConnectionString(builder.Configuration.GetConnectionString("App"))
);

await app.RunAsync();
