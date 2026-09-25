import type { Material } from "@/lib/types";

const textures = {
  paver: "repeating-linear-gradient(90deg, transparent 0 22px, rgba(255,255,255,.28) 23px 25px), repeating-linear-gradient(0deg, transparent 0 14px, rgba(30,30,30,.18) 15px 17px)",
  brick: "repeating-linear-gradient(0deg, transparent 0 13px, rgba(255,255,255,.35) 14px 16px), repeating-linear-gradient(90deg, transparent 0 28px, rgba(45,20,10,.25) 29px 31px)",
  stone: "radial-gradient(circle at 20% 30%, rgba(255,255,255,.35) 0 8%, transparent 9%), radial-gradient(circle at 70% 65%, rgba(0,0,0,.16) 0 12%, transparent 13%), linear-gradient(135deg, rgba(255,255,255,.2), transparent)",
  gravel: "radial-gradient(circle at 20% 25%, rgba(255,255,255,.55) 0 4%, transparent 5%), radial-gradient(circle at 70% 65%, rgba(0,0,0,.2) 0 5%, transparent 6%), radial-gradient(circle at 45% 85%, rgba(255,255,255,.35) 0 3%, transparent 4%)",
  soil: "radial-gradient(circle at 25% 35%, rgba(255,255,255,.12) 0 3%, transparent 4%), radial-gradient(circle at 75% 65%, rgba(0,0,0,.18) 0 4%, transparent 5%)",
  grass: "repeating-linear-gradient(100deg, rgba(255,255,255,.08) 0 2px, transparent 2px 7px), linear-gradient(135deg, rgba(255,255,255,.18), transparent)",
  plant: "radial-gradient(ellipse at center, rgba(255,255,255,.28) 0 18%, transparent 19%), repeating-radial-gradient(circle at center, transparent 0 8px, rgba(0,0,0,.12) 9px 11px)",
  wall: "repeating-linear-gradient(0deg, transparent 0 17px, rgba(255,255,255,.35) 18px 20px), repeating-linear-gradient(90deg, transparent 0 34px, rgba(0,0,0,.15) 35px 37px)",
  wood: "repeating-linear-gradient(90deg, rgba(255,255,255,.18) 0 3px, transparent 3px 16px), linear-gradient(135deg, rgba(80,40,10,.18), transparent)",
  metal: "linear-gradient(135deg, rgba(255,255,255,.65), transparent 35%, rgba(0,0,0,.2) 70%, rgba(255,255,255,.25))",
  water: "repeating-radial-gradient(ellipse at 50% 100%, rgba(255,255,255,.4) 0 3px, transparent 4px 14px), linear-gradient(160deg, rgba(255,255,255,.3), transparent)",
} as const;

const item = (
  id: string,
  category: Material["category"],
  name: string,
  nameEs: string,
  price: number,
  priceUnit: Material["priceUnit"],
  placement: Material["placement"],
  visual: Material["visual"],
  swatchColor: string,
  texture: string,
  defaultWidthPct = placement === "object" ? 22 : 28,
  aspectRatio = 1,
): Material => ({ id, category, name, nameEs, price, priceUnit, placement, visual, swatchColor, texture, defaultWidthPct, aspectRatio });

export const materials: Material[] = [
  item("paver-belgard-gray", "pavers", "Belgard Gray Pavers", "Adoquines Belgard Grises", 18, "sqft", "surface", "paver", "#8f9697", textures.paver),
  item("paver-cambridge-tan", "pavers", "Cambridge Desert Tan", "Cambridge Arena Desierto", 19, "sqft", "surface", "paver", "#c6a77d", textures.paver),
  item("paver-charcoal", "pavers", "Charcoal Border Pavers", "Adoquines de Borde Carbón", 21, "sqft", "linear", "paver", "#4b5052", textures.paver, 32, 3.2),
  item("paver-herringbone", "pavers", "Herringbone Pavers", "Adoquines Espiga", 22, "sqft", "surface", "brick", "#9b6c52", textures.brick),
  item("paver-cobblestone", "pavers", "Old World Cobblestone", "Adoquín Estilo Antiguo", 24, "sqft", "surface", "stone", "#70675e", textures.stone),
  item("paver-porcelain", "pavers", "Large Format Porcelain", "Porcelanato de Gran Formato", 28, "sqft", "surface", "paver", "#c9c5bb", textures.paver, 30, 1.4),

  item("brick-red", "stone", "Classic Red Brick", "Ladrillo Rojo Clásico", 20, "sqft", "surface", "brick", "#9a4634", textures.brick),
  item("travertine-ivory", "stone", "Ivory Travertine", "Travertino Marfil", 27, "sqft", "surface", "stone", "#d6c3a1", textures.stone),
  item("travertine-walnut", "stone", "Walnut Travertine", "Travertino Nogal", 29, "sqft", "surface", "stone", "#ad8666", textures.stone),
  item("flagstone-arizona", "stone", "Arizona Flagstone", "Laja de Arizona", 25, "sqft", "surface", "stone", "#ad7655", textures.stone),
  item("slate-charcoal", "stone", "Charcoal Slate", "Pizarra Carbón", 26, "sqft", "surface", "stone", "#4f5554", textures.stone),

  item("gravel-quarter-minus", "ground", "Quarter Minus Gravel", "Grava Cuarto Menos", 5, "sqft", "surface", "gravel", "#a58c70", textures.gravel),
  item("rock-river", "ground", "Salt River Rock", "Piedra de Río Salt", 7, "sqft", "surface", "gravel", "#81786e", textures.gravel),
  item("rock-lava-black", "ground", "Black Lava Rock", "Roca Volcánica Negra", 8, "sqft", "surface", "gravel", "#292524", textures.gravel),
  item("rock-apache-gold", "ground", "Apache Gold Rock", "Roca Apache Gold", 8, "sqft", "surface", "gravel", "#b27b42", textures.gravel),
  item("soil-screened", "ground", "Screened Topsoil", "Tierra Vegetal Cernida", 4, "sqft", "surface", "soil", "#6b4935", textures.soil),
  item("soil-desert", "ground", "Natural Desert Soil", "Tierra Natural del Desierto", 3, "sqft", "surface", "soil", "#a77548", textures.soil),
  item("mulch-cedar", "ground", "Cedar Mulch", "Mantillo de Cedro", 5, "sqft", "surface", "soil", "#754329", textures.wood),

  item("turf-landscape", "turf", "Premium Landscape Turf", "Césped Paisajístico Premium", 12, "sqft", "surface", "grass", "#2f7d43", textures.grass),
  item("turf-pet", "turf", "Pet-Safe Cooling Turf", "Césped Fresco para Mascotas", 15, "sqft", "surface", "grass", "#3d8f4f", textures.grass),
  item("turf-putting", "turf", "Pro Putting Green Turf", "Césped Profesional de Golf", 18, "sqft", "surface", "grass", "#176b3a", textures.grass),
  item("turf-fringe", "turf", "Putting Green Fringe", "Borde de Green de Golf", 14, "sqft", "linear", "grass", "#397a3b", textures.grass, 34, 3),
  item("lawn-bermuda", "turf", "Natural Bermuda Sod", "Césped Bermuda Natural", 9, "sqft", "surface", "grass", "#4c8f45", textures.grass),

  item("plant-agave", "plants", "Blue Agave Cluster", "Grupo de Agave Azul", 185, "each", "object", "plant", "#5f8c7b", textures.plant, 16),
  item("plant-saguaro", "plants", "Saguaro Cactus", "Cactus Saguaro", 650, "each", "object", "plant", "#47734c", textures.plant, 12, 0.65),
  item("plant-palo-verde", "plants", "Palo Verde Tree", "Árbol Palo Verde", 525, "each", "object", "plant", "#6f8c42", textures.plant, 22),
  item("plant-palm", "plants", "Date Palm", "Palmera Datilera", 950, "each", "object", "plant", "#527a39", textures.plant, 22, 0.8),
  item("plant-desert-bed", "plants", "Desert Color Plant Bed", "Jardín de Color Desértico", 14, "sqft", "surface", "plant", "#708c36", textures.plant, 30, 1.8),
  item("plant-privacy", "plants", "Privacy Hedge", "Seto de Privacidad", 145, "linearFt", "linear", "plant", "#37643b", textures.grass, 34, 3.5),

  item("wall-stacked-stone", "walls", "Stacked Stone Wall", "Muro de Piedra Apilada", 38, "linearFt", "linear", "wall", "#8c694c", textures.stone, 36, 3.5),
  item("wall-cmu-stucco", "walls", "Stucco CMU Wall", "Muro de Bloque con Estuco", 32, "linearFt", "linear", "wall", "#c6ad89", textures.wall, 36, 3.5),
  item("wall-seat", "walls", "Seat Wall with Cap", "Muro Asiento con Corona", 44, "linearFt", "linear", "wall", "#9a7655", textures.wall, 32, 3.2),
  item("drain-french", "walls", "French Drain Channel", "Canal de Drenaje Francés", 24, "linearFt", "linear", "water", "#667b80", textures.gravel, 34, 4.5),
  item("curbing-concrete", "walls", "Concrete Landscape Curb", "Bordillo de Concreto", 14, "linearFt", "linear", "wall", "#a8a29e", textures.paver, 36, 5),

  item("pergola-cedar", "structures", "Cedar Pergola", "Pérgola de Cedro", 7800, "each", "object", "pergola", "#895b32", textures.wood, 32, 1.45),
  item("pergola-aluminum", "structures", "Modern Aluminum Pergola", "Pérgola Moderna de Aluminio", 11200, "each", "object", "pergola", "#555c60", textures.metal, 32, 1.45),
  item("shade-sail", "structures", "Triangle Shade Sail", "Vela de Sombra Triangular", 2400, "each", "object", "shade", "#d0a75d", textures.metal, 30, 1.5),
  item("ramada", "structures", "Solid Roof Ramada", "Ramada de Techo Sólido", 14800, "each", "object", "pergola", "#75583e", textures.wood, 34, 1.5),
  item("gazebo", "structures", "Backyard Gazebo", "Gazebo para Patio", 9200, "each", "object", "pergola", "#815f42", textures.wood, 30, 1.2),

  item("kitchen-linear", "cooking", "Linear Outdoor Kitchen", "Cocina Exterior Lineal", 12500, "each", "object", "kitchen", "#69635c", textures.stone, 30, 3),
  item("kitchen-lshape", "cooking", "L-Shaped Grill Island", "Isla de Parrilla en L", 17500, "each", "object", "kitchen", "#7c6958", textures.stone, 30, 1.6),
  item("pizza-oven", "cooking", "Wood-Fired Pizza Oven", "Horno de Pizza a Leña", 6500, "each", "object", "kitchen", "#9b6044", textures.brick, 18),
  item("bbq-built-in", "cooking", "Built-In BBQ Station", "Estación de BBQ Integrada", 7800, "each", "object", "kitchen", "#55595a", textures.metal, 24, 2.2),

  item("firepit-round", "fireWater", "Round Gas Fire Pit", "Fogata de Gas Redonda", 4200, "each", "object", "fire", "#8d5c3b", textures.stone, 18),
  item("fireplace", "fireWater", "Outdoor Fireplace", "Chimenea Exterior", 9800, "each", "object", "fire", "#946a4d", textures.brick, 22, 0.75),
  item("water-bowl", "fireWater", "Water Feature Bowl", "Tazón con Fuente de Agua", 2800, "each", "object", "water", "#397d8c", textures.water, 15),
  item("pondless-waterfall", "fireWater", "Pondless Waterfall", "Cascada sin Estanque", 8500, "each", "object", "water", "#397b79", textures.water, 26, 1.5),
  item("pool-spa", "fireWater", "Plunge Pool & Spa", "Alberca Pequeña y Spa", 42000, "each", "object", "water", "#2686a0", textures.water, 34, 1.6),

  item("light-path", "lighting", "LED Path Light", "Luz LED para Sendero", 185, "each", "object", "light", "#e7b94f", textures.metal, 8, 0.7),
  item("light-uplight", "lighting", "Tree & Wall Uplight", "Luz Ascendente para Árbol y Muro", 225, "each", "object", "light", "#f0c86a", textures.metal, 8, 0.7),
  item("light-bistro", "lighting", "Bistro String Lights", "Luces Colgantes Bistro", 1450, "each", "linear", "light", "#e9c46a", textures.metal, 36, 5),
  item("light-step", "lighting", "Hardscape Step Lights", "Luces para Escalones", 165, "each", "linear", "light", "#d9a441", textures.metal, 24, 4),

  item("trampoline", "recreation", "In-Ground Trampoline", "Trampolín Enterrado", 6800, "each", "object", "play", "#2e3d3d", textures.metal, 24),
  item("putting-green", "recreation", "Custom Putting Green", "Green de Golf Personalizado", 9800, "each", "surface", "play", "#176b3a", textures.grass, 34, 1.6),
  item("playset", "recreation", "Cedar Play Structure", "Juegos Infantiles de Cedro", 7200, "each", "object", "play", "#9b6238", textures.wood, 28, 1.4),
  item("bocce", "recreation", "Bocce Ball Court", "Cancha de Bochas", 11500, "each", "surface", "play", "#a79570", textures.gravel, 38, 3.5),
  item("cornhole", "recreation", "Cornhole Game Zone", "Zona de Cornhole", 1800, "each", "object", "play", "#9b6a3c", textures.wood, 22, 1.8),
  item("lounge-set", "recreation", "Outdoor Lounge Set", "Sala Exterior", 3400, "each", "object", "play", "#6d625a", textures.wood, 25, 1.5),
];