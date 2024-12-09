using Microsoft.Extensions.DependencyInjection;
using MongoDB.Entities;
using MongoDB.Driver;
using WATTrouter;
using Hangfire;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Builder;

var builder = WebApplication.CreateBuilder();

builder.Host.ConfigureServices((context, services) =>
    {
      services.Configure<IReadOnlyCollection<Config>>(context.Configuration.GetSection("Targets"));

      services
        .AddHangfire(hangfire =>
        {
          hangfire
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UseSqlServerStorage(context.Configuration.GetConnectionString("Hangfire"));
        })
        .AddHangfireServer();

      services
          .AddSingleton(async () => await DB.InitAsync(
            "enmon-adapter",
            MongoClientSettings.FromConnectionString(context.Configuration.GetConnectionString("App"))
          ))
          .AddWATTrouter();
    });

var app = builder.Build();

app.MapHangfireDashboard();

app.Run();
