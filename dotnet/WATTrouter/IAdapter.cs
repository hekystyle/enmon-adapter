namespace WATTrouter;

public record Values(AllTimeStats AllTimeStats, Measurement Measurement);

public interface IAdapter
{
    Task<Values> GetValues(Uri baseUrl);
}
