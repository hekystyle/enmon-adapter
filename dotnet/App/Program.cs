using Hangfire;
using Hangfire.Mongo;
using Hangfire.Mongo.Migration.Strategies;
using Hangfire.Mongo.Migration.Strategies.Backup;
using HekyLab.EnmonAdapter;
using HekyLab.EnmonAdapter.Core.Measurements;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("App") ?? throw new Exception("ConnectionStrings.App must be set in config file");

builder.Services
  .AddDbContext<AppDbContext>((services, options) =>
  {
    options.UseMongoDB(connectionString, new MongoUrl(connectionString).DatabaseName);
    options.EnableDetailedErrors();
    options.EnableSensitiveDataLogging(builder.Environment.IsDevelopment());
  })
  .AddHangfire(hangfire =>
  {
    hangfire
      .UseSimpleAssemblyNameTypeSerializer()
      .UseRecommendedSerializerSettings()
      .UseMongoStorage(builder.Configuration.GetConnectionString("Hangfire"), new MongoStorageOptions
      {
        MigrationOptions = new MongoMigrationOptions
        {
          MigrationStrategy = new DropMongoMigrationStrategy(),
          BackupStrategy = new NoneMongoBackupStrategy()
        },
        CheckConnection = true
      });
  })
  .AddHangfireServer(options =>
  {
    options.WorkerCount = 1;
    options.Queues = ["default", IMeasurementsQueue.Name];
  })
  .AddEnmonAdapter(builder.Configuration.GetSection("App"));

var app = builder.Build();

app.MapHangfireDashboard();
app.MapHealthChecks("/healthz");

using (var scope = app.Services.CreateScope())
{
  await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.EnsureCreatedAsync();
}

await app.RunAsync();
