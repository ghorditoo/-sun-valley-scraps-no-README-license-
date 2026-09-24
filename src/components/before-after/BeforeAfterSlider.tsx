"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { MoveHorizontal, ImageOff } from "lucide-react";
import type { BeforeAfterProject } from "@/data/projects";
import { useLanguage } from "@/i18n/LanguageProvider";

function ImageWithFallback({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-stone-200 text-stone-400">
        <ImageOff size={32} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export function BeforeAfterSlider({ project }: { project: BeforeAfterProject }) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(50); // percentage 0-100
  const clipPath = useTransform(x, (v) => `inset(0 ${100 - v}% 0 0)`);
  const handleLeft = useTransform(x, (v) => `${v}%`);
  const [dragging, setDragging] = useState(false);

  function updateFromClientX(clientX: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    x.set(Math.min(100, Math.max(0, pct)));
  }

  function handlePointerDown(e: React.PointerEvent) {
    setDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    updateFromClientX(e.clientX);
  }

  function handlePointerUp() {
    setDragging(false);
  }

  function resetSweep() {
    animate(x, 50, { duration: 0.6, ease: "easeInOut" });
  }

  return (
    <div className="group">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDoubleClick={resetSweep}
        className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-2xl bg-stone-200 shadow-lg"
      >
        {/* After image (base layer) */}
        <div className="absolute inset-0">
          <ImageWithFallback src={project.afterSrc} alt={`${project.titleKey} - ${t.beforeAfter.after}`} />
          <span className="absolute right-3 top-3 rounded-full bg-brand-700/90 px-3 py-1 text-xs font-semibold text-white">
            {t.beforeAfter.after}
          </span>
        </div>

        {/* Before image (clipped, cinematic wipe) */}
        <motion.div className="absolute inset-0" style={{ clipPath }}>
          <ImageWithFallback src={project.beforeSrc} alt={`${project.titleKey} - ${t.beforeAfter.before}`} />
          <span className="absolute left-3 top-3 rounded-full bg-stone-900/80 px-3 py-1 text-xs font-semibold text-white">
            {t.beforeAfter.before}
          </span>
        </motion.div>

        {/* Handle */}
        <motion.div
          className="absolute top-0 h-full w-0.5 bg-white shadow-[0_0_0_2px_rgba(0,0,0,0.15)]"
          style={{ left: handleLeft }}
        >
          <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-stone-700 shadow-md transition group-hover:scale-110">
            <MoveHorizontal size={18} />
          </div>
        </motion.div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-800">{project.titleKey}</h3>
        <span className="text-xs text-stone-500">{t.beforeAfter.dragHint}</span>
      </div>
    </div>
  );
}

