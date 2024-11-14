using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using MongoDB.Entities;
using MongoDB.Driver;

var host = Host.CreateDefaultBuilder(args)
    .ConfigureAppConfiguration((context, config) =>
    {
        config.SetBasePath(context.HostingEnvironment.ContentRootPath)
              .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
    })
    .ConfigureServices((context, services) => {
         var db = context.Configuration.GetSection("Db");
        
        services
            .AddSingleton(async () => await DB.InitAsync(
                "enmon-adapter",
                 MongoClientSettings.FromConnectionString(db["Uri"])
            ));
    })
    .Build();

var app = host.Services.GetRequiredService<App>();
app.Run();

public class App
{
    public void Run()
    {
        Console.WriteLine("Hello, DI Console App!");
    }
}
