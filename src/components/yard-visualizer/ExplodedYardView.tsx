"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Download, Layers, Play } from "lucide-react";
import type { YardPlan } from "@/lib/types";
import { buildExplodedScene, renderExplodedSnapshot, summarizeLayers, type ExplodedLayerId, type ExplodedScene } from "./explodedScene";

// Remount (via `key`) when switching to a different plan so slider and layer state reset.
export function ExplodedYardView({ plan, fileName = "yard-exploded-view" }: { plan: YardPlan; fileName?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const builtRef = useRef<ExplodedScene | null>(null);
  const animationRef = useRef(0);
  const [explode, setExplode] = useState(1);
  const layers = useMemo(() => summarizeLayers(plan), [plan]);
  const [hiddenLayers, setHiddenLayers] = useState<ExplodedLayerId[]>([]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const built = buildExplodedScene(plan);
    builtRef.current = built;

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      controls.target.copy(built.frameCamera(camera));
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let frame = 0;
    const render = () => {
      controls.update();
      renderer.render(built.scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
      controls.dispose();
      built.dispose();
      builtRef.current = null;
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [plan]);

  function applyExplode(value: number) {
    setExplode(value);
    builtRef.current?.setExplode(value);
  }

  function playAssembly() {
    cancelAnimationFrame(animationRef.current);
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 2200);
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      applyExplode(eased);
      if (t < 1) animationRef.current = requestAnimationFrame(step);
    };
    applyExplode(0);
    animationRef.current = requestAnimationFrame(step);
  }

  function toggleLayer(id: ExplodedLayerId) {
    const visible = hiddenLayers.includes(id);
    builtRef.current?.setLayerVisible(id, visible);
    setHiddenLayers((current) => (visible ? current.filter((entry) => entry !== id) : [...current, id]));
  }

  function downloadImage() {
    const dataUrl = plan.explodedRenderDataUrl ?? renderExplodedSnapshot(plan);
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${fileName}.jpg`;
    link.click();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="relative aspect-[4/3] w-full bg-stone-100">
        <div ref={hostRef} className="h-full w-full" data-testid="exploded-yard-view" />
        <div className="pointer-events-none absolute left-3 top-3 rounded bg-stone-950/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
          Exploded view · drag to orbit
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-stone-200 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={playAssembly} className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-2 text-xs font-bold text-white hover:bg-stone-800">
            <Play size={14} /> Play build
          </button>
          <label className="flex min-w-40 flex-1 items-center gap-2 text-xs font-semibold text-stone-600">
            Assembled
            <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(event) => applyExplode(Number(event.target.value))} className="flex-1 accent-emerald-600" aria-label="Explode amount" />
            Exploded
          </label>
          <button type="button" onClick={downloadImage} className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-800 hover:bg-stone-50">
            <Download size={14} /> Download image
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Layers size={14} className="text-stone-500" />
          {layers.map((layer) => {
            const hidden = hiddenLayers.includes(layer.id);
            return (
              <button
                type="button"
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                aria-pressed={!hidden}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${hidden ? "border-stone-200 text-stone-400 line-through" : "border-stone-300 text-stone-700"}`}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: hidden ? "#d6d3d1" : layer.color }} />
                {layer.label} ({layer.count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
