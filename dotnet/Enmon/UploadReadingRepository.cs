using MongoDB.Entities;
using MongoDB.Driver;

namespace Enmon;

public class UploadReadingRepository()
{
  public async Task AddBulkAsync(IEnumerable<UploadReading> items)
  {
    await DB.SaveAsync(items);
  }

  public async Task<IAsyncCursor<UploadReading>> GetSorterCursorAsync()
  {
    return await DB.Find<UploadReading>().Sort(x => Prop.Path<UploadReading>(r => r.Reading.ReadAt)).ExecuteCursorAsync();
  }
}
