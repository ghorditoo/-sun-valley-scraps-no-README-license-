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

export type YardPlan = {
  photoDataUrl: string | null;
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
  category: "pavers" | "turf" | "plants" | "rock" | "walls" | "repairs" | "minigolf";
  name: string;
  pricePerSqFt: number;
  thumbnail: string;
  swatchColor: string;
};
