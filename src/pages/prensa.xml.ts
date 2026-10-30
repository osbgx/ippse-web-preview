import type { APIRoute } from 'astro';
import { feeds, itemsPrensa, respuestaRss } from '../lib/rss';

export const GET: APIRoute = async ({ site }) => respuestaRss(feeds.prensa, await itemsPrensa(site!), site!);
