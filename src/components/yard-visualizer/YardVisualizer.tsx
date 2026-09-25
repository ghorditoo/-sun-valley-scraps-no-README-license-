"use client";

import { useRef, useState } from "react";
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
  Search,
  Fence,
  Flag,
  Flame,
  Lightbulb,
  Droplets,
  Sun,
  Wrench,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useBooking } from "@/components/booking/BookingContext";
import { materials } from "@/data/materials";
import type { Material, MaterialCategory, MaterialVisual, PlacedMaterialItem } from "@/lib/types";
import { Yard3DPreviewModal } from "./Yard3DPreviewModal";

const categories: MaterialCategory[] = [
  "pavers",
  "stone",
  "ground",
  "turf",
  "plants",
  "walls",
  "structures",
  "cooking",
  "fireWater",
  "lighting",
  "recreation",
];

const categoryIcons: Record<MaterialCategory, typeof Fence> = {
  pavers: Fence,
  stone: Sun,
  ground: Wrench,
  turf: Flag,
  plants: Sun,
  walls: Fence,
  structures: Fence,
  cooking: Flame,
  fireWater: Droplets,
  lighting: Lightbulb,
  recreation: Flag,
};

const visualIcons: Record<MaterialVisual, typeof Fence> = {
  paver: Fence,
  brick: Fence,
  stone: Sun,
  gravel: Sun,
  soil: Wrench,
  grass: Flag,
  plant: Sun,
  wall: Fence,
  pergola: Fence,
  shade: Sun,
  kitchen: Flame,
  fire: Flame,
  water: Droplets,
  light: Lightbulb,
  play: Flag,
};

function MaterialThumb({ material }: { material: Material }) {
  const Icon = visualIcons[material.visual];

  return (
    <span
      className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/10 shadow-inner"
      style={{ backgroundColor: material.swatchColor, backgroundImage: material.texture }}
    >
      <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/20" />
      <Icon className="relative text-white drop-shadow-md" size={22} strokeWidth={1.8} />
    </span>
  );
}

export function YardVisualizer() {
  const { t, locale } = useLanguage();
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
  const [activeCategory, setActiveCategory] = useState<MaterialCategory | "all">("all");
  const [materialQuery, setMaterialQuery] = useState("");

  const selectedMaterial = materials.find((material) => material.id === selectedMaterialId);
  const normalizedQuery = materialQuery.trim().toLocaleLowerCase();
  const filteredMaterials = materials.filter((material) => {
    const inCategory = activeCategory === "all" || material.category === activeCategory;
    const localizedName = locale === "es" ? material.nameEs : material.name;
    return inCategory && (!normalizedQuery || localizedName.toLocaleLowerCase().includes(normalizedQuery));
  });

  function materialName(material: Material) {
    return locale === "es" ? material.nameEs : material.name;
  }

  function formatMaterialPrice(material: Material) {
    return `$${material.price.toLocaleString()} ${t.visualizer.priceUnits[material.priceUnit]}`;
  }

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
    if (selectedItemId && !selectedMaterial) {
      setSelectedItemId(null);
      return;
    }
    if (!selectedMaterial || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    const newItemId = `${selectedMaterial.id}-${Date.now()}`;
    commit([
      ...placedItems,
      {
        id: newItemId,
        materialId: selectedMaterial.id,
        xPct: Math.min(92, Math.max(0, xPct)),
        yPct: Math.min(88, Math.max(0, yPct)),
        widthPct: selectedMaterial.defaultWidthPct,
        rotationDeg: 0,
      },
    ]);
    setSelectedItemId(newItemId);
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
    if (material.priceUnit === "each") return sum + material.price;
    if (material.priceUnit === "linearFt") {
      const estimatedLength = Math.sqrt(areaSqFt) * (item.widthPct / 18);
      return sum + material.price * estimatedLength;
    }
    const footprintShare = Math.min(0.5, Math.max(0.04, (item.widthPct / 100) ** 2 * 4));
    return sum + material.price * areaSqFt * footprintShare;
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
    <section id="visualizer" className="bg-white py-16">
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
                  className="flex h-full w-full flex-col items-center justify-center gap-3 text-stone-500 hover:text-brand-700"
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
                const MaterialIcon = visualIcons[material.visual];
                return (
                  <motion.div
                    key={item.id}
                    drag
                    dragConstraints={canvasRef}
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                      if (!canvasRef.current) return;
                      const bounds = canvasRef.current.getBoundingClientRect();
                      updateItem(item.id, {
                        xPct: Math.min(94, Math.max(0, item.xPct + (info.offset.x / bounds.width) * 100)),
                        yPct: Math.min(92, Math.max(0, item.yPct + (info.offset.y / bounds.height) * 100)),
                      });
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, rotate: item.rotationDeg }}
                    className={`group absolute flex items-center justify-center rounded-lg border-2 shadow-lg ${
                      isSelected ? "border-brand-500 ring-2 ring-brand-400" : "border-white/80"
                    }`}
                    style={{
                      left: `${item.xPct}%`,
                      top: `${item.yPct}%`,
                      width: `${item.widthPct}%`,
                      aspectRatio: material.aspectRatio,
                      backgroundColor: material.swatchColor,
                      backgroundImage: material.texture,
                      backgroundSize: "cover",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemId(item.id);
                    }}
                  >
                    {material.placement === "object" && (
                      <MaterialIcon className="pointer-events-none text-white/90 drop-shadow-lg" size="38%" strokeWidth={1.5} />
                    )}
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

            {selectedMaterial && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm text-brand-900">
                <MaterialThumb material={selectedMaterial} />
                <div className="min-w-0">
                  <p className="font-semibold">{t.visualizer.selectedMaterial}: {materialName(selectedMaterial)}</p>
                  <p className="text-xs text-brand-700">{t.visualizer.placeHint}</p>
                </div>
              </div>
            )}

            {/* Material Dock */}
            <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-800">{t.visualizer.dockTitle}</h3>
                  <p className="text-xs text-stone-500">{materials.length} {t.visualizer.inventoryCount}</p>
                </div>
                <label className="relative block sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="search"
                    value={materialQuery}
                    onChange={(event) => setMaterialQuery(event.target.value)}
                    placeholder={t.visualizer.searchMaterials}
                    className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  />
                </label>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeCategory === "all" ? "border-brand-700 bg-brand-700 text-white" : "border-stone-300 bg-white text-stone-600 hover:border-brand-400"}`}
                >
                  <Box size={14} />
                  {t.visualizer.allMaterials}
                </button>
                {categories.map((category) => {
                  const CategoryIcon = categoryIcons[category];
                  return (
                    <button
                      type="button"
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeCategory === category ? "border-brand-700 bg-brand-700 text-white" : "border-stone-300 bg-white text-stone-600 hover:border-brand-400"}`}
                    >
                      <CategoryIcon size={14} />
                      {t.visualizer.categories[category]}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 grid max-h-[430px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 xl:grid-cols-4">
                {filteredMaterials.map((material) => (
                  <button
                    type="button"
                    key={material.id}
                    onClick={() => setSelectedMaterialId(material.id)}
                    className={`flex min-h-24 items-center gap-3 rounded-lg border p-2.5 text-left transition ${
                      selectedMaterialId === material.id
                        ? "border-brand-600 bg-brand-50 shadow-[0_0_0_2px_rgba(5,150,105,0.12)]"
                        : "border-stone-200 bg-white hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm"
                    }`}
                  >
                    <MaterialThumb material={material} />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold leading-tight text-stone-800">{materialName(material)}</span>
                      <span className="mt-1 block text-[11px] font-medium text-brand-700">{formatMaterialPrice(material)}</span>
                    </span>
                  </button>
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
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div className="rounded-xl bg-brand-700 p-4 text-white">
              <p className="text-xs uppercase tracking-wide text-brand-100">
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
                      <span className="truncate">{material ? materialName(material) : ""}</span>
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
                className="flex items-center justify-center gap-2 rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-40"
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


