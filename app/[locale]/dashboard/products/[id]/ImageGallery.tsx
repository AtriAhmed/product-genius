import { useState } from "react";
import { Package, Play } from "lucide-react";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils";
import { Media } from "./types";

interface ImageGalleryProps {
  media: Media[];
}

export function ImageGallery({ media }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (media.length === 0) {
    return (
      <div className="space-y-4">
        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
          <Package className="w-16 h-16 text-gray-400" />
        </div>
      </div>
    );
  }

  const selectedMedia = media[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main Display */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        {selectedMedia.type === "IMAGE" ? (
          <Image
            src={getMediaUrl(selectedMedia.url)}
            alt="Product"
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <video
            src={getMediaUrl(selectedMedia.url)}
            controls
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                selectedIndex === index ? "border-primary" : "border-gray-200"
              }`}
            >
              {item.type === "IMAGE" ? (
                <Image
                  src={getMediaUrl(item.url)}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <div className="">
                    <Play className="size-5" />
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
