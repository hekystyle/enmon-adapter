using HekyLab.EnmonAdapter.Enmon;
using System.ComponentModel.DataAnnotations;

namespace HekyLab.EnmonAdapter.Config;

internal record AppSettings
{
  public required IEnumerable<Source> Sources { get; init; }
  public required IEnumerable<Target> Targets { get; init; }
}

internal record Source
{
  /// <summary>
  /// Used to find measurements source implementation.
  /// </summary>
  public required string Id { get; set; }
  public required string Url { get; set; }
  /// <summary>
  /// IDs of targets where measurements data should be send to.
  /// </summary>
  public required IEnumerable<string> Targets { get; set; }
}

public record Target
{
  public required string Id { get; set; }

  [Required]
  public required Env Env { get; set; }

  [Required]
  [ObjectId]
  public required string CustomerId { get; set; }

  [Required]
  public required string DevEUI { get; set; }

  [Required]
  public required string Token { get; set; }
}
