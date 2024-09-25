using System.ComponentModel.DataAnnotations;

namespace Enmon;

public class Config
{
    [Required]
    public Env Env { get; set; }

    [Required]
    [StringLength(24, MinimumLength = 24)]
    public string CustomerId { get; set; }

    [Required]
    public string DevEUI { get; set; }

    [Required]
    public string Token { get; set; }
}

public static class ConfigValidator
{
    public static bool TryValidate(ConfigEnmon config, out List<ValidationResult> validationResults)
    {
        var context = new ValidationContext(config);
        validationResults = new List<ValidationResult>();
        return Validator.TryValidateObject(config, context, validationResults, true);
    }
}
