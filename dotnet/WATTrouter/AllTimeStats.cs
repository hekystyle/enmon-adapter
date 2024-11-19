using System.ComponentModel.DataAnnotations;
using System.Xml;
using System.Xml.Serialization;

namespace WATTrouter;

[XmlRoot("stat_alltime")]
public record AllTimeStats
{
  /// <summary>
  /// Surplus on phase L1+L2+L3 in kWh
  /// </summary>
  [Required]
  public double SAS4 { get; set; }

  /// <summary>
  /// Consumption in high tariff on phase L1+L2+L3 in kWh
  /// </summary>
  [Required]
  public double SAH4 { get; set; }

  /// <summary>
  /// Consumption in low tariff on phase L1+L2+L3 in kWh
  /// </summary>
  [Required]
  public double SAL4 { get; set; }

  /// <summary>
  /// Production on phase L1+L2+L3 in kWh
  /// </summary>
  [Required]
  public double SAP4 { get; set; }

  public static AllTimeStats Parse(Stream stream)
  {
    var serializer = new XmlSerializer(typeof(AllTimeStats));
    try
    {
      return (AllTimeStats?)serializer.Deserialize(stream) ?? throw new Exception("XML contains no element");
    }
    catch (InvalidOperationException e) when (e.InnerException is XmlException)
    {
      throw e.InnerException;
    }
  }
}
