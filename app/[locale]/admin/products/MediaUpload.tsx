"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Upload, Image as ImageIcon, Video, Plus, Edit } from "lucide-react";
import { cn, getMediaUrl } from "@/lib/utils";
import MediaPreviewDialog from "./MediaPreviewDialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { generateVideoPoster } from "@/lib/media";
import { toast } from "sonner";

export interface MediaItem {
  id: string;
  file?: File;
  url?: string;
  poster?: string;
  posterFile?: File;
  type: "IMAGE" | "VIDEO";
  sortOrder: number;
  alt?: string;
}

const allowedImageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff", "tif", "ico", "avif"];
const allowedVideoExtensions = ["mp4", "webm", "ogg"];

interface MediaUploadProps {
  value: MediaItem[];
  onChange: (media: MediaItem[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  className?: string;
}

// Sortable Media Item Component
interface SortableMediaItemProps {
  item: MediaItem;
  index: number;
  onRemove: (id: string) => void;
  onPreview: (item: MediaItem) => void;
}

function SortableMediaItem({ item, index, onRemove, onPreview }: SortableMediaItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative aspect-square border-2 border-transparent hover:border-primary/50 border-dashed rounded-lg cursor-move",
        isDragging && "opacity-50 z-10" // Reduce opacity when dragging instead of hiding
      )}
    >
      <div className="relative w-full h-full overflow-hidden border rounded-lg bg-muted">
        {/* Media Preview */}
        {item.type === "VIDEO" ? (
          <div className="flex justify-center items-center w-full h-full bg-gray-100">
            {item.poster ? (
              <img src={getMediaUrl(item.poster)} alt="Video thumbnail" className="w-full h-full object-cover" />
            ) : (
              <video src={getMediaUrl(item.url!)} className="w-full h-full object-cover" />
            )}
          </div>
        ) : (
          <img src={getMediaUrl(item.url!)} alt="Media preview" className="w-full h-full object-cover" />
        )}

        {/* Media Type Badge */}
        <div className="top-2 left-2 absolute">
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/50 text-white text-xs">
            {item.type === "VIDEO" ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
          </div>
        </div>

        {/* Sort Order Badge */}
        <div className="top-2 right-2 absolute">
          <div className="flex justify-center items-center w-6 h-6 rounded-full bg-black/50 font-medium text-white text-xs">
            {index + 1}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="right-2 bottom-2 absolute flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(item);
            }}
            className="w-8 h-8 p-0"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* File Info */}
        {/* <div className="bottom-2 left-2 absolute max-w-[calc(100%-3rem)] px-2 py-1 rounded bg-black/50 text-white text-xs">
          {item.file && (
            <p className="text-gray-300">
              {(item.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div> */}
      </div>
    </div>
  );
}

export default function MediaUpload({
  value = [],
  onChange,
  maxFiles = 10,
  maxFileSize = 50,
  className,
}: MediaUploadProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedMediaItem, setSelectedMediaItem] = useState<MediaItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Reduce activation distance for more responsive dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const createPreviewUrl = useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);

  const getFileType = (file: File): "IMAGE" | "VIDEO" => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (allowedVideoExtensions.includes(extension || "")) {
      return "VIDEO";
    }
    return "IMAGE";
  };

  const validateFile = (file: File): string | null => {
    if (maxFileSize && file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    const isValidImage = allowedImageExtensions.includes(extension || "");
    const isValidVideo = allowedVideoExtensions.includes(extension || "");

    if (!isValidImage && !isValidVideo) {
      return `File type not supported. Allowed extensions: ${[
        ...allowedImageExtensions,
        ...allowedVideoExtensions,
      ].join(", ")}`;
    }

    return null;
  };

  const handleFilesSelect = useCallback(
    async (acceptedFiles: File[]) => {
      const newMedia: MediaItem[] = [];
      const errors: string[] = [];

      for (let index = 0; index < acceptedFiles.length; index++) {
        const file = acceptedFiles[index];
        const error = validateFile(file);

        if (error) {
          errors.push(`${file.name}: ${error}`);
          continue;
        }

        if (value.length + newMedia.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed`);
          break;
        }

        const mediaItem: MediaItem = {
          id: `${Date.now()}-${index}`,
          file,
          type: getFileType(file),
          sortOrder: value.length + newMedia.length,
          url: createPreviewUrl(file),
        };

        // Generate poster for videos
        if (getFileType(file) === "VIDEO") {
          try {
            const { posterUrl, posterFile } = await generateVideoPoster(file);
            mediaItem.poster = posterUrl;
            mediaItem.posterFile = posterFile;
          } catch (error) {
            console.error("Failed to generate video poster:", error);
            // Continue without poster if generation fails
          }
        }

        newMedia.push(mediaItem);
      }

      if (errors.length > 0) {
        console.error("File upload errors:", errors);
        toast.error(errors.join("\n"));
      }

      if (newMedia.length > 0) {
        onChange([...value, ...newMedia]);
      }
    },
    [value, onChange, maxFiles, validateFile, createPreviewUrl]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (active.id !== over?.id) {
      const oldIndex = value.findIndex((item) => item.id === active.id);
      const newIndex = value.findIndex((item) => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(value, oldIndex, newIndex);

        // Update sort orders
        const reorderedItems = newItems.map((item, index) => ({
          ...item,
          sortOrder: index,
        }));

        onChange(reorderedItems);
      }
    }
  };

  const removeItem = (id: string) => {
    const item = value.find((item) => item.id === id);
    if (item?.url && item.file) {
      URL.revokeObjectURL(item.url);
    }
    if (item?.poster) {
      URL.revokeObjectURL(item.poster);
    }
    const newItems = value.filter((item) => item.id !== id);

    // Update sort orders
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));

    onChange(reorderedItems);
  };

  const handlePreviewMedia = (item: MediaItem) => {
    setSelectedMediaItem(item);
    setPreviewDialogOpen(true);
  };

  const handleUpdateMedia = (updatedItem: MediaItem) => {
    const newItems = value.map((item) => (item.id === updatedItem.id ? updatedItem : item));
    onChange(newItems);
  };

  const acceptedFileTypes = {
    "image/*": allowedImageExtensions.map((ext) => `.${ext}`),
    "video/*": allowedVideoExtensions.map((ext) => `.${ext}`),
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFilesSelect,
    accept: acceptedFileTypes,
    maxFiles: maxFiles - value.length,
    maxSize: maxFileSize * 1024 * 1024,
    disabled: value.length >= maxFiles,
  });

  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Product Media
        </CardTitle>
        <p className="text-muted-foreground text-sm">Upload images and videos</p>
      </CardHeader>
      <CardContent>
        <div className={cn("space-y-4", className)}>
          {/* Upload Area with React Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "p-4 border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50",
              value.length >= maxFiles && "opacity-50 pointer-events-none"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-medium text-sm">
                {isDragActive ? "Drop files here..." : "Drop files here or click to upload"}
              </p>
              <p className="text-muted-foreground text-xs">
                Images ({allowedImageExtensions.join(", ")}) and videos ({allowedVideoExtensions.join(", ")}) up to{" "}
                {maxFileSize}MB • {value.length}/{maxFiles} files
              </p>
            </div>

            <div className="flex justify-center gap-2 mt-3">
              <Button type="button" variant="outline" size="sm" disabled={value.length >= maxFiles}>
                <Plus className="w-3 h-3 mr-1" />
                Choose Files
              </Button>
            </div>
          </div>

          {/* Media Grid with DnD */}
          {value.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              id="media-upload-grid"
            >
              <SortableContext items={value.map((item) => item.id)} strategy={rectSortingStrategy}>
                <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {value.map((item, index) => (
                    <SortableMediaItem
                      key={item.id}
                      item={item}
                      index={index}
                      onRemove={removeItem}
                      onPreview={handlePreviewMedia}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <div className="relative aspect-square overflow-hidden border rounded-lg bg-muted opacity-90 shadow-lg">
                    {(() => {
                      const activeItem = value.find((item) => item.id === activeId);
                      if (!activeItem) return null;

                      return activeItem.type === "VIDEO" ? (
                        <div className="flex justify-center items-center w-full h-full bg-gray-100">
                          {activeItem.poster ? (
                            <img
                              src={getMediaUrl(activeItem.poster)}
                              alt="Video thumbnail"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Video className="w-12 h-12 text-muted-foreground" />
                          )}
                        </div>
                      ) : (
                        <img
                          src={getMediaUrl(activeItem.url!)}
                          alt="Media preview"
                          className="w-full h-full object-cover"
                        />
                      );
                    })()}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}

          {value.length > 0 && (
            <div className="text-muted-foreground text-xs text-center">
              <strong>Drag and drop</strong> to reorder media files
            </div>
          )}

          {/* Media Preview Dialog */}
          <MediaPreviewDialog
            open={previewDialogOpen}
            onOpenChange={setPreviewDialogOpen}
            mediaItem={selectedMediaItem}
            onUpdateMedia={handleUpdateMedia}
          />
        </div>
      </CardContent>
    </Card>
  );
}
