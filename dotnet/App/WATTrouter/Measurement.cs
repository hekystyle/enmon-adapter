using System.ComponentModel.DataAnnotations;
using System.Xml;
using System.Xml.Serialization;

namespace HekyLab.EnmonAdapter.WATTrouter;

[XmlRoot("meas")]
public record Measurement
{
  /// <summary>
  /// Voltage on phase L1
  /// </summary>
  [Required]
  public int VAC { get; init; }

  public static Measurement Parse(Stream stream)
  {
    var serializer = new XmlSerializer(typeof(Measurement));
    try
    {
      return (Measurement?)serializer.Deserialize(stream) ?? throw new Exception("Provided XML contains no element");
    }
    catch (InvalidOperationException e) when (e.InnerException is XmlException)
    {
      throw e.InnerException;
    }
  }
}
