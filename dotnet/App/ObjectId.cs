
using System.ComponentModel.DataAnnotations;

namespace HekyLab.EnmoNAdapter;

public class ObjectIdAttribute : RegularExpressionAttribute
{
  public ObjectIdAttribute() : base("[0-9a-f]{24}") { }
}
