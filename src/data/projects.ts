export type BeforeAfterProject = {
  id: string;
  titleKey: string;
  beforeSrc: string;
  afterSrc: string;
};

// Drop your high-res JPG/PNG project photos into /public/gallery/ using these filenames.
// (Convert .HEIC files to .jpg first — browsers cannot render HEIC natively.)
export const beforeAfterProjects: BeforeAfterProject[] = [
  {
    id: "backyard-paver-patio",
    titleKey: "Backyard Paver Patio & Fire Pit",
    beforeSrc: "/gallery/backyard-paver-patio-before.jpg",
    afterSrc: "/gallery/backyard-paver-patio-after.jpg",
  },
  {
    id: "front-yard-turf",
    titleKey: "Front Yard Turf Conversion",
    beforeSrc: "/gallery/front-yard-turf-before.jpg",
    afterSrc: "/gallery/front-yard-turf-after.jpg",
  },
  {
    id: "retaining-wall-redesign",
    titleKey: "Sloped Yard Retaining Wall Redesign",
    beforeSrc: "/gallery/retaining-wall-before.jpg",
    afterSrc: "/gallery/retaining-wall-after.jpg",
  },
];
