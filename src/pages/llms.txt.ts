import type { APIRoute } from 'astro';
import { generarLlms } from '../lib/llms';

export const GET: APIRoute = async ({ site }) =>
  new Response(await generarLlms(site!, false), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
