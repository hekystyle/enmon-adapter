using System.ComponentModel.DataAnnotations;
using System.Xml;
using System.Xml.Serialization;

namespace HekyLab.EnmonAdapter.WATTrouter.Model;

[XmlRoot("meas")]
public record Meas
{
  /// <summary>
  /// Voltage on phase L1
  /// </summary>
  [Required]
  public int VAC { get; init; }

  public static Meas Parse(Stream stream)
  {
    var serializer = new XmlSerializer(typeof(Meas));
    try
    {
      return (Meas?)serializer.Deserialize(stream) ?? throw new Exception("Provided XML contains no element");
    }
    catch (InvalidOperationException e) when (e.InnerException is XmlException)
    {
      throw e.InnerException;
    }
  }
}
