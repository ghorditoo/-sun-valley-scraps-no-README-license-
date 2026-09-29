import * as THREE from "three";
import { materials } from "@/data/materials";
import type { Material, PlacedMaterialItem, YardMeasurements, YardPlan } from "@/lib/types";
import { createHouseMesh, createMaterialObject } from "./YardThreeScene";

// Build layers from the ground up, the way a crew would install them.
export const EXPLODED_LAYERS = [
  { id: "grade", label: "Existing Grade", color: "#78716c" },
  { id: "base", label: "Base & Bedding", color: "#a8a29e" },
  { id: "surface", label: "Surfaces", color: "#0f766e" },
  { id: "border", label: "Borders & Walls", color: "#b45309" },
  { id: "feature", label: "Features", color: "#7c3aed" },
  { id: "structure", label: "Structures", color: "#be123c" },
  { id: "house", label: "House", color: "#1d4ed8" },
] as const;

export type ExplodedLayerId = (typeof EXPLODED_LAYERS)[number]["id"];

const DEFAULT_MEASUREMENTS: YardMeasurements = {
  yardLengthFt: 30,
  yardWidthFt: 40,
  houseWidthFt: 30,
  houseDepthFt: 12,
  exteriorColor: "#d6c3a1",
};

export function layerForMaterial(material: Material): ExplodedLayerId {
  if (material.category === "ground") return "base";
  if (material.category === "structures" || material.category === "building" || material.buildPiece === "structure") return "structure";
  if (material.category === "walls" || material.placement === "linear" || material.buildPiece === "edge") return "border";
  if (material.placement === "surface") return "surface";
  return "feature";
}

function needsSubBase(material: Material) {
  return material.placement === "surface" && (material.category === "pavers" || material.category === "stone");
}

function makeLabel(text: string, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 112;
  const context = canvas.getContext("2d")!;
  context.font = "700 46px system-ui, -apple-system, Segoe UI, sans-serif";
  const width = Math.min(500, context.measureText(text).width + 64);
  context.fillStyle = color;
  context.beginPath();
  context.roundRect(4, 14, width, 84, 20);
  context.fill();
  context.fillStyle = "#ffffff";
  context.textBaseline = "middle";
  context.fillText(text, 34, 58);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true }));
  sprite.center.set(0, 0.5);
  sprite.renderOrder = 10;
  return sprite;
}

function makeSheet(width: number, length: number, color: string) {
  const group = new THREE.Group();
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(width, length),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false }),
  );
  plane.rotation.x = -Math.PI / 2;
  group.add(plane);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(width, length)),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 }),
  );
  edges.rotation.x = -Math.PI / 2;
  group.add(edges);
  return group;
}

function addSubBase(group: THREE.Group, item: PlacedMaterialItem, material: Material, yardWidth: number, yardLength: number) {
  const width = Math.max(0.8, (item.widthPct / 100) * yardWidth);
  const depth = Math.max(0.6, width / material.aspectRatio);
  const holder = new THREE.Group();
  const gravel = new THREE.Mesh(new THREE.BoxGeometry(width, 0.35, depth), new THREE.MeshStandardMaterial({ color: 0x8f8a84, roughness: 1 }));
  gravel.position.y = 0.175;
  const sand = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, depth), new THREE.MeshStandardMaterial({ color: 0xd9c49a, roughness: 1 }));
  sand.position.y = 0.45;
  holder.add(gravel, sand);
  holder.position.set((item.xPct / 100 - 0.5) * yardWidth, 0, (item.yPct / 100 - 0.5) * yardLength);
  holder.rotation.y = THREE.MathUtils.degToRad(-item.rotationDeg);
  group.add(holder);
}

export type ExplodedLayerInfo = { id: ExplodedLayerId; label: string; color: string; count: number };

// Piece counts per layer; layers with nothing in them are left out of the stack.
export function summarizeLayers(plan: YardPlan): ExplodedLayerInfo[] {
  const counts = new Map<ExplodedLayerId, number>([["grade", 1], ["house", 1]]);
  const bump = (id: ExplodedLayerId) => counts.set(id, (counts.get(id) ?? 0) + 1);
  for (const item of plan.items) {
    const material = materials.find((entry) => entry.id === item.materialId);
    if (!material) continue;
    bump(layerForMaterial(material));
    if (needsSubBase(material)) bump("base");
  }
  return EXPLODED_LAYERS.filter((layer) => counts.has(layer.id)).map((layer) => ({
    id: layer.id,
    label: layer.label,
    color: layer.color,
    count: counts.get(layer.id)!,
  }));
}

export type ExplodedScene = {
  scene: THREE.Scene;
  setExplode: (amount: number) => void;
  setLayerVisible: (id: ExplodedLayerId, visible: boolean) => void;
  frameCamera: (camera: THREE.PerspectiveCamera) => THREE.Vector3;
  dispose: () => void;
};

export function buildExplodedScene(plan: YardPlan): ExplodedScene {
  const measurements = { ...DEFAULT_MEASUREMENTS, ...plan.measurements };
  const yardWidth = Math.max(12, measurements.yardWidthFt);
  const yardLength = Math.max(12, measurements.yardLengthFt);
  const gap = Math.max(4, Math.max(yardWidth, yardLength) * 0.16);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf1f5f3);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7d6b, 2.2));
  const sun = new THREE.DirectionalLight(0xfff4dc, 2.8);
  sun.position.set(-18, 40, 22);
  scene.add(sun);

  const layerGroups = new Map<ExplodedLayerId, THREE.Group>();
  for (const layer of EXPLODED_LAYERS) {
    const group = new THREE.Group();
    group.name = layer.id;
    layerGroups.set(layer.id, group);
  }

  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(yardWidth, 0.3, yardLength),
    new THREE.MeshStandardMaterial({ color: 0x9c7a55, roughness: 1 }),
  );
  ground.position.y = -0.15;
  layerGroups.get("grade")!.add(ground);
  layerGroups.get("house")!.add(createHouseMesh(measurements, yardWidth, yardLength, plan.propertyModel));

  const guides: Array<{ line: THREE.Line; layer: ExplodedLayerId }> = [];
  const guideMaterial = new THREE.LineDashedMaterial({ color: 0x475569, dashSize: 0.35, gapSize: 0.25, transparent: true, opacity: 0.55 });
  for (const item of plan.items) {
    const material = materials.find((entry) => entry.id === item.materialId);
    const object = createMaterialObject(item, yardWidth, yardLength);
    if (!material || !object) continue;
    // Pieces keep their own height off the ground; layers only add separation.
    const layer = layerForMaterial(material);
    layerGroups.get(layer)!.add(object);
    if (needsSubBase(material)) addSubBase(layerGroups.get("base")!, item, material, yardWidth, yardLength);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)]),
      guideMaterial,
    );
    line.position.set(object.position.x, 0, object.position.z);
    line.computeLineDistances();
    scene.add(line);
    guides.push({ line, layer });
  }

  const activeLayers = summarizeLayers(plan);
  const indexOf = new Map(activeLayers.map((layer, index) => [layer.id, index] as const));
  const hidden = new Set<ExplodedLayerId>();
  let explodeAmount = 1;

  for (const layer of activeLayers) {
    const group = layerGroups.get(layer.id)!;
    if (layer.id !== "grade" && layer.id !== "house") group.add(makeSheet(yardWidth, yardLength, layer.color));
    const label = makeLabel(layer.label, layer.color);
    label.scale.set(gap * 2.5, gap * 0.55, 1);
    // Far-right corner from the default camera angle, so labels sit beside the stack.
    label.position.set(yardWidth / 2 + 1, 0.4, -yardLength / 2 - 1);
    group.add(label);
    scene.add(group);
  }

  const offsetFor = (id: ExplodedLayerId) => (indexOf.get(id) ?? 0) * gap * explodeAmount;

  function setExplode(amount: number) {
    explodeAmount = Math.max(0, Math.min(1, amount));
    for (const layer of activeLayers) {
      const group = layerGroups.get(layer.id)!;
      group.position.y = offsetFor(layer.id);
      group.children.forEach((child) => {
        if (child instanceof THREE.Sprite) child.visible = explodeAmount > 0.35;
      });
    }
    for (const { line, layer } of guides) {
      const height = offsetFor(layer);
      line.scale.y = Math.max(height, 0.0001);
      line.visible = height > 0.2 && !hidden.has(layer);
    }
  }

  function setLayerVisible(id: ExplodedLayerId, visible: boolean) {
    if (visible) hidden.delete(id);
    else hidden.add(id);
    const group = layerGroups.get(id);
    if (group) group.visible = visible;
    setExplode(explodeAmount);
  }

  function frameCamera(camera: THREE.PerspectiveCamera) {
    const box = new THREE.Box3().setFromObject(scene);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const distance = sphere.radius / Math.sin(THREE.MathUtils.degToRad(camera.fov) / 2);
    const direction = new THREE.Vector3(0.95, 0.72, 1.15).normalize();
    const aspectBoost = camera.aspect < 1 ? 1 / camera.aspect : 1;
    camera.position.copy(sphere.center).addScaledVector(direction, distance * 0.92 * aspectBoost);
    camera.near = 0.1;
    camera.far = distance * 6;
    camera.lookAt(sphere.center);
    camera.updateProjectionMatrix();
    return sphere.center.clone();
  }

  function dispose() {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Sprite) {
        object.geometry.dispose();
        const list = Array.isArray(object.material) ? object.material : [object.material];
        list.forEach((entry) => {
          (entry as THREE.MeshStandardMaterial).map?.dispose();
          entry.dispose();
        });
      }
    });
  }

  setExplode(1);

  return {
    scene,
    setExplode,
    setLayerVisible,
    frameCamera,
    dispose,
  };
}

// Renders a high-resolution still of the exploded design with a caption strip,
// returned as a JPEG data URL (or null if WebGL is unavailable).
export function renderExplodedSnapshot(plan: YardPlan, width = 1600, height = 1100): string | null {
  let built: ExplodedScene | null = null;
  let renderer: THREE.WebGLRenderer | null = null;
  try {
    built = buildExplodedScene(plan);
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    built.frameCamera(camera);
    renderer.render(built.scene, camera);

    const footer = 110;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height + footer;
    const context = canvas.getContext("2d")!;
    context.drawImage(renderer.domElement, 0, 0);
    context.fillStyle = "#064e3b";
    context.fillRect(0, height, width, footer);
    context.fillStyle = "#ffffff";
    context.font = "700 38px system-ui, -apple-system, Segoe UI, sans-serif";
    context.fillText("Sun Valley Scraps · Exploded Yard Design", 40, height + 50);
    context.font = "400 26px system-ui, -apple-system, Segoe UI, sans-serif";
    context.fillStyle = "#d1fae5";
    const details = [
      plan.propertyAddress || "No address given",
      `${plan.items.length} pieces`,
      `Est. $${Math.round(plan.estimatedTotal).toLocaleString("en-US")}`,
      new Date().toLocaleDateString("en-US"),
    ].join("  ·  ");
    context.fillText(details, 40, height + 90);
    return canvas.toDataURL("image/jpeg", 0.86);
  } catch {
    return null;
  } finally {
    built?.dispose();
    renderer?.dispose();
    renderer?.forceContextLoss();
  }
}
