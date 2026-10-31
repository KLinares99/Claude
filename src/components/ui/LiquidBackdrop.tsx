/** Fixed, accent-tinted mesh behind the app — gives the glass something to
 *  refract. Purely decorative (see .liquid-bg in index.css). */
export default function LiquidBackdrop() {
  return (
    <div className="liquid-bg" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
