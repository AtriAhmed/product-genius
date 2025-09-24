import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  warningTitle?: string;
  warningMessage?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  trigger?: ReactNode;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  warningTitle,
  warningMessage,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  isLoading = false,
  trigger,
  variant = "default",
  disabled = false,
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const dialogContent = (
    <DialogContent
      overlayClassName="bg-black/25"
      className="border border-border bg-background shadow-lg dark:shadow-2xl dark:border-white/10"
    >
      <DialogHeader>
        <DialogTitle className="text-foreground">{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {warningTitle && warningMessage && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                {warningTitle}
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                {warningMessage}
              </p>
            </div>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isLoading || disabled}
          variant={variant === "destructive" ? "destructive" : "default"}
        >
          {isLoading ? "Loading..." : confirmText}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialogContent}
    </Dialog>
  );
}
