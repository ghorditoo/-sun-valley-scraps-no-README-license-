"use client";

import Image from "next/image";
import { motion, useTransform } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { showcasePhotos } from "@/data/showcasePhotos";
import { useTilt3D } from "@/lib/useTilt3D";

// A curated subset keeps the 3D tilt row fast; the rest live in the full gallery below.
const CURATED_COUNT = 9;

function TiltCard({ src }: { src: string; index: number }) {
  const { ref, rotateX, rotateY, handleMouseMove, handleMouseLeave } = useTilt3D();
  const glareX = useTransform(rotateY, [-12, 12], ["0%", "100%"]);

  return (
    <div style={{ perspective: 1000 }} className="w-64 shrink-0 snap-center sm:w-72">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative aspect-[3/4] cursor-grab overflow-hidden rounded-2xl shadow-2xl active:cursor-grabbing"
      >
        <Image
          src={src}
          alt="Completed Sun Valley Scraps project"
          fill
          sizes="288px"
          style={{ transform: "translateZ(20px)" }}
          className="object-cover"
        />
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent opacity-40"
          style={{ left: glareX }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </motion.div>
    </div>
  );
}

export function Cinematic3DShowcase() {
  const { t } = useLanguage();
  const curated = showcasePhotos.slice(0, CURATED_COUNT);

  return (
    <section className="overflow-hidden bg-stone-950 py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{t.showcase3d.heading}</h2>
          <p className="mt-3 text-stone-300">{t.showcase3d.subheading}</p>
          <p className="mt-2 text-xs uppercase tracking-wide text-emerald-400">{t.showcase3d.hint}</p>
        </div>
      </div>

      <div className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6 sm:px-[max(1.5rem,calc((100vw-80rem)/2))]">
        {curated.map((photo, i) => (
          <TiltCard key={photo.id} src={photo.src} index={i} />
        ))}
      </div>

      <div className="mx-auto mt-4 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <a
          href="#gallery-full"
          className="inline-block text-sm font-semibold text-emerald-400 underline underline-offset-4 hover:text-emerald-300"
        >
          {t.showcase3d.viewGallery}
        </a>
      </div>
    </section>
  );
}
