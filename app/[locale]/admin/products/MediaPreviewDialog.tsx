"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Upload, Image as ImageIcon, Video, Save, FileImage, Camera } from "lucide-react";
import { cn, getMediaUrl } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { MediaItem } from "@/app/[locale]/admin/products/MediaUpload";
import { generateVideoPoster } from "@/lib/media";

interface MediaPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaItem: MediaItem | null;
  onUpdateMedia: (updatedItem: MediaItem) => void;
}

export default function MediaPreviewDialog({ open, onOpenChange, mediaItem, onUpdateMedia }: MediaPreviewDialogProps) {
  const t = useTranslations("products");
  const [alt, setAlt] = useState(mediaItem?.alt || "");
  const [newPosterFile, setNewPosterFile] = useState<File | null>(null);
  const [previewPosterUrl, setPreviewPosterUrl] = useState<string | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const handleGeneratePosterFromTimestamp = async () => {
    if (!videoRef.current) return;

    // Check if we have either a file or a URL
    if (!mediaItem?.file && !mediaItem?.url) return;

    setIsGeneratingPoster(true);
    try {
      let result: { posterUrl: string; posterFile: File };

      if (mediaItem.file) {
        // Use file with current timestamp
        const currentTime = videoRef.current.currentTime;
        result = await generateVideoPoster(mediaItem.file, currentTime);
      } else {
        // Use the video element directly to capture current frame
        result = await generateVideoPoster(videoRef.current);
      }

      // Clean up previous poster if exists
      if (previewPosterUrl) {
        URL.revokeObjectURL(previewPosterUrl);
      }

      setNewPosterFile(result.posterFile);
      setPreviewPosterUrl(result.posterUrl);
    } catch (error) {
      console.error("Failed to generate poster:", error);
      // You could add a toast notification here
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const currentPosterUrl = previewPosterUrl || mediaItem.poster;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col !max-w-5xl h-[90vh] p-1">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            {mediaItem.type === "VIDEO" ? <Video className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            {t("media preview")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex lg:flex-row flex-col flex-1 h-0 overflow-y-auto">
          {/* Media Preview Area */}
          <div className="flex flex-1 justify-center items-center p-6">
            <div className="relative flex justify-center items-center w-full h-full">
              {mediaItem.type === "VIDEO" ? (
                <video
                  ref={videoRef}
                  src={getMediaUrl(mediaItem.url!)}
                  poster={getMediaUrl(mediaItem.poster)}
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
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col w-full lg:w-80 p-1 border-l">
            {/* Alt Text Section */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6">
              {/* Alt Text Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <label className="font-medium text-sm">{t("alt text")}</label>
                </div>
                <Input
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder={t("describe this media")}
                  className="w-full"
                />
                <p className="text-muted-foreground text-xs">{t("provide descriptive alt text")}</p>
              </div>

              {/* Poster Upload Section - Only for Videos */}
              {mediaItem.type === "VIDEO" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-muted-foreground" />
                    <label className="font-medium text-sm">{t("video thumbnail")}</label>
                  </div>

                  {/* Current Poster Preview */}
                  {currentPosterUrl && (
                    <div className="group relative">
                      <img
                        src={getMediaUrl(currentPosterUrl)}
                        alt="Video thumbnail"
                        className="w-full h-32 object-cover border rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemovePoster}
                        className="top-2 right-2 absolute w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      {newPosterFile && (
                        <div className="bottom-2 left-2 absolute px-2 py-1 rounded bg-black/70 text-white text-xs">
                          New
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    {/* Upload Button */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => posterInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {currentPosterUrl ? t("change thumbnail") : t("upload thumbnail")}
                    </Button>

                    {/* Generate Poster from Current Timestamp */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGeneratePosterFromTimestamp}
                      disabled={isGeneratingPoster || (!mediaItem?.file && !mediaItem?.url)}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {isGeneratingPoster ? t("generating;;;") : t("capture current frame")}
                    </Button>
                  </div>

                  <input
                    ref={posterInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePosterUpload}
                    className="hidden"
                  />

                  <p className="text-muted-foreground text-xs">{t("custom thumbnail description")}</p>
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
              <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
