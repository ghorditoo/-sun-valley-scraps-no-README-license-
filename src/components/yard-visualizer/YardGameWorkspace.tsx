"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Material, PlacedMaterialItem, YardMeasurements } from "@/lib/types";
import type { VirtualBackdrop } from "./VirtualYardBackdrop";
import { createMaterialObject } from "./YardThreeScene";

const sceneColors: Record<VirtualBackdrop, { sky: number; ground: number }> = {
  desert: { sky: 0x9bcbd3, ground: 0x9c7149 },
  modern: { sky: 0xa9c4c7, ground: 0x6f786e },
  poolside: { sky: 0x82c8d8, ground: 0xb8a78e },
};

export function YardGameWorkspace({
  placedItems,
  selectedMaterial,
  selectedItemId,
  measurements,
  backdrop,
  cameraView,
  onPlace,
  onSelect,
}: {
  placedItems: PlacedMaterialItem[];
  selectedMaterial?: Material;
  selectedItemId: string | null;
  measurements: YardMeasurements;
  backdrop: VirtualBackdrop;
  cameraView: "orbit" | "drone";
  onPlace: (xPct: number, yPct: number) => void;
  onSelect: (id: string | null) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onPlaceRef = useRef(onPlace);
  const onSelectRef = useRef(onSelect);
  const selectedMaterialRef = useRef(selectedMaterial);
  const interactiveObjectsRef = useRef<THREE.Object3D[]>([]);
  onPlaceRef.current = onPlace;
  onSelectRef.current = onSelect;
  selectedMaterialRef.current = selectedMaterial;

  useEffect(() => {
    interactiveObjectsRef.current.forEach((object) => {
      const isSelected = object.userData.itemId === selectedItemId;
      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
        childMaterials.forEach((entry) => {
          if (!(entry instanceof THREE.MeshStandardMaterial || entry instanceof THREE.MeshPhysicalMaterial)) return;
          const original = entry.userData.originalEmissive as number | undefined;
          if (original === undefined) entry.userData.originalEmissive = entry.emissive.getHex();
          entry.emissive.setHex(isSelected ? 0x0e7490 : (entry.userData.originalEmissive as number));
          entry.emissiveIntensity = isSelected ? 0.42 : 1;
        });
      });
    });
  }, [selectedItemId]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const yardWidth = Math.max(12, measurements.yardWidthFt);
    const yardLength = Math.max(12, measurements.yardLengthFt);
    const colors = sceneColors[backdrop];
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(colors.sky);
    scene.fog = new THREE.Fog(colors.sky, 38, 90);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 180);
    if (cameraView === "drone") camera.position.set(0, Math.max(28, yardLength * 1.1), 0.1);
    else camera.position.set(yardWidth * 0.72, Math.max(12, yardLength * 0.52), yardLength * 0.82);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = selectedMaterial ? "crosshair" : "grab";
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute("aria-label", "3D yard building workspace");
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.maxPolarAngle = cameraView === "drone" ? Math.PI / 3.2 : Math.PI / 2.04;
    controls.target.set(0, 1.5, 0);

    scene.add(new THREE.HemisphereLight(0xe9fbff, 0x564436, 2.5));
    const sunlight = new THREE.DirectionalLight(0xfff0cf, 3.8);
    sunlight.position.set(-16, 28, 14);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(2048, 2048);
    scene.add(sunlight);

    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(yardWidth, 0.22, yardLength),
      new THREE.MeshStandardMaterial({ color: colors.ground, roughness: 0.96 }),
    );
    ground.name = "build-ground";
    ground.position.y = -0.11;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(Math.max(yardWidth, yardLength), 20, 0x67e8f9, 0xb5ebe3);
    grid.material.opacity = 0.38;
    grid.material.transparent = true;
    grid.position.y = 0.01;
    scene.add(grid);

    const boundary = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(yardWidth, 0.12, yardLength)),
      new THREE.LineBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.75 }),
    );
    boundary.position.y = 0.04;
    scene.add(boundary);

    const houseWidth = Math.min(measurements.houseWidthFt, yardWidth * 0.9);
    const houseDepth = Math.min(measurements.houseDepthFt, yardLength * 0.45);
    const house = new THREE.Mesh(
      new THREE.BoxGeometry(houseWidth, 5.5, houseDepth),
      new THREE.MeshStandardMaterial({ color: measurements.exteriorColor, roughness: 0.78 }),
    );
    const houseTargetY = 2.75;
    house.position.set(0, houseTargetY + 10, -yardLength / 2 + houseDepth / 2);
    house.castShadow = true;
    house.receiveShadow = true;
    scene.add(house);

    const interactiveObjects: THREE.Object3D[] = [];
    const dropTargets = new Map<THREE.Object3D, number>();
    placedItems.forEach((item, index) => {
      const object = createMaterialObject(item, yardWidth, yardLength);
      if (!object) return;
      const targetY = object.position.y;
      object.position.y += 5 + Math.min(index * 0.18, 2.5);
      object.userData.itemId = item.id;
      object.traverse((child) => {
        child.userData.itemId = item.id;
        if (child instanceof THREE.Mesh) {
          const meshMaterial = child.material;
          const materialsToUpdate = Array.isArray(meshMaterial) ? meshMaterial : [meshMaterial];
          materialsToUpdate.forEach((entry) => {
            if (entry instanceof THREE.MeshStandardMaterial || entry instanceof THREE.MeshPhysicalMaterial) {
              entry.userData.originalEmissive = entry.emissive.getHex();
            }
          });
        }
      });
      dropTargets.set(object, targetY);
      interactiveObjects.push(object);
      scene.add(object);
    });
    interactiveObjectsRef.current = interactiveObjects;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerStart = { x: 0, y: 0 };
    const setPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const handlePointerDown = (event: PointerEvent) => {
      renderer.domElement.focus();
      pointerStart = { x: event.clientX, y: event.clientY };
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 6) return;
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      if (selectedMaterialRef.current) {
        const hit = raycaster.intersectObject(ground)[0];
        const rect = renderer.domElement.getBoundingClientRect();
        const screenXPct = ((event.clientX - rect.left) / rect.width) * 100;
        const screenYPct = ((event.clientY - rect.top) / rect.height) * 100;
        const xPct = Math.round((hit ? (hit.point.x / yardWidth + 0.5) * 100 : screenXPct) / 5) * 5;
        const yPct = Math.round((hit ? (hit.point.z / yardLength + 0.5) * 100 : screenYPct) / 5) * 5;
        onPlaceRef.current(Math.max(0, Math.min(95, xPct)), Math.max(0, Math.min(95, yPct)));
        return;
      }
      const hit = raycaster.intersectObjects(interactiveObjects, true)[0];
      if (!hit) {
        onSelectRef.current(null);
        return;
      }
      let target: THREE.Object3D | null = hit.object;
      while (target && !target.userData.itemId) target = target.parent;
      onSelectRef.current(target?.userData.itemId ?? null);
    };
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    const handleKeyDown = (event: KeyboardEvent) => {
      const distance = event.shiftKey ? 2 : 0.8;
      if (!["KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE"].includes(event.code)) return;
      event.preventDefault();
      if (event.code === "KeyW") camera.position.z -= distance;
      if (event.code === "KeyS") camera.position.z += distance;
      if (event.code === "KeyA") camera.position.x -= distance;
      if (event.code === "KeyD") camera.position.x += distance;
      if (event.code === "KeyQ") camera.position.y += distance;
      if (event.code === "KeyE") camera.position.y = Math.max(3, camera.position.y - distance);
    };
    renderer.domElement.addEventListener("keydown", handleKeyDown);

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

    const startedAt = performance.now();
    let frame = 0;
    const render = () => {
      const elapsed = (performance.now() - startedAt) / 1000;
      house.position.y = THREE.MathUtils.lerp(house.position.y, houseTargetY, 0.075);
      dropTargets.forEach((targetY, object) => {
        object.position.y = THREE.MathUtils.lerp(object.position.y, targetY, 0.11);
      });
      grid.material.opacity = 0.3 + Math.sin(elapsed * 1.6) * 0.08;
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("keydown", handleKeyDown);
      controls.dispose();
      interactiveObjectsRef.current = [];
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const objectMaterial = object.material;
        if (Array.isArray(objectMaterial)) objectMaterial.forEach((entry) => entry.dispose());
        else objectMaterial.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [backdrop, cameraView, measurements, placedItems]);

  return <div ref={hostRef} className="h-full w-full" data-testid="yard-game-workspace" />;
}