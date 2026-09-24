"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Upload, Trash2, X, ImagePlus } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useBooking } from "@/components/booking/BookingContext";
import { materials } from "@/data/materials";
import type { Material, PlacedMaterialItem } from "@/lib/types";

const categories: Material["category"][] = ["pavers", "turf", "plants", "rock", "walls", "repairs", "minigolf"];

function MaterialThumb({ material }: { material: Material }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="h-12 w-12 rounded-lg border border-white/40"
        style={{ backgroundColor: material.swatchColor }}
      />
    );
  }
  return (
    <Image
      src={material.thumbnail}
      alt={material.name}
      width={48}
      height={48}
      className="h-12 w-12 rounded-lg object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export function YardVisualizer() {
  const { t } = useLanguage();
  const { openBooking } = useBooking();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<PlacedMaterialItem[]>([]);
  const [areaSqFt, setAreaSqFt] = useState(500);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!selectedMaterialId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    setPlacedItems((prev) => [
      ...prev,
      {
        id: `${selectedMaterialId}-${Date.now()}`,
        materialId: selectedMaterialId,
        xPct: Math.min(92, Math.max(0, xPct)),
        yPct: Math.min(88, Math.max(0, yPct)),
        widthPct: 16,
      },
    ]);
  }

  function removeItem(id: string) {
    setPlacedItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearPlan() {
    setPlacedItems([]);
  }

  const estimatedTotal = placedItems.reduce((sum, item) => {
    const material = materials.find((m) => m.id === item.materialId);
    if (!material) return sum;
    const shareSqFt = areaSqFt / Math.max(placedItems.length, 1);
    return sum + material.pricePerSqFt * shareSqFt;
  }, 0);

  function handleSendToBooking() {
    openBooking({
      service: "redesign",
      yardPlan: {
        photoDataUrl,
        areaSqFt,
        items: placedItems,
        estimatedTotal,
      },
    });
  }

  return (
    <section id="visualizer" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">{t.visualizer.heading}</h2>
          <p className="mt-3 text-stone-600">{t.visualizer.subheading}</p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* Canvas */}
          <div>
            <div
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="relative aspect-[4/3] w-full cursor-crosshair overflow-hidden rounded-2xl border-2 border-dashed border-stone-300 bg-stone-100"
            >
              {photoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoDataUrl} alt="Your yard" className="h-full w-full object-cover" />
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="flex h-full w-full flex-col items-center justify-center gap-3 text-stone-500 hover:text-emerald-700"
                >
                  <ImagePlus size={40} />
                  <span className="font-semibold">{t.visualizer.uploadCta}</span>
                  <span className="text-xs">{t.visualizer.uploadHint}</span>
                </button>
              )}

              {placedItems.map((item) => {
                const material = materials.find((m) => m.id === item.materialId);
                if (!material) return null;
                return (
                  <motion.div
                    key={item.id}
                    drag
                    dragConstraints={canvasRef}
                    dragMomentum={false}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="group absolute flex items-center justify-center rounded-lg border-2 border-white/80 shadow-lg"
                    style={{
                      left: `${item.xPct}%`,
                      top: `${item.yPct}%`,
                      width: `${item.widthPct}%`,
                      aspectRatio: "1 / 1",
                      backgroundColor: material.swatchColor,
                      backgroundImage: `url(${material.thumbnail})`,
                      backgroundSize: "cover",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-white text-stone-700 shadow group-hover:flex"
                      aria-label={t.visualizer.removeItem}
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />

            {photoDataUrl && (
              <p className="mt-2 text-xs text-stone-500">{t.visualizer.dropHint}</p>
            )}

            {/* Material Dock */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-stone-700">{t.visualizer.dockTitle}</h3>
              <div className="flex flex-col gap-4">
                {categories.map((category) => (
                  <div key={category}>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">
                      {t.visualizer.categories[category]}
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {materials
                        .filter((m) => m.category === category)
                        .map((material) => (
                          <button
                            key={material.id}
                            onClick={() => setSelectedMaterialId(material.id)}
                            className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border-2 p-2 transition ${
                              selectedMaterialId === material.id
                                ? "border-emerald-600 bg-emerald-50"
                                : "border-transparent bg-white hover:border-stone-300"
                            }`}
                          >
                            <MaterialThumb material={material} />
                            <span className="max-w-[80px] truncate text-[11px] text-stone-600">
                              {material.name}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-700">
                              ${material.pricePerSqFt}/ft²
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget Panel */}
          <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <div>
              <label className="text-sm font-medium text-stone-700">{t.visualizer.areaLabel}</label>
              <input
                type="number"
                min={50}
                step={10}
                value={areaSqFt}
                onChange={(e) => setAreaSqFt(Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="rounded-xl bg-emerald-700 p-4 text-white">
              <p className="text-xs uppercase tracking-wide text-emerald-100">
                {t.visualizer.budgetTitle}
              </p>
              <p className="mt-1 text-3xl font-bold">
                ${estimatedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                {t.visualizer.itemsPlaced} ({placedItems.length})
              </p>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
                {placedItems.map((item) => {
                  const material = materials.find((m) => m.id === item.materialId);
                  return (
                    <li key={item.id} className="flex items-center justify-between text-stone-600">
                      <span className="truncate">{material?.name}</span>
                      <button onClick={() => removeItem(item.id)} className="text-stone-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <button
                onClick={handleSendToBooking}
                disabled={placedItems.length === 0}
                className="flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Upload size={15} />
                {t.visualizer.sendToBooking}
              </button>
              <button
                onClick={clearPlan}
                className="rounded-full border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-600 hover:border-red-400 hover:text-red-600"
              >
                {t.visualizer.clearPlan}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
