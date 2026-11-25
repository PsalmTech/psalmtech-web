"use client";
import { useEffect, useState } from "react";

const SLIDES = [
  "/images/class1.jpg",
  "/images/cyber1.jpg",
  "/images/class3.jpg",
  "/images/powerbi.jpg",
  "/images/teach2.jpg",
  "/images/cyber2.jpg",
  "/images/help5.jpg",
  "/images/laptop4.jpg",
];

/** Faint, slowly cross-fading background photos behind the hero. */
export default function HeroSlideshow() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <div aria-hidden="true" className="absolute inset-0">
      {SLIDES.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" loading={i === 0 ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-in-out"
          style={{ opacity: i === idx ? 0.16 : 0 }} />
      ))}
    </div>
  );
}
