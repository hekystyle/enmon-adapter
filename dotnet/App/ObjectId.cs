
using System.ComponentModel.DataAnnotations;

public class ObjectIdAttribute : RegularExpressionAttribute
{
  public ObjectIdAttribute() : base("[0-9a-f]{24}") {}
}
