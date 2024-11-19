
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

public class ObjectIdAttribute : RegularExpressionAttribute
{
  public ObjectIdAttribute() : base("[0-9a-z]{24}") {}
}
