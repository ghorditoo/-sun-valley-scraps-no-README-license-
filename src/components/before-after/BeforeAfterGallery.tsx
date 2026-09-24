"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { beforeAfterProjects } from "@/data/projects";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

export function BeforeAfterGallery() {
  const { t } = useLanguage();

  return (
    <section id="gallery" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">{t.beforeAfter.heading}</h2>
        <p className="mt-3 text-stone-600">{t.beforeAfter.subheading}</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {beforeAfterProjects.map((project) => (
          <div key={project.id}>
            <BeforeAfterSlider project={project} />
          </div>
        ))}
      </div>
    </section>
  );
}
