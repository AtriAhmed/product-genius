"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";

type FloatingSaveBarProps = {
  isDirty: boolean;
  isSubmitting: boolean;
  onSave: () => void;
  onCancel: () => void;
  saveText?: string;
  cancelText?: string;
  submittingText?: string;
  progress?: number;
};

export default function FloatingSaveBar({
  isDirty,
  isSubmitting,
  onSave,
  onCancel,
  saveText = "Save",
  cancelText = "Cancel",
  submittingText = "Saving...",
  progress,
}: FloatingSaveBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(isDirty);
  }, [isDirty]);

  if (!isVisible) return null;

  return (
    <div className="bottom-6 slide-in-from-bottom-4 left-1/2 z-50 fixed -translate-x-1/2 animate-in duration-300">
      <div className="px-6 py-2 border rounded-lg bg-background shadow-lg">
        <div className="flex justify-center items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            {cancelText}
          </Button>
          <Button variant="primary" type="button" size="sm" onClick={onSave} disabled={isSubmitting} className="gap-2">
            <Save className="w-4 h-4" />
            {isSubmitting ? submittingText : saveText}
          </Button>
        </div>
        {isSubmitting && (
          <div className="mt-1">
            <Progress value={progress} className="h-1" />
          </div>
        )}
      </div>
    </div>
  );
}
