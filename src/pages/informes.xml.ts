import type { APIRoute } from 'astro';
import { feeds, itemsInformes, respuestaRss } from '../lib/rss';

export const GET: APIRoute = async ({ site }) => respuestaRss(feeds.informes, await itemsInformes(site!), site!);
