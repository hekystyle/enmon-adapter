using System.ComponentModel.DataAnnotations;

namespace HekyLab.EnmonAdapter.Core;

public class MeterRegisterAttribute : RegularExpressionAttribute
{
  public MeterRegisterAttribute() : base("\\d+-\\d+\\.\\d+\\.\\d+") { }
}
