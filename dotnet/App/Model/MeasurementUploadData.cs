using MongoDB.Entities;

namespace HekyLab.EnmonAdapter.Model;

internal class MeasurementUploadData : Entity
{
  public required Measurement Measurement { get; set; }
  public required string TargetId { get; set; }
}
