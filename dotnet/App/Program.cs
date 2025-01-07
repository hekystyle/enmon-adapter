using Microsoft.Extensions.DependencyInjection;
using MongoDB.Entities;
using MongoDB.Driver;
using Hangfire;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Builder;
using HekyLab.EnmonAdapter.Enmon;
using HekyLab.EnmonAdapter.Config;
using HekyLab.EnmonAdapter;

var builder = WebApplication.CreateBuilder();

builder.Services
  .Configure<AppSettings>(builder.Configuration.GetSection("App"))
  .AddHangfire(hangfire =>
  {
    hangfire
      .UseSimpleAssemblyNameTypeSerializer()
      .UseRecommendedSerializerSettings()
      .UseInMemoryStorage();
  })
  .AddHangfireServer()
  .AddEnmon()
  .AddEnmonAdapter();

var app = builder.Build();

app.MapHangfireDashboard();

await DB.InitAsync(
  "enmon-adapter",
  MongoClientSettings.FromConnectionString(builder.Configuration.GetConnectionString("App"))
);

await app.RunAsync();
