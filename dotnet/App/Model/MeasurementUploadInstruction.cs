using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;

namespace HekyLab.EnmonAdapter.Model;

internal record MeasurementUploadInstruction
{
  public ObjectId Id { get; set; }

  [Required]
  public required Measurement Measurement { get; set; }

  [Required, MinLength(1)]
  public required string TargetId { get; set; }
}
