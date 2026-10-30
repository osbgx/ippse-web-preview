import type { APIRoute } from 'astro';
import { feeds, itemsInformes, itemsPrensa, respuestaRss } from '../lib/rss';

export const GET: APIRoute = async ({ site }) =>
  respuestaRss(feeds.global, [...(await itemsInformes(site!)), ...(await itemsPrensa(site!))], site!);
