"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { X, Upload } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useTilt3D } from "@/lib/useTilt3D";
import { materials } from "@/data/materials";
import type { PlacedMaterialItem } from "@/lib/types";

export function Yard3DPreviewModal({
  photoDataUrl,
  placedItems,
  onClose,
  onSendToBooking,
}: {
  photoDataUrl: string | null;
  placedItems: PlacedMaterialItem[];
  onClose: () => void;
  onSendToBooking: () => void;
}) {
  const { t } = useLanguage();
  const { ref, rotateX, rotateY, handleMouseMove, handleMouseLeave } = useTilt3D(8);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4"
    >
      <button
        onClick={onClose}
        className="absolute right-5 top-5 text-white/80 hover:text-white"
        aria-label={t.visualizer.close}
      >
        <X size={28} />
      </button>

      <div className="flex w-full max-w-3xl flex-col items-center gap-5" onClick={(e) => e.stopPropagation()}>
        <div className="text-center text-white">
          <h3 className="text-2xl font-bold">{t.visualizer.preview3dTitle}</h3>
          <p className="mt-1 text-sm text-stone-300">{t.visualizer.preview3dHint}</p>
        </div>

        <div style={{ perspective: 1200 }} className="w-full">
          <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl"
          >
            {photoDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoDataUrl}
                alt="Your yard design"
                style={{ transform: "translateZ(0px)" }}
                className="h-full w-full object-cover"
              />
            )}
            {placedItems.map((item) => {
              const material = materials.find((m) => m.id === item.materialId);
              if (!material) return null;
              return (
                <div
                  key={item.id}
                  className="absolute rounded-lg border-2 border-white/80 shadow-lg"
                  style={{
                    left: `${item.xPct}%`,
                    top: `${item.yPct}%`,
                    width: `${item.widthPct}%`,
                    aspectRatio: "1 / 1",
                    backgroundColor: material.swatchColor,
                    backgroundImage: `url(${material.thumbnail})`,
                    backgroundSize: "cover",
                    transform: `rotate(${item.rotationDeg}deg) translateZ(30px)`,
                  }}
                />
              );
            })}
          </motion.div>
        </div>

        <button
          onClick={onSendToBooking}
          className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          <Upload size={15} />
          {t.visualizer.sendToBooking}
        </button>
      </div>
    </motion.div>
  );
}
