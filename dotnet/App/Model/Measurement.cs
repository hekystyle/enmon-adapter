namespace HekyLab.EnmonAdapter.Model;

public record Measurement
{
  public required string Register { get; set; }
  public double Value { get; set; }
  public DateTime ReadAt { get; set; }
}
