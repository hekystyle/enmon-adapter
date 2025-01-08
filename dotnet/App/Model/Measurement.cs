using System.ComponentModel.DataAnnotations;

namespace HekyLab.EnmonAdapter.Model;

public record Measurement
{
  [RegularExpression("\\d+-\\d+\\.\\d+\\.\\d+")]
  public required string Register { get; set; }
  public double Value { get; set; }
  public DateTime ReadAt { get; set; }
}
