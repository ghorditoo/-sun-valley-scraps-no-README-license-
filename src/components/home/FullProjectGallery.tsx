"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { showcasePhotos } from "@/data/showcasePhotos";

export function FullProjectGallery() {
  const [openSrc, setOpenSrc] = useState<string | null>(null);

  return (
    <section id="gallery-full" className="bg-stone-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
          {showcasePhotos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setOpenSrc(photo.src)}
              className="relative block w-full overflow-hidden rounded-xl"
            >
              <Image
                src={photo.src}
                alt="Sun Valley Scraps completed project"
                width={400}
                height={500}
                className="w-full object-cover transition duration-300 hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {openSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenSrc(null)}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4"
          >
            <button
              onClick={() => setOpenSrc(null)}
              className="absolute right-5 top-5 text-white/80 hover:text-white"
              aria-label="Close"
            >
              <X size={28} />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative h-[80vh] w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={openSrc} alt="Project detail" fill className="object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
