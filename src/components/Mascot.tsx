import { useState } from 'react';

/**
 * Ptak — Runner's green Quaker-parrot coach. 🦜
 *
 * Source resolution, in order: a committed local asset (public/mascot/…),
 * else the Higgsfield CDN the art was generated on, else a graceful hide
 * (callers render their own fallback). Keeping the CDN URL means the mascot
 * works the instant it's deployed; dropping the PNG into public/mascot/
 * later makes it fully offline + permanent with no code change.
 */
export type MascotPose = 'coach';

// Generated art (Higgsfield). Swap the URL, or add public/mascot/coach.png.
const CDN: Record<MascotPose, string> = {
  coach: 'https://d8j0ntlcm91z4.cloudfront.net/user_3ASOSuQ2tddjxNl9PgtieUhFQWH/hf_20260704_041809_52a3a8f6-85fa-4a78-93c7-bdb4c1a52642.png'
};

const LOCAL = (pose: MascotPose) => `${import.meta.env.BASE_URL}mascot/${pose}.png`;

export default function Mascot({
  pose = 'coach',
  size = 96,
  className = '',
  fallback = null
}: {
  pose?: MascotPose;
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
}) {
  // 0 = try local file, 1 = try CDN, 2 = give up
  const [stage, setStage] = useState(0);

  if (stage >= 2) return <>{fallback}</>;

  const src = stage === 0 ? LOCAL(pose) : CDN[pose];
  return (
    <img
      src={src}
      alt="Ptak, your running coach"
      width={size}
      height={size}
      className={`object-contain select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
      onError={() => setStage((s) => s + 1)}
    />
  );
}
