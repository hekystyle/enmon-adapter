using MongoDB.Entities;
using MongoDB.Driver;
using Hangfire;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Builder;
using HekyLab.EnmonAdapter;

var builder = WebApplication.CreateBuilder();

builder.Services
  .AddHangfire(hangfire =>
  {
    hangfire
      .UseSimpleAssemblyNameTypeSerializer()
      .UseRecommendedSerializerSettings()
      .UseInMemoryStorage();
  })
  .AddHangfireServer()
  .AddEnmonAdapter(builder.Configuration.GetSection("App"));

var app = builder.Build();

app.MapHangfireDashboard();

await DB.InitAsync(
  "enmon-adapter",
  MongoClientSettings.FromConnectionString(builder.Configuration.GetConnectionString("App"))
);

await app.RunAsync();
