export type ServiceType = "pavers" | "turf" | "drainage" | "redesign" | "maintenance";
export type VisitType = "site" | "virtual";

export type PlacedMaterialItem = {
  id: string;
  materialId: string;
  xPct: number; // position as % of image width, for responsive placement
  yPct: number;
  widthPct: number;
  rotationDeg: number;
};

export type YardDesignMode = "photo" | "virtual" | "camera" | "manual";

export type YardScanPoint = {
  xPct: number;
  yPct: number;
};

export type YardMeasurements = {
  yardLengthFt: number;
  yardWidthFt: number;
  houseWidthFt: number;
  houseDepthFt: number;
  exteriorColor: string;
};

export type MaterialCategory =
  | "pavers"
  | "stone"
  | "ground"
  | "turf"
  | "plants"
  | "walls"
  | "structures"
  | "cooking"
  | "fireWater"
  | "lighting"
  | "recreation";

export type MaterialVisual =
  | "paver"
  | "brick"
  | "stone"
  | "gravel"
  | "soil"
  | "grass"
  | "plant"
  | "wall"
  | "pergola"
  | "shade"
  | "kitchen"
  | "fire"
  | "water"
  | "light"
  | "play";

export type YardPlan = {
  photoDataUrl: string | null;
  designMode?: YardDesignMode;
  virtualBackdrop?: "desert" | "modern" | "poolside";
  scanPoints?: YardScanPoint[];
  measurements?: YardMeasurements;
  areaSqFt: number;
  items: PlacedMaterialItem[];
  estimatedTotal: number;
};

export type BookingPrefill = {
  service?: ServiceType;
  yardPlan?: YardPlan;
};

export type Material = {
  id: string;
  category: MaterialCategory;
  name: string;
  nameEs: string;
  price: number;
  priceUnit: "sqft" | "linearFt" | "each";
  placement: "surface" | "linear" | "object";
  visual: MaterialVisual;
  swatchColor: string;
  texture: string;
  defaultWidthPct: number;
  aspectRatio: number;
};
