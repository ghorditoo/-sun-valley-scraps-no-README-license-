"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Trash2,
  X,
  ImagePlus,
  Minus,
  Plus,
  RotateCw,
  Copy,
  Undo2,
  Box,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useBooking } from "@/components/booking/BookingContext";
import { materials } from "@/data/materials";
import type { Material, PlacedMaterialItem } from "@/lib/types";
import { Yard3DPreviewModal } from "./Yard3DPreviewModal";

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
  const [history, setHistory] = useState<PlacedMaterialItem[][]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [areaSqFt, setAreaSqFt] = useState(500);
  const [show3DPreview, setShow3DPreview] = useState(false);

  function commit(next: PlacedMaterialItem[]) {
    setHistory((prev) => [...prev, placedItems]);
    setPlacedItems(next);
  }

  function undo() {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setPlacedItems(last);
      return prev.slice(0, -1);
    });
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    if (selectedItemId) {
      setSelectedItemId(null);
      return;
    }
    if (!selectedMaterialId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    commit([
      ...placedItems,
      {
        id: `${selectedMaterialId}-${Date.now()}`,
        materialId: selectedMaterialId,
        xPct: Math.min(92, Math.max(0, xPct)),
        yPct: Math.min(88, Math.max(0, yPct)),
        widthPct: 16,
        rotationDeg: 0,
      },
    ]);
  }

  function updateItem(id: string, patch: Partial<PlacedMaterialItem>) {
    commit(placedItems.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    commit(placedItems.filter((item) => item.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  }

  function duplicateItem(item: PlacedMaterialItem) {
    const clone: PlacedMaterialItem = {
      ...item,
      id: `${item.materialId}-${Date.now()}`,
      xPct: Math.min(92, item.xPct + 6),
      yPct: Math.min(88, item.yPct + 6),
    };
    commit([...placedItems, clone]);
    setSelectedItemId(clone.id);
  }

  function clearPlan() {
    commit([]);
    setSelectedItemId(null);
  }

  const estimatedTotal = placedItems.reduce((sum, item) => {
    const material = materials.find((m) => m.id === item.materialId);
    if (!material) return sum;
    const shareSqFt = areaSqFt / Math.max(placedItems.length, 1);
    return sum + material.pricePerSqFt * shareSqFt;
  }, 0);

  function handleSendToBooking() {
    setShow3DPreview(false);
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
    <section id="visualizer" className="bg-orange-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">{t.visualizer.heading}</h2>
          <p className="mt-3 text-stone-600">{t.visualizer.subheading}</p>
        </div>

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
                  className="flex h-full w-full flex-col items-center justify-center gap-3 text-stone-500 hover:text-amber-700"
                >
                  <ImagePlus size={40} />
                  <span className="font-semibold">{t.visualizer.uploadCta}</span>
                  <span className="text-xs">{t.visualizer.uploadHint}</span>
                </button>
              )}

              {placedItems.map((item) => {
                const material = materials.find((m) => m.id === item.materialId);
                if (!material) return null;
                const isSelected = selectedItemId === item.id;
                return (
                  <motion.div
                    key={item.id}
                    drag
                    dragConstraints={canvasRef}
                    dragMomentum={false}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, rotate: item.rotationDeg }}
                    className={`group absolute flex items-center justify-center rounded-lg border-2 shadow-lg ${
                      isSelected ? "border-amber-500 ring-2 ring-amber-400" : "border-white/80"
                    }`}
                    style={{
                      left: `${item.xPct}%`,
                      top: `${item.yPct}%`,
                      width: `${item.widthPct}%`,
                      aspectRatio: "1 / 1",
                      backgroundColor: material.swatchColor,
                      backgroundImage: `url(${material.thumbnail})`,
                      backgroundSize: "cover",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemId(item.id);
                    }}
                  >
                    {isSelected && (
                      <div className="absolute -top-10 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-stone-900/90 px-1.5 py-1 shadow-xl">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateItem(item.id, { widthPct: Math.max(6, item.widthPct - 3) });
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-white hover:bg-white/20"
                          aria-label={t.visualizer.resize}
                        >
                          <Minus size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateItem(item.id, { widthPct: Math.min(45, item.widthPct + 3) });
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-white hover:bg-white/20"
                          aria-label={t.visualizer.resize}
                        >
                          <Plus size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateItem(item.id, { rotationDeg: (item.rotationDeg + 45) % 360 });
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-white hover:bg-white/20"
                          aria-label={t.visualizer.rotate}
                        >
                          <RotateCw size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateItem(item);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-white hover:bg-white/20"
                          aria-label={t.visualizer.duplicate}
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-white hover:bg-red-500/80"
                          aria-label={t.visualizer.removeItem}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    )}
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
              <p className="mt-2 text-xs text-stone-500">{t.visualizer.selectHint}</p>
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
                                ? "border-amber-600 bg-amber-50"
                                : "border-transparent bg-white hover:border-stone-300"
                            }`}
                          >
                            <MaterialThumb material={material} />
                            <span className="max-w-[80px] truncate text-[11px] text-stone-600">
                              {material.name}
                            </span>
                            <span className="text-[11px] font-semibold text-amber-700">
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
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div className="rounded-xl bg-amber-700 p-4 text-white">
              <p className="text-xs uppercase tracking-wide text-amber-100">
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
                onClick={() => setShow3DPreview(true)}
                disabled={placedItems.length === 0}
                className="flex items-center justify-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Box size={15} />
                {t.visualizer.preview3d}
              </button>
              <button
                onClick={handleSendToBooking}
                disabled={placedItems.length === 0}
                className="flex items-center justify-center gap-2 rounded-full bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Upload size={15} />
                {t.visualizer.sendToBooking}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={undo}
                  disabled={history.length === 0}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Undo2 size={14} />
                  {t.visualizer.undo}
                </button>
                <button
                  onClick={clearPlan}
                  className="flex-1 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:border-red-400 hover:text-red-600"
                >
                  {t.visualizer.clearPlan}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {show3DPreview && (
          <Yard3DPreviewModal
            photoDataUrl={photoDataUrl}
            placedItems={placedItems}
            onClose={() => setShow3DPreview(false)}
            onSendToBooking={handleSendToBooking}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

