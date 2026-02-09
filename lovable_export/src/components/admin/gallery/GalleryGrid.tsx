import { Gallery } from "@/hooks/useGalleries";
import { GalleryCard } from "./GalleryCard";

interface GalleryGridProps {
  galleries: Gallery[];
  onGalleryClick: (gallery: Gallery) => void;
}

export function GalleryGrid({ galleries, onGalleryClick }: GalleryGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {galleries.map((gallery, index) => (
        <GalleryCard
          key={gallery.id}
          gallery={gallery}
          onClick={() => onGalleryClick(gallery)}
          index={index}
        />
      ))}
    </div>
  );
}
