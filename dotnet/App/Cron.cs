namespace HekyLab.EnmonAdapter;

internal static class Cron
{
  public static string EveryNthMinute(int minute) => $"*/{minute} * * * *";
}
