export type ServiceCatalogItem = {
  en: string;
  es: string;
  detailEn: string;
  detailEs: string;
};

export type ServiceCategory = {
  id: string;
  icon: "fence" | "flag" | "flame" | "lightbulb" | "droplets" | "sun" | "wrench";
  nameEn: string;
  nameEs: string;
  descEn: string;
  descEs: string;
  items: ServiceCatalogItem[];
};

// Full trade catalog — organized by category so the homepage can render it as
// an expandable accordion instead of one giant wall of text.
export const serviceCatalog: ServiceCategory[] = [
  {
    id: "hardscaping",
    icon: "fence",
    nameEn: "Hardscaping & Masonry",
    nameEs: "Construcción de Exteriores y Mampostería",
    descEn: "Durable, beautiful surfaces built to handle Arizona heat and monsoon storms.",
    descEs: "Superficies duraderas y hermosas construidas para soportar el calor de Arizona y las tormentas del monzón.",
    items: [
      {
        en: "Paver Installation",
        es: "Instalación de Adoquines",
        detailEn: "Interlocking concrete pavers, permeable pavers, porcelain pavers for patios, walkways, driveways, and pool decks.",
        detailEs: "Adoquines de concreto entrelazados, adoquines permeables y adoquines de porcelana para patios, andadores, entradas y terrazas de piscina.",
      },
      {
        en: "Travertine & Natural Stone",
        es: "Travertino y Piedra Natural",
        detailEn: "Travertine tile and pavers (tumbled, honed, or chiseled edge), flagstone walkways, slate, and Arizona sandstone.",
        detailEs: "Losas y adoquines de travertino (pulido, abujardado o de borde cincelado), andadores de piedra laja, pizarra y arenisca de Arizona.",
      },
      {
        en: "Pool Deck Remodeling & Coping",
        es: "Remodelación y Coronación de Terrazas de Piscina",
        detailEn: "Pool coping stones, waterline tile, travertine overlay on existing concrete.",
        detailEs: "Piedras de coronación de piscina, azulejo de línea de agua y revestimiento de travertino sobre concreto existente.",
      },
      {
        en: "Retaining & Decorative Walls",
        es: "Muros de Contención y Decorativos",
        detailEn: "Concrete block (CMU) walls, stucco-finished planter walls, stone veneer accent walls, seating/bench walls.",
        detailEs: "Muros de bloque de concreto (CMU), muros de jardinera con acabado de estuco, muros de acento con chapa de piedra y muros tipo banca.",
      },
      {
        en: "Curbing & Borders",
        es: "Bordillos y Bordes",
        detailEn: "Extruded concrete landscape curbing, metal edging, and paver borders to separate grass/rock zones.",
        detailEs: "Bordillos de concreto extruido, bordes metálicos y bordes de adoquín para separar zonas de césped y roca.",
      },
      {
        en: "Concrete Flatwork",
        es: "Trabajos de Concreto",
        detailEn: "Broom finish, stamped decorative concrete, stained concrete, and patio extension slabs.",
        detailEs: "Acabado de escoba, concreto decorativo estampado, concreto teñido y losas de extensión de patio.",
      },
    ],
  },
  {
    id: "turf",
    icon: "flag",
    nameEn: "Synthetic Turf & Putting Greens",
    nameEs: "Césped Sintético y Greens de Golf",
    descEn: "Low-maintenance, always-green turf and custom putting greens built for desert living.",
    descEs: "Césped de bajo mantenimiento siempre verde y greens de golf personalizados, hechos para la vida en el desierto.",
    items: [
      {
        en: "Landscape Turf",
        es: "Césped Paisajístico",
        detailEn: "Pet-friendly turf with antimicrobial infill, high-traffic family turf, cooling infill (T-Cool) options for hot desert summers.",
        detailEs: "Césped apto para mascotas con relleno antimicrobiano, césped familiar de alto tráfico y opciones de relleno refrescante (T-Cool) para los calurosos veranos del desierto.",
      },
      {
        en: "Custom Putting Greens",
        es: "Greens de Golf Personalizados",
        detailEn: "Multi-hole personal golf greens with custom breaks, fringe turf, and cup/flag installation.",
        detailEs: "Greens de golf personales con múltiples hoyos, quiebres personalizados, césped de borde e instalación de copa y bandera.",
      },
      {
        en: "Turf Maintenance & Odor Treatment",
        es: "Mantenimiento de Césped y Tratamiento de Olores",
        detailEn: "Power broom revivals, infill replenishment, enzymatic pet odor wash, seam repair.",
        detailEs: "Renovación con cepillo motorizado, reposición de relleno, lavado enzimático de olores de mascotas y reparación de costuras.",
      },
    ],
  },
  {
    id: "outdoor-living",
    icon: "flame",
    nameEn: "Outdoor Living & Shade Structures",
    nameEs: "Vida al Aire Libre y Estructuras de Sombra",
    descEn: "Turn your backyard into a year-round living space with fire, shade, and water features.",
    descEs: "Convierte tu patio en un espacio habitable todo el año con fuego, sombra y elementos de agua.",
    items: [
      {
        en: "Fire Features",
        es: "Elementos de Fuego",
        detailEn: "Built-in gas fire pits, wood-burning fire pits, modern fire tables, outdoor fireplaces.",
        detailEs: "Fogatas de gas empotradas, fogatas de leña, mesas de fuego modernas y chimeneas exteriores.",
      },
      {
        en: "Outdoor Kitchens & BBQ Islands",
        es: "Cocinas Exteriores e Islas de Asador",
        detailEn: "Built-in grills, outdoor bar counters, mini-fridge cutouts, granite/tile countertops.",
        detailEs: "Parrillas empotradas, barras de bar exteriores, espacios para mini refrigerador y encimeras de granito o azulejo.",
      },
      {
        en: "Pergolas & Gazebos",
        es: "Pérgolas y Gazebos",
        detailEn: "Alumawood shade structures, custom cedar/redwood pergolas, motorized louvered pergolas.",
        detailEs: "Estructuras de sombra Alumawood, pérgolas personalizadas de cedro o secuoya y pérgolas motorizadas de láminas.",
      },
      {
        en: "Water Features",
        es: "Elementos de Agua",
        detailEn: "Stacked-stone water fountains, sheer descent waterfalls, pondless water features.",
        detailEs: "Fuentes de piedra apilada, cascadas de descenso laminar y elementos de agua sin estanque.",
      },
    ],
  },
  {
    id: "lighting",
    icon: "lightbulb",
    nameEn: "Low-Voltage Landscape Lighting",
    nameEs: "Iluminación de Paisaje de Bajo Voltaje",
    descEn: "Highlight your hardscaping and desert plants after dark with professional lighting design.",
    descEs: "Resalta tu construcción de exteriores y plantas del desierto después del atardecer con un diseño de iluminación profesional.",
    items: [
      {
        en: "Path & Step Lights",
        es: "Luces de Camino y Escalones",
        detailEn: "Pathway bollards, directional path lights, step riser recessed lighting.",
        detailEs: "Bolardos de camino, luces direccionales de sendero e iluminación empotrada en contrahuellas de escalones.",
      },
      {
        en: "Accent & Up-Lighting",
        es: "Iluminación de Acento y Ascendente",
        detailEn: "Tree up-lighting (spotlighting palms and saguaros), architectural wall washes, pillar lights.",
        detailEs: "Iluminación ascendente de árboles (destacando palmeras y saguaros), baños de luz en muros arquitectónicos y luces de pilar.",
      },
      {
        en: "Hardscape & Under-Cap Lighting",
        es: "Iluminación de Construcción y Bajo Remate",
        detailEn: "LED strip and fixture lighting under retaining wall caps, BBQ counters, and bench seats.",
        detailEs: "Tiras LED e iluminación bajo remates de muros de contención, encimeras de asador y bancas.",
      },
      {
        en: "Smart Lighting Systems",
        es: "Sistemas de Iluminación Inteligente",
        detailEn: "Wi-Fi/Bluetooth transformers, zoned color-changing RGB LEDs, app-scheduled dimming.",
        detailEs: "Transformadores Wi-Fi/Bluetooth, LEDs RGB de cambio de color por zonas y atenuación programada desde una app.",
      },
    ],
  },
  {
    id: "irrigation",
    icon: "droplets",
    nameEn: "Irrigation & Water Management",
    nameEs: "Riego y Manejo del Agua",
    descEn: "Smart water systems that keep your landscape thriving while meeting desert water restrictions.",
    descEs: "Sistemas de riego inteligentes que mantienen tu paisaje próspero cumpliendo con las restricciones de agua del desierto.",
    items: [
      {
        en: "Drip Irrigation Systems",
        es: "Sistemas de Riego por Goteo",
        detailEn: "Low-flow micro-drip emitters for native desert shrubs, trees, and cacti.",
        detailEs: "Emisores de micro-goteo de bajo flujo para arbustos, árboles y cactus nativos del desierto.",
      },
      {
        en: "Smart Controllers & Timers",
        es: "Controladores y Temporizadores Inteligentes",
        detailEn: "Wi-Fi weather-sensing irrigation timers (Rachio, Hunter, Rain Bird) meeting local water utility rebates.",
        detailEs: "Temporizadores de riego Wi-Fi con sensor climático (Rachio, Hunter, Rain Bird) que califican para reembolsos de la empresa de agua local.",
      },
      {
        en: "Sprinkler Systems",
        es: "Sistemas de Aspersores",
        detailEn: "Pop-up and rotary sprinkler head installations for natural sod zones.",
        detailEs: "Instalación de aspersores emergentes y rotativos para zonas de césped natural.",
      },
      {
        en: "Drainage & Water Catchment",
        es: "Drenaje y Captación de Agua",
        detailEn: "French drains, channel drains, catch basins, surface grading to prevent monsoon pooling.",
        detailEs: "Drenes franceses, drenes de canal, cajas de captación y nivelación superficial para evitar encharcamientos durante el monzón.",
      },
    ],
  },
  {
    id: "xeriscape",
    icon: "sun",
    nameEn: "Desert Landscaping (Xeriscape) & Plant Material",
    nameEs: "Paisajismo del Desierto (Xerojardinería) y Plantas",
    descEn: "Authentic Sonoran Desert plant palettes and decorative rock designed to thrive with minimal water.",
    descEs: "Paletas auténticas de plantas del Desierto de Sonora y roca decorativa diseñadas para prosperar con poca agua.",
    items: [
      {
        en: "Decorative Ground Cover",
        es: "Cobertura de Suelo Decorativa",
        detailEn: "Decomposed granite (surface rock in sizes like 1/4\", 1/2\", minus, or screen), river rock swales, rip-rap rock for erosion control.",
        detailEs: "Granito descompuesto (roca superficial en tamaños de 1/4\", 1/2\", minus o cribado), cauces de piedra de río y roca de escollera para control de erosión.",
      },
      {
        en: "Boulders & Accents",
        es: "Rocas y Acentos",
        detailEn: "Surface accent boulders (Apache Brown, Surface Select, Table Mesa, Granite Boulders).",
        detailEs: "Rocas de acento superficial (Apache Brown, Surface Select, Table Mesa, rocas de granito).",
      },
      {
        en: "Desert Trees & Palms",
        es: "Árboles y Palmeras del Desierto",
        detailEn: "Palo Verde, Desert Willow, Chilean Mesquite, Ironwood, Date Palms, Fan Palms.",
        detailEs: "Palo Verde, Mimbre del Desierto, Mezquite Chileno, Palo Fierro, Palmeras Datileras y Palmeras Abanico.",
      },
      {
        en: "Cacti & Succulents",
        es: "Cactus y Suculentas",
        detailEn: "Saguaro, Golden Barrel, Agave, Red Yucca, Ocotillo, Prickly Pear.",
        detailEs: "Saguaro, Biznaga Dorada, Agave, Yuca Roja, Ocotillo y Nopal.",
      },
      {
        en: "Flowering Shrubs & Accents",
        es: "Arbustos y Acentos Florales",
        detailEn: "Bougainvillea, Lantana, Texas Sage, Bird of Paradise.",
        detailEs: "Buganvilia, Lantana, Salvia de Texas y Ave del Paraíso.",
      },
    ],
  },
  {
    id: "repairs",
    icon: "wrench",
    nameEn: "Repairs, Restoration & Maintenance",
    nameEs: "Reparaciones, Restauración y Mantenimiento",
    descEn: "Keep your investment looking new with expert repairs and seasonal maintenance.",
    descEs: "Mantén tu inversión luciendo como nueva con reparaciones expertas y mantenimiento estacional.",
    items: [
      {
        en: "Paver & Travertine Repairs",
        es: "Reparación de Adoquines y Travertino",
        detailEn: "Sunken/uneven paver leveling, polymeric sand re-sanding, crack repair, power washing, and protective matte/wet-look sealing.",
        detailEs: "Nivelación de adoquines hundidos o desiguales, resane con arena polimérica, reparación de grietas, lavado a presión y sellado protector mate o efecto húmedo.",
      },
      {
        en: "Irrigation Repairs",
        es: "Reparación de Riego",
        detailEn: "Valve replacement, mainline PVC leak detection and repair, emitter unclogging, backflow preventer replacement.",
        detailEs: "Reemplazo de válvulas, detección y reparación de fugas en tubería principal de PVC, destape de emisores y reemplazo de prevención de reflujo.",
      },
      {
        en: "Lighting Repairs",
        es: "Reparación de Iluminación",
        detailEn: "Cut wire splicing, low-voltage transformer troubleshooting, burned-out LED bulb replacements.",
        detailEs: "Empalme de cables cortados, diagnóstico de transformadores de bajo voltaje y reemplazo de focos LED fundidos.",
      },
      {
        en: "Yard Cleanups & Tree Service",
        es: "Limpieza de Patio y Servicio de Árboles",
        detailEn: "Monsoon storm cleanup, palm tree skinning/trimming, cactus removal, weed pre-emergent treatments, winter ryegrass overseeding.",
        detailEs: "Limpieza después de tormentas de monzón, deshoje y poda de palmeras, remoción de cactus, tratamientos preemergentes para maleza y resiembra de pasto de invierno.",
      },
    ],
  },
];
