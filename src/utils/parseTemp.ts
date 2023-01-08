import { load } from 'cheerio';

export function parseTemperature(html: string): string | undefined {
  const $ = load(html);
  const [serializedValue] = $('#main > form > p:nth-child(3) > span').text().split(' ');
  return serializedValue;
}
