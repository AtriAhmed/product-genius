import { useState } from "react";
import { Package, Play } from "lucide-react";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils";
import { Media } from "@/types";

interface ImageGalleryProps {
  media: Media[];
}

export function ImageGallery({ media }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (media.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center aspect-square rounded-lg bg-gray-200">
          <Package className="w-16 h-16 text-gray-400" />
        </div>
      </div>
    );
  }

  const selectedMedia = media[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main Display */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted-background">
        {selectedMedia.type === "IMAGE" ? (
          <Image
            src={getMediaUrl(selectedMedia.url!)}
            alt="Product"
            fill
            className="object-contain hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <video
            src={getMediaUrl(selectedMedia.url!)}
            {...(selectedMedia.poster
              ? { poster: getMediaUrl(selectedMedia.poster) }
              : {})}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                selectedIndex === index
                  ? "border-primary"
                  : "border-muted-background"
              }`}
            >
              {item.type === "IMAGE" ? (
                <Image
                  src={getMediaUrl(item.url!)}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  {item.poster ? (
                    <Image
                      src={getMediaUrl(item.poster!)}
                      alt={`Video thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <video
                      src={getMediaUrl(selectedMedia.url!)}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 flex justify-center items-center bg-black/25">
                    <Play className="size-5 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
