namespace Enmon;

public interface IUploadJobQueue
{
  Task Push(IEnumerable<UploadReading> uploadJobs);

  Task ScheduleInstantProcessing();
}
