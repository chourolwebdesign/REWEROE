"use client";

import { useEffect, useRef } from "react";

/** Kleines Konfetti bei 4–5 Sternen (aus der Vorlage), einmal rund drei Sekunden; nicht bei reduzierter Bewegung. */
export function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const d = Math.min(devicePixelRatio || 1, 2);
    const fit = () => {
      canvas.width = innerWidth * d;
      canvas.height = innerHeight * d;
    };
    fit();
    addEventListener("resize", fit);
    const colors = ["#CC071E", "#E5B45C", "#22C55E", "#4285F4", "#F79009"];
    const bits = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height * 0.3,
      r: (Math.random() * 5 + 2.5) * d,
      v: (Math.random() * 2.2 + 1.1) * d,
      color: colors[Math.floor(Math.random() * colors.length)],
      a: Math.random() * 6,
      s: Math.random() * 0.1 + 0.04,
    }));
    let frame = 0;
    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = frame > 150 ? Math.max(0, (200 - frame) / 50) : 1;
      for (const b of bits) {
        ctx.beginPath();
        ctx.ellipse(b.x + Math.sin(b.a) * 11 * d, b.y, b.r * 0.5, b.r, b.a, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        b.y += b.v;
        b.a += b.s;
      }
      if (++frame < 200) raf = requestAnimationFrame(loop);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", fit);
    };
  }, []);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 h-full w-full" />;
}
