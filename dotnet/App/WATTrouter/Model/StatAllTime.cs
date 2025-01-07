using System.ComponentModel.DataAnnotations;
using System.Xml;
using System.Xml.Serialization;

namespace HekyLab.EnmonAdapter.WATTrouter.Model;

[XmlRoot("stat_alltime")]
public record StatAllTime
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

  public static StatAllTime Parse(Stream stream)
  {
    var serializer = new XmlSerializer(typeof(StatAllTime));
    try
    {
      return (StatAllTime?)serializer.Deserialize(stream) ?? throw new Exception("XML contains no element");
    }
    catch (InvalidOperationException e) when (e.InnerException is XmlException)
    {
      throw e.InnerException;
    }
  }
}
