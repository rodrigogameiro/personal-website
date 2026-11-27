import type { APIRoute, GetStaticPaths } from 'astro';
import { croppedPortrait, portraitRatios, type PortraitRatio } from '../../lib/portrait';

/** Plain portrait crops referenced from the Person structured data on the home page. */
export const getStaticPaths = (() =>
  (Object.keys(portraitRatios) as PortraitRatio[]).map((ratio) => ({
    params: { name: `rodrigo-gameiro-${ratio}` },
    props: { ratio },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const body = await croppedPortrait((props as { ratio: PortraitRatio }).ratio);
  return new Response(new Uint8Array(body), { headers: { 'Content-Type': 'image/jpeg' } });
};
