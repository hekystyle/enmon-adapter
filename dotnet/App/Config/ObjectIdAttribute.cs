using System.ComponentModel.DataAnnotations;

namespace HekyLab.EnmonAdapter.Config;

public class ObjectIdAttribute : RegularExpressionAttribute
{
  public ObjectIdAttribute() : base("[0-9a-f]{24}") { }
}
