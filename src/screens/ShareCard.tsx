import { useEffect, useMemo, useRef, useState } from 'react';
import { Share2, Download, Image as ImageIcon, X, Clapperboard, Loader2 } from 'lucide-react';
import type { Activity } from '../lib/storage';
import {
  renderTransparentRoute, renderStoryCard, renderFlyoverFrame,
  recordFlyoverVideo, flyoverMime, GRADIENTS, BRAND,
  type CardBackground, type GradientId
} from '../lib/shareCard';
import { toast } from '../lib/toast';

type Mode = 'route' | 'card' | 'video';

/** Checkerboard so the transparent export actually *looks* transparent. */
const CHECKER: React.CSSProperties = {
  background: 'repeating-conic-gradient(#e7e5e0 0% 25%, #ffffff 0% 50%) 0 0 / 20px 20px'
};

/**
 * Share modal — exports an activity as a transparent route-outline PNG or a
 * 9:16 story card. Opens above ActivityDetail (itself a z-50 overlay).
 */
export default function ShareCard({
  activity, onClose, accent = BRAND
}: { activity: Activity; onClose: () => void; accent?: string }) {
  const hasRoute = activity.route.length > 1;
  const [mode, setMode] = useState<Mode>(hasRoute ? 'route' : 'card');
  const [routeColor, setRouteColor] = useState(accent);
  const [bg, setBg] = useState<CardBackground>({ type: 'gradient', id: 'orange' });
  const [canShare, setCanShare] = useState(false);
  const [videoPct, setVideoPct] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoUrl = useRef<string | null>(null);

  const ROUTE_COLORS = useMemo(() => [accent, '#FFFFFF', '#16181D'], [accent]);
  const videoSupported = useMemo(() => hasRoute && flyoverMime() !== null, [hasRoute]);

  // feature-detect file sharing (some browsers throw instead of returning false)
  useEffect(() => {
    try {
      const probe = new File([new Uint8Array(4)], 'probe.png', { type: 'image/png' });
      setCanShare(!!navigator.canShare?.({ files: [probe] }));
    } catch {
      setCanShare(false);
    }
  }, []);

  // re-render the preview whenever anything changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (mode === 'route') renderTransparentRoute(canvas, activity.route, routeColor);
    else if (mode === 'video') renderFlyoverFrame(canvas, activity, 0.62, accent);
    else renderStoryCard(canvas, activity, { background: bg, accent });
  }, [mode, routeColor, bg, activity, accent]);

  // release any picked-photo object URL when the modal unmounts
  useEffect(() => () => {
    if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
  }, []);

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
      photoUrl.current = url;
      setBg({ type: 'photo', image: img });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast("Couldn't load that image");
    };
    img.src = url;
  };

  const getBlob = () =>
    new Promise<Blob | null>((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve(null);
      canvas.toBlob((b) => resolve(b), 'image/png');
    });

  const fileName = () => `runner-${mode === 'route' ? 'route' : 'card'}-${activity.date.slice(0, 10)}.png`;

  const share = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const file = new File([blob], fileName(), { type: 'image/png' });
    try {
      await navigator.share({ files: [file], title: activity.name });
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') toast("Couldn't share image");
    }
  };

  const save = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName();
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast('Image saved');
  };

  const exportVideo = async () => {
    if (videoPct !== null) return;
    setVideoPct(0);
    try {
      const result = await recordFlyoverVideo(activity, {
        accent,
        onProgress: (p) => setVideoPct(Math.round(p * 100))
      });
      if (!result) {
        toast("This browser can't record video — try the story card instead");
        return;
      }
      const name = `runner-flyover-${activity.date.slice(0, 10)}.${result.ext}`;
      const file = new File([result.blob], name, { type: result.blob.type });
      // prefer the native share sheet (saves straight to Photos on mobile)
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: activity.name });
          return;
        } catch (err) {
          if ((err as Error)?.name === 'AbortError') return;
        }
      }
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 8000);
      toast('Flyover video saved');
    } catch {
      toast("Couldn't create the video");
    } finally {
      setVideoPct(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-[480px] p-5 space-y-4 shadow-sheet max-h-[92vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto sm:hidden" />
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Share</h2>
          <button onClick={onClose} className="p-1 -mr-1 text-dim hover:text-ink" aria-label="Close share">
            <X size={22} />
          </button>
        </div>

        {/* mode toggle */}
        <div className="card p-1 grid grid-cols-3 gap-1">
          <button
            onClick={() => setMode('route')}
            disabled={!hasRoute}
            title={hasRoute ? undefined : 'No GPS route on this activity'}
            className={`rounded-xl py-2 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              mode === 'route' ? 'bg-ink text-white' : 'text-dim hover:text-ink'
            }`}
          >
            Route PNG
          </button>
          <button
            onClick={() => setMode('card')}
            className={`rounded-xl py-2 text-xs font-bold transition-colors ${
              mode === 'card' ? 'bg-ink text-white' : 'text-dim hover:text-ink'
            }`}
          >
            Story card
          </button>
          <button
            onClick={() => setMode('video')}
            disabled={!videoSupported}
            title={videoSupported ? undefined : 'Video isn’t supported in this browser'}
            className={`rounded-xl py-2 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              mode === 'video' ? 'bg-ink text-white' : 'text-dim hover:text-ink'
            }`}
          >
            Flyover video
          </button>
        </div>

        {/* preview — checkerboard behind route mode makes transparency visible */}
        <div
          className="rounded-2xl border border-line overflow-hidden flex items-center justify-center max-h-[50vh] p-3"
          style={mode === 'route' ? CHECKER : { background: '#16181D' }}
        >
          <canvas
            ref={canvasRef}
            className="block"
            style={{ maxWidth: '100%', maxHeight: 'calc(50vh - 24px)', width: 'auto', height: 'auto' }}
          />
        </div>

        {/* mode-specific options */}
        {mode === 'video' ? (
          <p className="text-xs text-dim">
            A {activity.miles.toFixed(2)}-mi drone flyover of your route, counting up your
            distance, time and pace. Exports a 9:16 clip perfect for stories.
          </p>
        ) : mode === 'route' ? (
          <div className="flex items-center gap-3">
            <span className="label">Line color</span>
            <div className="flex gap-2">
              {ROUTE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setRouteColor(c)}
                  aria-label={`Route color ${c}`}
                  className={`w-9 h-9 rounded-full border border-line transition-shadow ${
                    routeColor === c ? 'ring-2 ring-offset-2 ring-brand' : ''
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="label">Background</span>
            <div className="flex gap-2 items-center">
              {(Object.keys(GRADIENTS) as GradientId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => setBg({ type: 'gradient', id })}
                  aria-label={`${id} background`}
                  className={`w-9 h-9 rounded-full border border-line transition-shadow ${
                    bg.type === 'gradient' && bg.id === id ? 'ring-2 ring-offset-2 ring-brand' : ''
                  }`}
                  style={{ background: `linear-gradient(135deg, ${GRADIENTS[id][0]}, ${GRADIENTS[id][1]})` }}
                />
              ))}
              <button
                onClick={() => fileRef.current?.click()}
                aria-label="Upload photo background"
                className={`w-9 h-9 rounded-full border border-line bg-paper text-dim hover:text-ink flex items-center justify-center ${
                  bg.type === 'photo' ? 'ring-2 ring-offset-2 ring-brand' : ''
                }`}
              >
                <ImageIcon size={16} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
            </div>
          </div>
        )}

        {/* actions */}
        {mode === 'video' ? (
          <button className="btn-primary w-full py-3" onClick={exportVideo} disabled={videoPct !== null}>
            {videoPct !== null ? (
              <><Loader2 size={18} className="animate-spin" /> Rendering… {videoPct}%</>
            ) : (
              <><Clapperboard size={18} /> Export flyover video</>
            )}
          </button>
        ) : (
          <div className="flex gap-2">
            {canShare && (
              <button className="btn-primary flex-1 py-3" onClick={share}>
                <Share2 size={18} /> Share
              </button>
            )}
            <button className={`${canShare ? 'btn-ghost' : 'btn-primary'} flex-1 py-3`} onClick={save}>
              <Download size={18} /> Save image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
