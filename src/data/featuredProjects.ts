export type FeaturedProject = {
  id: string;
  src: string;
  captionKey: "puttingGreen" | "poolTurf" | "project3";
};

// Real client project photography — add more by dropping files in /public/gallery/featured/.
export const featuredProjects: FeaturedProject[] = [
  {
    id: "putting-green-backyard",
    src: "/gallery/featured/putting-green-backyard.jpg",
    captionKey: "puttingGreen",
  },
  {
    id: "pool-turf-pavers",
    src: "/gallery/featured/pool-turf-pavers.jpg",
    captionKey: "poolTurf",
  },
  {
    id: "project-3",
    src: "/gallery/featured/project-3.jpg",
    captionKey: "project3",
  },
];
