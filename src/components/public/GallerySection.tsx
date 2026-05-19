"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function GallerySection() {
  const { data: images = [], isLoading } = useQuery({
    queryKey: ["public-gallery"],
    queryFn: async () => {
      const { data } = await axios.get("/api/gallery");
      return data.data;
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <section id="gallery" className="py-24 bg-black overflow-hidden relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <span className="text-primary-green text-xs font-bold uppercase tracking-[0.2em] mb-4 block font-sans">
            Visual Experience
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white font-sans">
            Our Dental Gallery
          </h2>
        </div>
        <div className="h-[250px] flex items-center justify-center">
          <Loader2 className="animate-spin text-primary-green" size={32} />
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return null;
  }

  // Render multiple sets to make sure the horizontal track is long enough and loops seamlessly
  const repeatCount = Math.ceil(6 / images.length);
  const baseSet = Array(repeatCount).fill(images).flat();
  const itemsSet = [...baseSet, ...baseSet];


  return (
    <section id="gallery" className="py-24 bg-black overflow-hidden relative border-t border-white/5">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-green/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <span className="text-primary-green text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
          Visual Experience
        </span>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white font-sans">
          Our Dental Gallery
        </h2>
        <p className="text-slate-400 font-medium leading-relaxed max-w-xl mx-auto mt-4 text-base font-sans">
          Step into our ultra-modern clinic facilities designed for luxury, comfort, and state-of-the-art care.
        </p>
      </div>

      {isLoading ? (
        <div className="h-[250px] flex items-center justify-center">
          <Loader2 className="animate-spin text-primary-green" size={32} />
        </div>
      ) : (
        <div className="relative w-full overflow-hidden py-4 flex select-none group">
          {/* Left/Right overlay gradients for soft fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          {/* Marquee Track */}
          <div className="flex gap-6 w-max animate-marquee hover:[animation-play-state:paused]">
            {itemsSet.map((image: any, index: number) => (
              <div 
                key={`${image.id || index}-${index}`}
                className="relative w-[300px] h-[200px] sm:w-[360px] sm:h-[240px] rounded-[24px] overflow-hidden border border-white/10 flex-shrink-0 group/card transition-all duration-500 hover:border-primary-green/30"
              >
                <img
                  src={image.imageUrl}
                  alt="Adam Clinic Gallery Image"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
