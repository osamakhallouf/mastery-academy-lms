import Mux from "@mux/mux-node";

import { env } from "@/lib/env";

type MuxVideo = InstanceType<typeof Mux>["Video"];

/**
 * Lazy Mux Video client. Returns null if MUX_TOKEN_ID or MUX_TOKEN_SECRET
 * are not set (optional env), so routes can handle "video service not configured".
 */
let _video: MuxVideo | null = null;

export function getMuxVideo(): MuxVideo | null {
  if (_video) return _video;
  const tokenId = env.MUX_TOKEN_ID;
  const tokenSecret = env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) return null;
  const mux = new Mux(tokenId, tokenSecret);
  _video = mux.Video;
  return _video;
}
