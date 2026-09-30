"use client";

import { useEffect, useRef } from "react";

/**
 * A slowly turning sphere of sage points. It pauses when off screen and
 * draws a single still frame for visitors who prefer reduced motion.
 */
export function ParticleGlobe({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Points on a thick shell, denser at the rim like a dust halo.
    const N = 2600;
    const pts: { x: number; y: number; z: number; s: number }[] = [];
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < N; i++) {
      const u = rand() * 2 - 1;
      const t = rand() * Math.PI * 2;
      const r = 0.86 + Math.pow(rand(), 0.35) * 0.14;
      const k = Math.sqrt(1 - u * u);
      pts.push({ x: k * Math.cos(t) * r, y: u * r, z: k * Math.sin(t) * r, s: rand() });
    }

    let angle = 0;
    let raf = 0;
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
      const R = Math.min(w, h) * 0.47;
      const cx = w / 2;
      const cy = h / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      for (const p of pts) {
        const x = p.x * cos - p.z * sin;
        const z = p.x * sin + p.z * cos;
        const depth = (z + 1) / 2;
        const alpha = 0.12 + depth * 0.75;
        const size = 0.6 + depth * 1.1 + p.s * 0.5;
        ctx.fillStyle = `rgba(${170 + Math.round(p.s * 60)}, 225, 200, ${alpha.toFixed(3)})`;
        ctx.fillRect(cx + x * R, cy + p.y * R, size, size);
      }
    };

    const loop = () => {
      if (visible) {
        angle += 0.0016;
        draw();
      }
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    if (reduce) draw();
    else raf = requestAnimationFrame(loop);
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
