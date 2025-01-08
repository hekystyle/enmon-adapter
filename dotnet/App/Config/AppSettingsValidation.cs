using Microsoft.Extensions.Options;

namespace HekyLab.EnmonAdapter.Config;

internal class AppSettingsValidation : IValidateOptions<AppSettings>
{
  public ValidateOptionsResult Validate(string? name, AppSettings options)
  {
    var failures = FindUndefinedTargets(options);

    return failures.Count == 0 ? ValidateOptionsResult.Success : ValidateOptionsResult.Fail(failures);
  }

  private static List<string> FindUndefinedTargets(AppSettings options)
  {
    List<string> failures = [];

    foreach (var source in options.Sources)
    {
      foreach (var targetId in source.Targets)
      {
        if (!options.Targets.Any(t => t.Id == targetId))
          failures.Add($"Source target {targetId} not found in defined targets");
      }
    }

    return failures;
  }
}
