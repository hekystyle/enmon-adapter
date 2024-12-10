using System.Text;
using System.Xml;
using HekyLab.EnmonAdapter.WATTrouter;

public class AllTimeStatsTests
{
  [Fact]
  public void Parse_ValidXmlFromFile_ReturnsAllTimeStats()
  {
    var stream = File.OpenRead(Path.Combine("__fixtures__", "stat_alltime.xml"));
    var result = AllTimeStats.Parse(stream);

    Assert.NotNull(result);
    Assert.Equal(1476.53, result.SAS4);
    Assert.Equal(5276.82, result.SAH4);
    Assert.Equal(11574.53, result.SAL4);
    Assert.Equal(22330.82, result.SAP4);
  }

  [Fact]
  public void Parse_InvalidXmlFromFile_ThrowsException()
  {
    var stream = new MemoryStream(Encoding.UTF8.GetBytes("<root</root>"));

    var exception = Assert.Throws<XmlException>(() => AllTimeStats.Parse(stream));

    Assert.Equal("The '<' character, hexadecimal value 0x3C, cannot be included in a name. Line 1, position 6.", exception.Message);
    Assert.Equal(1, exception.LineNumber);
    Assert.Equal(6, exception.LinePosition);
  }

  [Fact]
  public void Parse_EmptyXmlFile_ThrowsException()
  {
    var stream = new MemoryStream(Encoding.UTF8.GetBytes(""));

    var exception = Assert.Throws<XmlException>(() => AllTimeStats.Parse(stream));

    Assert.Equal("Root element is missing.", exception.Message);
    Assert.Equal(0, exception.LineNumber);
    Assert.Equal(0, exception.LinePosition);
  }
}