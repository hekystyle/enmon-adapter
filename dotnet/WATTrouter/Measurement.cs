using System.ComponentModel.DataAnnotations;
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
        return (Measurement)serializer.Deserialize(reader);
    }
}
