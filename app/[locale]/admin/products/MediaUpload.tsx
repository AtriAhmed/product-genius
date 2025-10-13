"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

interface MediaUploadProps {
  value: MediaItem[];
  onChange: (media: MediaItem[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
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

function SortableMediaItem({
  item,
  index,
  onRemove,
  onPreview,
}: SortableMediaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  console.log("-------------------- item --------------------");
  console.log(item);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative group aspect-square rounded-lg border-2 border-dashed border-transparent hover:border-primary/50 cursor-move",
        isDragging && "opacity-50 z-10" // Reduce opacity when dragging instead of hiding
      )}
    >
      <div className="relative w-full h-full rounded-lg border bg-muted overflow-hidden">
        {/* Media Preview */}
        {item.type === "VIDEO" ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            {item.poster ? (
              <img
                src={getMediaUrl(item.poster)}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={getMediaUrl(item.url!)}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ) : (
          <img
            src={getMediaUrl(item.url!)}
            alt="Media preview"
            className="w-full h-full object-cover"
          />
        )}

        {/* Media Type Badge */}
        <div className="absolute top-2 left-2">
          <div className="bg-black/50 rounded px-2 py-1 text-xs text-white flex items-center gap-1">
            {item.type === "VIDEO" ? (
              <Video className="w-3 h-3" />
            ) : (
              <ImageIcon className="w-3 h-3" />
            )}
          </div>
        </div>

        {/* Sort Order Badge */}
        <div className="absolute top-2 right-2">
          <div className="bg-black/50 rounded-full w-6 h-6 flex items-center justify-center text-xs text-white font-medium">
            {index + 1}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(item);
            }}
            className="h-8 w-8 p-0"
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
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* File Info */}
        <div className="absolute bottom-2 left-2 bg-black/50 rounded px-2 py-1 text-xs text-white max-w-[calc(100%-3rem)]">
          {item.file && (
            <p className="text-gray-300">
              {(item.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MediaUpload({
  value = [],
  onChange,
  maxFiles = 10,
  acceptedTypes = ["image/*", "video/*"],
  maxFileSize = 50,
  className,
}: MediaUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedMediaItem, setSelectedMediaItem] = useState<MediaItem | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    return file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
  };

  const generateVideoPoster = useCallback(
    (videoFile: File): Promise<{ posterUrl: string; posterFile: File }> => {
      return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        video.crossOrigin = "anonymous";
        video.muted = true;

        video.onloadedmetadata = () => {
          // Set canvas dimensions to video dimensions
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Seek to 1 second or 10% of video duration, whichever is smaller
          const seekTime = Math.min(1, video.duration * 0.1);
          video.currentTime = seekTime;
        };

        video.onseeked = () => {
          try {
            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas to blob
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Failed to generate poster blob"));
                  return;
                }

                // Create File from blob
                const posterFile = new File(
                  [blob],
                  `${videoFile.name.split(".")[0]}_poster.jpg`,
                  {
                    type: "image/jpeg",
                  }
                );

                const posterUrl = URL.createObjectURL(posterFile);

                // Cleanup
                URL.revokeObjectURL(video.src);

                resolve({ posterUrl, posterFile });
              },
              "image/jpeg",
              0.8
            );
          } catch (error) {
            reject(error);
          }
        };

        video.onerror = () => {
          reject(new Error("Failed to load video for poster generation"));
        };

        // Load video
        video.src = URL.createObjectURL(videoFile);
        video.load();
      });
    },
    []
  );

  const validateFile = (file: File): string | null => {
    if (maxFileSize && file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    const isValidType = acceptedTypes.some((type) => {
      if (type === "image/*") return file.type.startsWith("image/");
      if (type === "video/*") return file.type.startsWith("video/");
      return file.type === type;
    });

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(
        ", "
      )}`;
    }

    return null;
  };

  const handleFilesSelect = useCallback(
    async (files: FileList) => {
      const newMedia: MediaItem[] = [];
      const errors: string[] = [];

      for (let index = 0; index < files.length; index++) {
        const file = files[index];
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
        alert(errors.join("\n"));
      }

      if (newMedia.length > 0) {
        onChange([...value, ...newMedia]);
      }
    },
    [
      value,
      onChange,
      maxFiles,
      validateFile,
      createPreviewUrl,
      generateVideoPoster,
    ]
  );

  const handleFileInput = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      await handleFilesSelect(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const files = event.dataTransfer.files;
    if (files) {
      await handleFilesSelect(files);
    }
  };

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
    const newItems = value.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    onChange(newItems);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area - Reduced Height */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          value.length >= maxFiles && "opacity-50 pointer-events-none"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <div className="space-y-1">
          <p className="text-sm font-medium">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-muted-foreground">
            Images and videos up to {maxFileSize}MB • {value.length}/{maxFiles}{" "}
            files
          </p>
        </div>

        <div className="flex gap-2 justify-center mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={value.length >= maxFiles}
          >
            <Plus className="w-3 h-3 mr-1" />
            Choose Files
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Media Grid with DnD */}
      {value.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={value.map((item) => item.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              <div className="relative aspect-square rounded-lg border bg-muted overflow-hidden opacity-90 shadow-lg">
                {(() => {
                  const activeItem = value.find((item) => item.id === activeId);
                  if (!activeItem) return null;

                  return activeItem.type === "VIDEO" ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
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
        <div className="text-xs text-muted-foreground text-center">
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
  );
}
