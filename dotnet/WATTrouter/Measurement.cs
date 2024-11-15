using System.ComponentModel.DataAnnotations;
using System.Xml;
using System.Xml.Serialization;

namespace WATTrouter;

public record Measurement
{
  /// <summary>
  /// Voltage on phase L1
  /// </summary>
  [Required]
  public int VAC { get; init; }

  public static Measurement Parse(string xml)
  {
    var serializer = new XmlSerializer(typeof(Measurement));
    using var reader = new StringReader(xml);
    try
    {
      return (Measurement?)serializer.Deserialize(reader) ?? throw new Exception("Invalid XML input: " + xml);
    }
    catch (InvalidOperationException e)
    {
      if (e.InnerException is XmlException) throw e.InnerException;
      throw;
    }
  }
}
