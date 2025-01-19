using HekyLab.EnmonAdapter.Core;
using System.ComponentModel.DataAnnotations;

namespace HekyLab.EnmonAdapter.Model;

public record Measurement
{
  [Required, MeterRegister]
  public required string Register { get; set; }

  [Required]
  public double Value { get; set; }

  [Required]
  public DateTime MeasuredAt { get; set; }
}
