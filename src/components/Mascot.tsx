import { useState } from 'react';

/**
 * Ptak — Runner's green Quaker-parrot coach. 🦜
 *
 * Art is served from the image CDN it was generated on (transparent PNG
 * cutouts). If it can't load, callers get a graceful `fallback`. To make the
 * mascot fully offline/permanent later, drop the PNGs in public/mascot/ and
 * point these URLs at `${import.meta.env.BASE_URL}mascot/<pose>.png`.
 *
 *  - coach: standing, thumbs-up   → workout finish + Home dashboard
 *  - wave:  mid-stride, wing up    → daily quote
 */
export type MascotPose = 'coach' | 'wave';

const SRC: Record<MascotPose, string> = {
  coach: 'https://d8j0ntlcm91z4.cloudfront.net/user_3ASOSuQ2tddjxNl9PgtieUhFQWH/hf_20260704_043141_27560f03-ac58-4d7f-93f6-5563ca462a46.png',
  wave: 'https://d8j0ntlcm91z4.cloudfront.net/user_3ASOSuQ2tddjxNl9PgtieUhFQWH/hf_20260704_043150_93a92010-a55e-452d-9b96-51a91fe05239.png'
};

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
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;

  return (
    <img
      src={SRC[pose]}
      alt="Ptak, your running coach"
      width={size}
      height={size}
      className={`object-contain select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
