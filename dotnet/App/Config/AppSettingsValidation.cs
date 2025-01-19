using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HekyLab.EnmonAdapter.Config;

internal class AppSettingsValidation(ILogger<AppSettingsValidation> logger) : IValidateOptions<AppSettings>
{
  public ValidateOptionsResult Validate(string? name, AppSettings options)
  {
    if (options.Relations.Count == 0) logger.LogWarning("No relations between sources and targets configured!");

    return ValidateOptionsResult.Success;
  }
}
