import { NextResponse } from "next/server";
import type { PropertyModel } from "@/lib/types";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

type OverpassElement = {
  center?: { lat: number; lon: number };
  geometry?: Array<{ lat: number; lon: number }>;
  tags?: Record<string, string>;
};

const cache = new Map<string, { expiresAt: number; value: PropertyModel }>();
let lastPublicLookupAt = 0;

function distanceSquared(latitude: number, longitude: number, element: OverpassElement) {
  const geometry = element.geometry ?? [];
  const center = element.center ?? (geometry.length
    ? {
        lat: geometry.reduce((sum, point) => sum + point.lat, 0) / geometry.length,
        lon: geometry.reduce((sum, point) => sum + point.lon, 0) / geometry.length,
      }
    : undefined);
  if (!center) return Number.POSITIVE_INFINITY;
  return (center.lat - latitude) ** 2 + (center.lon - longitude) ** 2;
}

function containsPoint(latitude: number, longitude: number, geometry: Array<{ lat: number; lon: number }>) {
  let inside = false;
  for (let i = 0, j = geometry.length - 1; i < geometry.length; j = i++) {
    const a = geometry[i];
    const b = geometry[j];
    if ((a.lat > latitude) !== (b.lat > latitude) && longitude < ((b.lon - a.lon) * (latitude - a.lat)) / (b.lat - a.lat) + a.lon) {
      inside = !inside;
    }
  }
  return inside;
}

function normalizeFootprint(geometry: Array<{ lat: number; lon: number }>) {
  const latitudes = geometry.map((point) => point.lat);
  const longitudes = geometry.map((point) => point.lon);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeRange = Math.max(maxLatitude - minLatitude, 0.000001);
  const longitudeRange = Math.max(maxLongitude - minLongitude, 0.000001);
  return geometry.map((point) => ({
    xPct: ((point.lon - minLongitude) / longitudeRange) * 100,
    yPct: (1 - (point.lat - minLatitude) / latitudeRange) * 100,
  }));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { address?: string } | null;
  const address = body?.address?.trim();
  if (!address || address.length < 8 || address.length > 180) {
    return NextResponse.json({ error: "Enter a complete property address." }, { status: 400 });
  }

  const cacheKey = address.toLocaleLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return NextResponse.json(cached.value);

  const now = Date.now();
  if (now - lastPublicLookupAt < 1100) {
    return NextResponse.json({ error: "Please wait a moment before another address lookup." }, { status: 429 });
  }
  lastPublicLookupAt = now;

  const geocoderBase = process.env.NOMINATIM_BASE_URL ?? "https://nominatim.openstreetmap.org";
  const overpassBase = process.env.OVERPASS_API_URL ?? "https://overpass-api.de/api/interpreter";
  const userAgent = "SunValleyScraps-YardBuilder/1.0 (https://sunvalleyscraps.com)";

  try {
    const searchUrl = new URL("/search", geocoderBase);
    searchUrl.searchParams.set("q", address);
    searchUrl.searchParams.set("format", "jsonv2");
    searchUrl.searchParams.set("limit", "1");
    const geocodeResponse = await fetch(searchUrl, {
      headers: { "User-Agent": userAgent, Referer: "https://sunvalleyscraps.com/" },
      next: { revalidate: 2592000 },
    });
    if (!geocodeResponse.ok) throw new Error("Geocoding failed");
    const locations = await geocodeResponse.json() as NominatimResult[];
    if (!locations[0]) return NextResponse.json({ error: "Address not found." }, { status: 404 });

    const latitude = Number(locations[0].lat);
    const longitude = Number(locations[0].lon);
    const query = `[out:json][timeout:12];way(around:65,${latitude},${longitude})["building"];out center geom;`;
    const buildingResponse = await fetch(overpassBase, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": userAgent },
      body: new URLSearchParams({ data: query }),
      next: { revalidate: 2592000 },
    });
    if (!buildingResponse.ok) throw new Error("Building lookup failed");
    const buildingData = await buildingResponse.json() as { elements?: OverpassElement[] };
    const candidates = (buildingData.elements ?? []).filter((element) => (element.geometry?.length ?? 0) >= 3);
    const building = candidates.find((element) => containsPoint(latitude, longitude, element.geometry!))
      ?? candidates.sort((left, right) => distanceSquared(latitude, longitude, left) - distanceSquared(latitude, longitude, right))[0];
    if (!building?.geometry) return NextResponse.json({ error: "No open building footprint is available for this address." }, { status: 404 });

    const latitudes = building.geometry.map((point) => point.lat);
    const longitudes = building.geometry.map((point) => point.lon);
    const latitudeMeters = (Math.max(...latitudes) - Math.min(...latitudes)) * 111320;
    const longitudeMeters = (Math.max(...longitudes) - Math.min(...longitudes)) * 111320 * Math.cos(latitude * Math.PI / 180);
    const levels = Number.parseFloat(building.tags?.["building:levels"] ?? "1");
    const heightMeters = Number.parseFloat(building.tags?.height ?? "") || Math.max(3, levels * 3);
    const result: PropertyModel = {
      displayName: locations[0].display_name,
      latitude,
      longitude,
      footprint: normalizeFootprint(building.geometry),
      heightFt: Math.round(heightMeters * 3.28084),
      widthFt: Math.max(8, Math.round(longitudeMeters * 3.28084)),
      depthFt: Math.max(8, Math.round(latitudeMeters * 3.28084)),
      source: "OpenStreetMap",
    };
    cache.set(cacheKey, { expiresAt: Date.now() + 2592000000, value: result });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Property lookup is temporarily unavailable." }, { status: 502 });
  }
}