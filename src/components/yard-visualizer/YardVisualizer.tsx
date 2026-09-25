"use client";

import { useEffect, useRef, useState } from "react";
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
  Camera,
  Ruler,
  ScanLine,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useBooking } from "@/components/booking/BookingContext";
import { materials } from "@/data/materials";
import type {
  Material,
  MaterialCategory,
  MaterialVisual,
  PlacedMaterialItem,
  YardDesignMode,
  YardMeasurements,
  YardScanPoint,
} from "@/lib/types";
import { Yard3DPreviewModal } from "./Yard3DPreviewModal";
import { VirtualYardBackdrop, type VirtualBackdrop } from "./VirtualYardBackdrop";

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
  "poolParts",
  "building",
  "furniture",
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
  poolParts: Droplets,
  building: Fence,
  furniture: Box,
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
  pool: Droplets,
  house: Fence,
  furniture: Box,
};

function MaterialThumb({ material }: { material: Material }) {
  const Icon = visualIcons[material.visual];

  return (
    <span
      data-visual={material.visual}
      className="material-chip relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/10 shadow-inner"
      style={{ backgroundColor: material.swatchColor, backgroundImage: material.texture }}
    >
      <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/20" />
      <Icon className="material-icon relative text-white drop-shadow-md" size={22} strokeWidth={1.8} />
    </span>
  );
}

export function YardVisualizer() {
  const { t, locale } = useLanguage();
  const { openBooking } = useBooking();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<PlacedMaterialItem[]>([]);
  const [history, setHistory] = useState<PlacedMaterialItem[][]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [areaSqFt, setAreaSqFt] = useState(500);
  const [show3DPreview, setShow3DPreview] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MaterialCategory | "all">("all");
  const [materialQuery, setMaterialQuery] = useState("");
  const [designMode, setDesignMode] = useState<YardDesignMode>("virtual");
  const [virtualBackdrop, setVirtualBackdrop] = useState<VirtualBackdrop>("desert");
  const [cameraStatus, setCameraStatus] = useState<"idle" | "starting" | "ready" | "denied">("idle");
  const [isTracing, setIsTracing] = useState(false);
  const [scanPoints, setScanPoints] = useState<YardScanPoint[]>([]);
  const [measurements, setMeasurements] = useState<YardMeasurements>({
    yardLengthFt: 25,
    yardWidthFt: 20,
    houseWidthFt: 18,
    houseDepthFt: 10,
    exteriorColor: "#d6c3a1",
  });
  const [buildMode, setBuildMode] = useState<"quick" | "piece">("piece");

  useEffect(() => {
    if (cameraStatus === "ready" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play();
    }
  }, [cameraStatus, designMode]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const selectedMaterial = materials.find((material) => material.id === selectedMaterialId);
  const selectedPlacedItem = placedItems.find((item) => item.id === selectedItemId);
  const selectedPlacedMaterial = materials.find((material) => material.id === selectedPlacedItem?.materialId);
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
    reader.onload = () => {
      setPhotoDataUrl(reader.result as string);
      setDesignMode("photo");
    };
    reader.readAsDataURL(file);
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraStatus("idle");
    setIsTracing(false);
  }

  function selectDesignMode(mode: YardDesignMode) {
    if (mode !== "camera") stopCamera();
    setDesignMode(mode);
  }

  async function startCamera() {
    setDesignMode("camera");
    setCameraStatus("starting");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("denied");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      setCameraStatus("ready");
    } catch {
      setCameraStatus("denied");
    }
  }

  function updateMeasurement(key: keyof YardMeasurements, value: string) {
    setMeasurements((current) => {
      const next = key === "exteriorColor"
        ? { ...current, exteriorColor: value }
        : { ...current, [key]: Math.max(1, Number(value) || 1) };
      if (key === "yardLengthFt" || key === "yardWidthFt") {
        setAreaSqFt(next.yardLengthFt * next.yardWidthFt);
      }
      return next;
    });
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const rawXPct = ((e.clientX - rect.left) / rect.width) * 100;
    const rawYPct = ((e.clientY - rect.top) / rect.height) * 100;
    const xPct = buildMode === "piece" ? Math.round(rawXPct / 5) * 5 : rawXPct;
    const yPct = buildMode === "piece" ? Math.round(rawYPct / 5) * 5 : rawYPct;

    if (designMode === "camera" && isTracing) {
      setScanPoints((points) => [...points, { xPct, yPct }]);
      return;
    }

    if (selectedItemId && !selectedMaterial) {
      setSelectedItemId(null);
      return;
    }
    if (!selectedMaterial) return;

    const newItemId = `${selectedMaterial.id}-${Date.now()}`;
    commit([
      ...placedItems,
      {
        id: newItemId,
        materialId: selectedMaterial.id,
        xPct: Math.min(92, Math.max(0, xPct)),
        yPct: Math.min(88, Math.max(0, yPct)),
        widthPct: buildMode === "piece"
          ? selectedMaterial.buildPiece === "tile"
            ? 10
            : selectedMaterial.buildPiece === "edge"
              ? 15
              : Math.min(18, selectedMaterial.defaultWidthPct)
          : selectedMaterial.defaultWidthPct,
        rotationDeg: 0,
        colorOverride: selectedMaterial.swatchColor,
        elevationFt: 0,
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
        designMode,
        virtualBackdrop,
        scanPoints,
        measurements,
        buildMode,
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
            <div className="mb-3 flex flex-col gap-3 rounded-lg border border-cyan-200/60 bg-[linear-gradient(135deg,rgba(236,254,255,0.92),rgba(240,253,244,0.96))] p-3 shadow-[0_10px_30px_-22px_rgba(8,145,178,0.75)] sm:flex-row sm:items-center sm:justify-between">
              <div className="grid grid-cols-2 rounded-lg border border-cyan-200 bg-white/80 p-1 shadow-inner sm:flex">
                <button
                  type="button"
                  onClick={() => selectDesignMode("virtual")}
                  className={`rounded-md px-3 py-2 text-xs font-semibold transition ${designMode === "virtual" ? "bg-brand-700 text-white shadow" : "text-stone-600 hover:bg-cyan-50"}`}
                >
                  {t.visualizer.virtualMode}
                </button>
                <button
                  type="button"
                  onClick={() => photoDataUrl ? selectDesignMode("photo") : fileInputRef.current?.click()}
                  className={`rounded-md px-3 py-2 text-xs font-semibold transition ${designMode === "photo" ? "bg-brand-700 text-white shadow" : "text-stone-600 hover:bg-cyan-50"}`}
                >
                  {t.visualizer.photoMode}
                </button>
                <button
                  type="button"
                  onClick={() => void startCamera()}
                  className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${designMode === "camera" ? "bg-brand-700 text-white shadow" : "text-stone-600 hover:bg-cyan-50"}`}
                >
                  <Camera size={14} />
                  {t.visualizer.cameraMode}
                </button>
                <button
                  type="button"
                  onClick={() => selectDesignMode("manual")}
                  className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${designMode === "manual" ? "bg-brand-700 text-white shadow" : "text-stone-600 hover:bg-cyan-50"}`}
                >
                  <Ruler size={14} />
                  {t.visualizer.manualMode}
                </button>
              </div>

              {designMode === "virtual" && (
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="shrink-0 text-[11px] font-semibold uppercase text-cyan-800">{t.visualizer.sceneLabel}</span>
                  {(["desert", "modern", "poolside"] as VirtualBackdrop[]).map((scene) => (
                    <button
                      type="button"
                      key={scene}
                      onClick={() => setVirtualBackdrop(scene)}
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${virtualBackdrop === scene ? "border-cyan-600 bg-cyan-600 text-white shadow-[0_0_14px_rgba(8,145,178,0.35)]" : "border-cyan-200 bg-white/70 text-cyan-900 hover:border-cyan-400"}`}
                    >
                      {t.visualizer.scenes[scene]}
                    </button>
                  ))}
                </div>
              )}

              {designMode === "camera" && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cameraStatus === "ready" ? stopCamera() : void startCamera()}
                    className="rounded-full border border-cyan-300 bg-white px-3 py-1 text-xs font-semibold text-cyan-900"
                  >
                    {cameraStatus === "ready" ? t.visualizer.cameraStop : t.visualizer.cameraStart}
                  </button>
                  <button
                    type="button"
                    disabled={cameraStatus !== "ready"}
                    onClick={() => setIsTracing((value) => !value)}
                    className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold disabled:opacity-40 ${isTracing ? "border-cyan-600 bg-cyan-600 text-white" : "border-cyan-300 bg-white text-cyan-900"}`}
                  >
                    <ScanLine size={13} />
                    {isTracing ? t.visualizer.stopTracing : t.visualizer.traceBoundary}
                  </button>
                  {scanPoints.length > 0 && (
                    <button type="button" onClick={() => setScanPoints([])} className="text-xs font-semibold text-stone-600 hover:text-red-600">
                      {t.visualizer.clearTrace}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-stone-950 px-3 py-2 text-white">
              <div className="inline-flex rounded-md border border-white/15 bg-white/5 p-1">
                <button type="button" onClick={() => setBuildMode("quick")} className={`rounded px-3 py-1.5 text-xs font-semibold ${buildMode === "quick" ? "bg-white text-stone-900" : "text-stone-300"}`}>
                  {t.visualizer.quickBuild}
                </button>
                <button type="button" onClick={() => setBuildMode("piece")} className={`rounded px-3 py-1.5 text-xs font-semibold ${buildMode === "piece" ? "bg-cyan-400 text-stone-950" : "text-stone-300"}`}>
                  {t.visualizer.pieceBuild}
                </button>
              </div>
              {buildMode === "piece" && <span className="text-[11px] font-semibold uppercase text-cyan-200">{t.visualizer.snapHint}</span>}
            </div>

            {designMode === "manual" && (
              <div className="mb-3 rounded-lg border border-cyan-200 bg-stone-950 p-4 text-white shadow-[0_16px_40px_-24px_rgba(6,182,212,0.8)]">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
                  <Ruler size={16} />
                  {t.visualizer.measurementsTitle}
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {([
                    ["yardLengthFt", t.visualizer.yardLength],
                    ["yardWidthFt", t.visualizer.yardWidth],
                    ["houseWidthFt", t.visualizer.houseWidth],
                    ["houseDepthFt", t.visualizer.houseDepth],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="text-[11px] text-stone-300">
                      {label}
                      <input
                        type="number"
                        min="1"
                        value={measurements[key]}
                        onChange={(event) => updateMeasurement(key, event.target.value)}
                        className="mt-1 w-full rounded-md border border-cyan-400/30 bg-white/10 px-2 py-2 text-sm text-white outline-none focus:border-cyan-300"
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-[11px] text-stone-300">{t.visualizer.exteriorColor}</span>
                  {["#d6c3a1", "#f2efe6", "#87938a", "#b86f52", "#4f5b60"].map((color) => (
                    <button
                      type="button"
                      key={color}
                      aria-label={`${t.visualizer.exteriorColor} ${color}`}
                      onClick={() => updateMeasurement("exteriorColor", color)}
                      className={`h-7 w-7 rounded-full border-2 transition ${measurements.exteriorColor === color ? "scale-110 border-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.65)]" : "border-white/40"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="relative aspect-[4/3] w-full cursor-crosshair overflow-hidden rounded-lg border border-cyan-200 bg-stone-900 shadow-[0_24px_60px_-30px_rgba(8,145,178,0.65)]"
            >
              {designMode === "virtual" || designMode === "manual" ? (
                <VirtualYardBackdrop backdrop={designMode === "manual" ? "modern" : virtualBackdrop} />
              ) : designMode === "camera" ? (
                <>
                  <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full object-cover" />
                  {cameraStatus !== "ready" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-950 text-center text-cyan-100">
                      <Camera size={38} className={cameraStatus === "starting" ? "animate-pulse" : ""} />
                      <p className="max-w-xs px-4 text-sm">{cameraStatus === "denied" ? t.visualizer.cameraDenied : t.visualizer.cameraWaiting}</p>
                      {cameraStatus !== "starting" && (
                        <button type="button" onClick={(event) => { event.stopPropagation(); void startCamera(); }} className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-bold text-stone-950">
                          {t.visualizer.cameraStart}
                        </button>
                      )}
                    </div>
                  )}
                  {scanPoints.length > 0 && (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
                      {scanPoints.length > 2 && <polygon points={scanPoints.map((point) => `${point.xPct},${point.yPct}`).join(" ")} fill="rgba(34,211,238,0.16)" stroke="rgb(103,232,249)" strokeWidth="0.6" />}
                      <polyline points={scanPoints.map((point) => `${point.xPct},${point.yPct}`).join(" ")} fill="none" stroke="rgb(165,243,252)" strokeWidth="0.7" />
                      {scanPoints.map((point, index) => <circle key={`${point.xPct}-${point.yPct}-${index}`} cx={point.xPct} cy={point.yPct} r="1.2" fill="white" stroke="rgb(6,182,212)" strokeWidth="0.5" />)}
                    </svg>
                  )}
                  {scanPoints.length > 0 && <span className="absolute bottom-3 left-3 rounded-full bg-stone-950/80 px-3 py-1 text-[11px] font-semibold text-cyan-100">{scanPoints.length} {t.visualizer.scanPoints}</span>}
                </>
              ) : photoDataUrl ? (
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

              {buildMode === "piece" && (
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(103,232,249,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.16)_1px,transparent_1px)] [background-size:5%_5%]" />
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
                    animate={{ scale: 1, opacity: 1, rotate: item.rotationDeg, y: -(item.elevationFt ?? 0) * 4 }}
                    data-visual={material.visual}
                    className={`material-chip group absolute flex items-center justify-center rounded-lg border-2 shadow-lg ${
                      isSelected ? "material-selected border-cyan-200 ring-2 ring-cyan-300" : "border-white/80"
                    }`}
                    style={{
                      left: `${item.xPct}%`,
                      top: `${item.yPct}%`,
                      width: `${item.widthPct}%`,
                      aspectRatio: material.aspectRatio,
                      backgroundColor: item.colorOverride ?? material.swatchColor,
                      backgroundImage: material.texture,
                      backgroundSize: "cover",
                      zIndex: Math.round((item.elevationFt ?? 0) * 10) + 10,
                    }}
                    onClick={(e) => {
                      if (buildMode === "piece" && selectedMaterial) return;
                      e.stopPropagation();
                      setSelectedItemId(item.id);
                    }}
                  >
                    {material.placement === "object" && (
                      <MaterialIcon className="material-icon pointer-events-none text-white/90 drop-shadow-lg" size="38%" strokeWidth={1.5} />
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
                <button type="button" aria-label={t.visualizer.cancelPlacement} onClick={() => setSelectedMaterialId(null)} className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-800 hover:bg-brand-100">
                  <X size={16} />
                </button>
              </div>
            )}

            {selectedPlacedItem && selectedPlacedMaterial && (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-cyan-200 bg-stone-950 px-3 py-2.5 text-white shadow-[0_12px_35px_-25px_rgba(6,182,212,0.8)]">
                <span className="text-xs font-semibold text-cyan-100">{t.visualizer.pieceColor}</span>
                {selectedPlacedMaterial.colorOptions.map((color) => (
                  <button
                    type="button"
                    key={color}
                    aria-label={`${t.visualizer.pieceColor} ${color}`}
                    onClick={() => updateItem(selectedPlacedItem.id, { colorOverride: color })}
                    className={`h-7 w-7 rounded-full border-2 ${selectedPlacedItem.colorOverride === color ? "scale-110 border-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.8)]" : "border-white/35"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <span className="ml-auto text-xs text-stone-300">{(selectedPlacedItem.elevationFt ?? 0).toFixed(1)} ft</span>
                <button type="button" aria-label={t.visualizer.lowerPiece} onClick={() => updateItem(selectedPlacedItem.id, { elevationFt: Math.max(0, (selectedPlacedItem.elevationFt ?? 0) - 0.5) })} className="flex h-7 w-7 items-center justify-center rounded bg-white/10 hover:bg-white/20">
                  <Minus size={14} />
                </button>
                <button type="button" aria-label={t.visualizer.raisePiece} onClick={() => updateItem(selectedPlacedItem.id, { elevationFt: Math.min(8, (selectedPlacedItem.elevationFt ?? 0) + 0.5) })} className="flex h-7 w-7 items-center justify-center rounded bg-cyan-400 text-stone-950 hover:bg-cyan-300">
                  <Plus size={14} />
                </button>
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
                        ? "material-selected border-cyan-500 bg-cyan-50 shadow-[0_0_0_2px_rgba(6,182,212,0.14)]"
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
              <label htmlFor="yard-area" className="text-sm font-medium text-stone-700">{t.visualizer.areaLabel}</label>
              <input
                id="yard-area"
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
            designMode={designMode}
            virtualBackdrop={virtualBackdrop}
            measurements={measurements}
            placedItems={placedItems}
            onClose={() => setShow3DPreview(false)}
            onSendToBooking={handleSendToBooking}
          />
        )}
      </AnimatePresence>
    </section>
  );
}


