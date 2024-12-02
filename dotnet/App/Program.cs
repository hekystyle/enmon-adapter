using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MongoDB.Entities;
using MongoDB.Driver;
using WATTrouter;

var builder = Host.CreateDefaultBuilder(args)
    .ConfigureServices((context, services) =>
    {
      var db = context.Configuration.GetSection("Db");

      services.Configure<IReadOnlyCollection<Config>>(context.Configuration.GetSection("Targets"));

      services
          .AddSingleton(async () => await DB.InitAsync(
            "enmon-adapter",
            MongoClientSettings.FromConnectionString(db["Uri"])
          ))
          .AddWATTrouter();
    });

var host = builder.Build();

var app = host.Services.GetRequiredService<App>();
app.Run();

public class App
{
  public void Run()
  {
    Console.WriteLine("Hello, DI Console App!");
  }
}
