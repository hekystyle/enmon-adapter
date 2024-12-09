using System.ComponentModel.DataAnnotations;

namespace Enmon;

public class Config
{
  [Required]
  public required Env Env { get; set; }

  [Required]
  [ObjectId]
  public required string CustomerId { get; set; }

  [Required]
  public required string DevEUI { get; set; }

  [Required]
  public required string Token { get; set; }
}

public static class ConfigValidator
{
  public static bool TryValidate(Config config, out List<ValidationResult> validationResults)
  {
    var context = new ValidationContext(config);
    validationResults = [];
    return Validator.TryValidateObject(config, context, validationResults, true);
  }
}
