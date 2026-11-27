import type { APIRoute } from 'astro';
import { portraitCard } from '../lib/portrait';

/** Link-preview image (Open Graph / X), 1200 × 630. */
export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await portraitCard(1200, 630)), {
    headers: { 'Content-Type': 'image/jpeg' },
  });
