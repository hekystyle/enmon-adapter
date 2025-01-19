using HekyLab.EnmonAdapter.Model;
using Microsoft.EntityFrameworkCore;

namespace HekyLab.EnmonAdapter;

internal class AppDbContext(DbContextOptions options) : DbContext(options)
{
  public DbSet<MeasurementUploadInstruction> Measurements { get; init; }
}
