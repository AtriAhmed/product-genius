"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  X,
  Upload,
  Image as ImageIcon,
  Video,
  Save,
  FileImage,
} from "lucide-react";
import { cn, getMediaUrl } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { MediaItem } from "@/app/[locale]/admin/products/MediaUpload";

interface MediaPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaItem: MediaItem | null;
  onUpdateMedia: (updatedItem: MediaItem) => void;
}

export default function MediaPreviewDialog({
  open,
  onOpenChange,
  mediaItem,
  onUpdateMedia,
}: MediaPreviewDialogProps) {
  const t = useTranslations("products");
  const [alt, setAlt] = useState(mediaItem?.alt || "");
  const [newPosterFile, setNewPosterFile] = useState<File | null>(null);
  const [previewPosterUrl, setPreviewPosterUrl] = useState<string | null>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  // Update local state when mediaItem changes
  useEffect(() => {
    if (mediaItem) {
      setAlt(mediaItem.alt || "");
      setNewPosterFile(null);
      setPreviewPosterUrl(null);
    }
  }, [mediaItem]);

  if (!mediaItem) return null;

  const handlePosterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setNewPosterFile(file);
      const url = URL.createObjectURL(file);
      setPreviewPosterUrl(url);
    }
  };

  const handleSave = () => {
    const updatedItem: MediaItem = {
      ...mediaItem,
      alt,
    };

    // If there's a new poster file, update it
    if (newPosterFile && previewPosterUrl) {
      updatedItem.posterFile = newPosterFile;
      updatedItem.poster = previewPosterUrl;
    }

    onUpdateMedia(updatedItem);
    onOpenChange(false);
  };

  const handleRemovePoster = () => {
    if (previewPosterUrl) {
      URL.revokeObjectURL(previewPosterUrl);
    }
    setNewPosterFile(null);
    setPreviewPosterUrl(null);
  };

  const currentPosterUrl = previewPosterUrl || mediaItem.poster;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col !max-w-5xl h-[90vh] p-1">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            {mediaItem.type === "VIDEO" ? (
              <Video className="w-5 h-5" />
            ) : (
              <ImageIcon className="w-5 h-5" />
            )}
            {t("media preview")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 h-0 flex flex-col lg:flex-row overflow-y-auto">
          {/* Media Preview Area */}
          <div className="flex-1 p-6 flex items-center justify-center ">
            <div className="relative max-w-full max-h-full">
              {mediaItem.type === "VIDEO" ? (
                <video
                  src={getMediaUrl(mediaItem.url!)}
                  controls
                  className="max-w-full max-h-full rounded-lg shadow-lg"
                  //   poster={
                  //     currentPosterUrl ? getMediaUrl(currentPosterUrl) : undefined
                  //   }
                />
              ) : (
                <img
                  src={getMediaUrl(mediaItem.url!)}
                  alt={alt || "Media preview"}
                  className="max-w-full max-h-[500px] rounded-lg shadow-lg object-contain"
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col w-full lg:w-80 border-l p-1">
            {/* Alt Text Section */}
            <div className="flex-1 px-6 space-y-6 overflow-y-auto">
              {/* Alt Text Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium">{t("alt text")}</label>
                </div>
                <Input
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder={t("describe this media")}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {t("provide descriptive alt text")}
                </p>
              </div>

              {/* Poster Upload Section - Only for Videos */}
              {mediaItem.type === "VIDEO" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-muted-foreground" />
                    <label className="text-sm font-medium">
                      {t("video thumbnail")}
                    </label>
                  </div>

                  {/* Current Poster Preview */}
                  {currentPosterUrl && (
                    <div className="relative group">
                      <img
                        src={getMediaUrl(currentPosterUrl)}
                        alt="Video thumbnail"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemovePoster}
                        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      {newPosterFile && (
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          New
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upload Button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => posterInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {currentPosterUrl
                      ? t("change thumbnail")
                      : t("upload thumbnail")}
                  </Button>

                  <input
                    ref={posterInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePosterUpload}
                    className="hidden"
                  />

                  <p className="text-xs text-muted-foreground">
                    {t("custom thumbnail description")}
                  </p>
                </div>
              )}

              {/* Media Info */}
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={handleSave} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {t("save changes")}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
