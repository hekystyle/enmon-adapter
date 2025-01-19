using System.ComponentModel.DataAnnotations;

namespace HekyLab.EnmonAdapter.Core;

public interface ITargetConfig : Enmon.ITarget
{
  [Required, MinLength(1)]
  string Id { get; }

  [Required]
  Enmon.Env Env { get; }
}
