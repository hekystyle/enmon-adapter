using System.Runtime.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Enmon;

[JsonConverter(typeof(StringEnumConverter))]
public enum Env
{
    [EnumMember(Value = "app")]
    App,
    [EnumMember(Value = "dev")]
    Dev,
}

public static class EnvExtensions
{
    public static string ToText(this Env env)
    {
        return JsonConvert.SerializeObject(env);
    }
}
