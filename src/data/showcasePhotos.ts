export type ShowcasePhoto = { id: string; src: string };

// Real completed-project photography, auto-converted from client-provided HEIC originals.
// Drop additional finished-work photos into /public/gallery/showcase/ following this naming pattern.
export const showcasePhotos: ShowcasePhoto[] = Array.from({ length: 27 }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  return { id: `project-${num}`, src: `/gallery/showcase/project-${num}.jpg` };
});
