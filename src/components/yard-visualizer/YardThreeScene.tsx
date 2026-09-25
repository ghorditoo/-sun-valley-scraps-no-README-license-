"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { materials } from "@/data/materials";
import type { MaterialVisual, PlacedMaterialItem, YardMeasurements } from "@/lib/types";
import type { VirtualBackdrop } from "./VirtualYardBackdrop";

const sceneColors: Record<VirtualBackdrop, { sky: number; ground: number }> = {
  desert: { sky: 0x9ecfd7, ground: 0x9b7048 },
  modern: { sky: 0xa9c4c7, ground: 0x6f786e },
  poolside: { sky: 0x86c7d6, ground: 0xb5a58c },
};

function createMaterialTexture(visual: MaterialVisual, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return undefined;
  context.fillStyle = color;
  context.fillRect(0, 0, 256, 256);

  if (["paver", "brick", "wall", "house"].includes(visual)) {
    context.strokeStyle = "rgba(255,255,255,.38)";
    context.lineWidth = 5;
    const rowHeight = visual === "brick" ? 42 : 64;
    for (let y = 0; y <= 256; y += rowHeight) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(256, y);
      context.stroke();
      const offset = (y / rowHeight) % 2 === 0 ? 0 : 42;
      for (let x = offset; x <= 256; x += 84) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x, y + rowHeight);
        context.stroke();
      }
    }
  } else if (["stone", "gravel", "soil"].includes(visual)) {
    for (let index = 0; index < 90; index++) {
      const x = (index * 73) % 256;
      const y = (index * 131) % 256;
      const radius = visual === "stone" ? 9 + (index % 9) : 2 + (index % 5);
      context.beginPath();
      context.fillStyle = index % 2 ? "rgba(255,255,255,.2)" : "rgba(20,10,5,.2)";
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
  } else if (["grass", "plant"].includes(visual)) {
    context.strokeStyle = "rgba(225,255,210,.34)";
    context.lineWidth = 2;
    for (let index = 0; index < 120; index++) {
      const x = (index * 47) % 256;
      const y = (index * 83) % 256;
      context.beginPath();
      context.moveTo(x, y + 10);
      context.lineTo(x + (index % 3) - 1, y);
      context.stroke();
    }
  } else if (["pergola", "shade", "furniture"].includes(visual)) {
    context.strokeStyle = "rgba(255,255,255,.24)";
    for (let y = 8; y < 256; y += 18) {
      context.beginPath();
      context.moveTo(0, y);
      context.bezierCurveTo(70, y - 5, 170, y + 7, 256, y);
      context.stroke();
    }
  } else if (["water", "pool"].includes(visual)) {
    context.strokeStyle = "rgba(225,255,255,.5)";
    context.lineWidth = 3;
    for (let y = 12; y < 256; y += 24) {
      context.beginPath();
      for (let x = 0; x <= 256; x += 8) {
        const waveY = y + Math.sin((x + y) / 18) * 5;
        if (x === 0) context.moveTo(x, waveY);
        else context.lineTo(x, waveY);
      }
      context.stroke();
    }
  } else {
    const gradient = context.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, "rgba(255,255,255,.45)");
    gradient.addColorStop(0.45, "rgba(255,255,255,.04)");
    gradient.addColorStop(1, "rgba(0,0,0,.28)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

function addBox(group: THREE.Group, size: [number, number, number], position: [number, number, number], color: number, map?: THREE.Texture) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshStandardMaterial({ color, map, roughness: 0.72, metalness: 0.08 }),
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

export function createMaterialObject(item: PlacedMaterialItem, yardWidth: number, yardLength: number) {
  const material = materials.find((entry) => entry.id === item.materialId);
  if (!material) return null;

  const group = new THREE.Group();
  const width = Math.max(0.8, (item.widthPct / 100) * yardWidth);
  const depth = Math.max(0.6, width / material.aspectRatio);
  const color = Number.parseInt((item.colorOverride ?? material.swatchColor).slice(1), 16);
  const texture = createMaterialTexture(material.visual, item.colorOverride ?? material.swatchColor);

  if (material.visual === "pergola" || material.visual === "shade") {
    const height = 3.2;
    const postSize = Math.max(0.12, width * 0.035);
    for (const x of [-width / 2.2, width / 2.2]) {
      for (const z of [-depth / 2.2, depth / 2.2]) addBox(group, [postSize, height, postSize], [x, height / 2, z], color, texture);
    }
    addBox(group, [width, 0.18, depth], [0, height, 0], color, texture);
  } else if (material.visual === "plant") {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(width * 0.06, width * 0.08, Math.max(0.7, width * 0.55), 10),
      new THREE.MeshStandardMaterial({ color: 0x6b4935, map: texture, roughness: 1 }),
    );
    trunk.position.y = Math.max(0.7, width * 0.55) / 2;
    trunk.castShadow = true;
    group.add(trunk);
    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(0.35, width * 0.3), 16, 12),
      new THREE.MeshStandardMaterial({ color, roughness: 0.9 }),
    );
    crown.position.y = Math.max(0.9, width * 0.7);
    crown.castShadow = true;
    group.add(crown);
  } else if (material.visual === "pool") {
    if (material.buildPiece === "edge") {
      addBox(group, [width, 0.28, depth], [0, 0.14, 0], color, texture);
    } else {
      const pool = new THREE.Mesh(
        new THREE.BoxGeometry(width, material.placement === "object" ? 0.7 : 0.16, depth),
        new THREE.MeshPhysicalMaterial({ color, map: texture, roughness: 0.08, metalness: 0.15, transmission: 0.16, transparent: true, opacity: 0.88 }),
      );
      pool.position.y = material.placement === "object" ? 0.35 : 0.08;
      pool.receiveShadow = true;
      group.add(pool);
    }
  } else if (material.visual === "house") {
    const height = material.buildPiece === "structure" ? 3.8 : 2.7;
    addBox(group, [width, height, Math.max(0.18, depth * 0.18)], [0, height / 2, 0], color, texture);
  } else if (material.visual === "furniture") {
    addBox(group, [width, 0.16, depth], [0, 0.9, 0], color, texture);
    for (const x of [-width * 0.38, width * 0.38]) {
      for (const z of [-depth * 0.35, depth * 0.35]) addBox(group, [0.11, 0.85, 0.11], [x, 0.43, z], color, texture);
    }
  } else if (material.visual === "water" || material.visual === "fire") {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(width / 2, width / 2, material.visual === "fire" ? 0.5 : 0.18, 32),
      new THREE.MeshStandardMaterial({
        color,
        map: texture,
        roughness: material.visual === "water" ? 0.12 : 0.75,
        metalness: material.visual === "water" ? 0.35 : 0.05,
        emissive: material.visual === "fire" ? 0x7c2d12 : 0x000000,
      }),
    );
    mesh.position.y = material.visual === "fire" ? 0.25 : 0.09;
    mesh.castShadow = true;
    group.add(mesh);
  } else if (material.visual === "light") {
    addBox(group, [0.18, 1.15, 0.18], [0, 0.58, 0], 0x40484a, texture);
    const glow = new THREE.PointLight(0xffd27a, 18, 6);
    glow.position.y = 1.25;
    group.add(glow);
  } else {
    const height = material.placement === "surface" ? 0.1 : material.placement === "linear" ? 0.55 : 1.25;
    addBox(group, [width, height, depth], [0, height / 2, 0], color, texture);
  }

  group.position.set(
    (item.xPct / 100 - 0.5) * yardWidth,
    0.08 + (item.elevationFt ?? 0),
    (item.yPct / 100 - 0.5) * yardLength,
  );
  group.rotation.y = THREE.MathUtils.degToRad(-item.rotationDeg);
  return group;
}

export function YardThreeScene({
  placedItems,
  measurements,
  backdrop,
}: {
  placedItems: PlacedMaterialItem[];
  measurements: YardMeasurements;
  backdrop: VirtualBackdrop;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const yardWidth = Math.max(12, measurements.yardWidthFt);
    const yardLength = Math.max(12, measurements.yardLengthFt);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(sceneColors[backdrop].sky);
    scene.fog = new THREE.Fog(sceneColors[backdrop].sky, 32, 78);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 160);
    camera.position.set(yardWidth * 0.72, Math.max(12, yardLength * 0.52), yardLength * 0.82);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.7;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.target.set(0, 0.8, 0);

    scene.add(new THREE.HemisphereLight(0xe8f7ff, 0x66513f, 2.4));
    const sun = new THREE.DirectionalLight(0xfff2d4, 3.6);
    sun.position.set(-14, 24, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(yardWidth, 0.18, yardLength),
      new THREE.MeshStandardMaterial({ color: sceneColors[backdrop].ground, roughness: 0.95 }),
    );
    ground.position.y = -0.09;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(Math.max(yardWidth, yardLength), 20, 0x67e8f9, 0x9bd7cc);
    grid.material.opacity = 0.22;
    grid.material.transparent = true;
    scene.add(grid);

    const houseWidth = Math.min(measurements.houseWidthFt, yardWidth * 0.9);
    const houseDepth = Math.min(measurements.houseDepthFt, yardLength * 0.45);
    const house = new THREE.Mesh(
      new THREE.BoxGeometry(houseWidth, 5.5, houseDepth),
      new THREE.MeshStandardMaterial({ color: measurements.exteriorColor, roughness: 0.78 }),
    );
    house.position.set(0, 2.75, -yardLength / 2 + houseDepth / 2);
    house.castShadow = true;
    house.receiveShadow = true;
    scene.add(house);

    for (const item of placedItems) {
      const object = createMaterialObject(item, yardWidth, yardLength);
      if (object) scene.add(object);
    }

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let frame = 0;
    const render = () => {
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const objectMaterial = object.material;
        const objectMaterials = Array.isArray(objectMaterial) ? objectMaterial : [objectMaterial];
        objectMaterials.forEach((entry) => {
          if (entry instanceof THREE.MeshStandardMaterial || entry instanceof THREE.MeshPhysicalMaterial) entry.map?.dispose();
          entry.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [backdrop, measurements, placedItems]);

  return <div ref={hostRef} className="h-full w-full" data-testid="yard-three-scene" />;
}