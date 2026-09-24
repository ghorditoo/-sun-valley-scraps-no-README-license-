"use client";

import Image from "next/image";
import { useLanguage } from "@/i18n/LanguageProvider";
import { featuredProjects } from "@/data/featuredProjects";

export function FeaturedProjects() {
  const { t } = useLanguage();

  return (
    <section className="bg-amber-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">{t.featured.heading}</h2>
          <p className="mt-3 text-stone-600">{t.featured.subheading}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lg"
            >
              <Image
                src={project.src}
                alt={t.featured.projects[project.captionKey]}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
              <p className="absolute bottom-4 left-4 right-4 text-sm font-semibold text-white">
                {t.featured.projects[project.captionKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
