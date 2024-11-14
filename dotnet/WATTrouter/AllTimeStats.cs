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

    public static AllTimeStats Parse(string xml)
    {
        var serializer = new XmlSerializer(typeof(AllTimeStats));
        using var reader = new StringReader(xml);
        try
        {
            return (AllTimeStats?)serializer.Deserialize(reader) ?? throw new Exception("Invalid XML input: " + xml);
        }
        catch (InvalidOperationException e)
        {
            if (e.InnerException is XmlException) throw e.InnerException;
            throw;
        }
    }
}
