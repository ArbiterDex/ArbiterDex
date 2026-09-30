"use client";

import { useEffect, useRef } from "react";
import { STOCK_ASSETS } from "@/config/assets";

/* Twinkling dust behind the "every venue" statement, with the real stock
   token logos drifting at different depths. */

function Dust({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let seed = 11;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const stars = Array.from({ length: 900 }, () => ({ x: rand(), y: rand(), r: rand() * 1.3 + 0.3, p: rand() * Math.PI * 2 }));
    let raf = 0;
    let t = 0;
    let visible = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.9 + s.p));
        ctx.fillStyle = `rgba(214, 238, 226, ${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    const loop = () => {
      if (visible) {
        t += 0.016;
        draw();
      }
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);
    if (reduce) draw();
    else raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);
  return <canvas ref={ref} aria-hidden="true" className={className} />;
}

// Fixed layout so server and client render the same positions.
const SPOTS = [
  [16, 12, 34], [31, 17, 22], [55, 11, 26], [74, 14, 18], [88, 22, 30], [8, 34, 26], [23, 44, 20], [42, 30, 16],
  [63, 31, 22], [81, 40, 40], [93, 50, 22], [12, 64, 34], [30, 70, 24], [47, 58, 18], [58, 72, 30], [72, 63, 20],
  [86, 74, 26], [20, 86, 18], [40, 88, 28], [66, 90, 20], [80, 86, 34], [6, 82, 16], [50, 8, 14], [96, 32, 16],
];

export function Starfield() {
  const logos = STOCK_ASSETS.slice(0, SPOTS.length);
  return (
    <section className="relative isolate overflow-hidden">
      <Dust className="absolute inset-0 -z-10 size-full opacity-80" />
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {logos.map((a, i) => {
          const [x, y, s] = SPOTS[i];
          return (
            <span
              key={a.symbol}
              className="absolute animate-float"
              style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i % 7) * -0.9}s`, opacity: s > 24 ? 0.95 : 0.55 }}
            >
              <img src={a.logo} alt="" width={s} height={s} className="rounded-full bg-white ring-2 ring-white/10" style={{ width: s, height: s }} />
            </span>
          );
        })}
      </div>
      <div className="wrap-land grid min-h-[680px] place-items-center py-24 text-center sm:min-h-[860px]">
        <div className="max-w-[860px] rounded-[24px] bg-night/40 px-2 py-6 backdrop-blur-[2px]">
          <h2 className="h-sec">Every Issuer. Every Venue. Fair Price.</h2>
          <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-[1.6] text-ink-2 sm:text-[18px]">
            Tokenized stocks, funds and dollars, priced across every pool that trades them and checked against the oracle before you sign.
          </p>
        </div>
      </div>
    </section>
  );
}
