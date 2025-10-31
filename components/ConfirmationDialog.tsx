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
import { AlertTriangle, Info, AlertCircle, CheckCircle } from "lucide-react";

type AlertVariant = "warning" | "info" | "destructive" | "success";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  alertTitle?: string;
  alertMessage?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  trigger?: ReactNode;
  variant?: AlertVariant;
  disabled?: boolean;
}

const variantConfig = {
  warning: {
    icon: AlertTriangle,
    containerClass:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    iconClass: "text-yellow-600 dark:text-yellow-400",
    titleClass: "text-yellow-800 dark:text-yellow-200",
    messageClass: "text-yellow-700 dark:text-yellow-300",
    buttonVariant: "default" as const,
  },
  info: {
    icon: Info,
    containerClass:
      "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    iconClass: "text-blue-600 dark:text-blue-400",
    titleClass: "text-blue-800 dark:text-blue-200",
    messageClass: "text-blue-700 dark:text-blue-300",
    buttonVariant: "default" as const,
  },
  destructive: {
    icon: AlertCircle,
    containerClass:
      "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    iconClass: "text-red-600 dark:text-red-400",
    titleClass: "text-red-800 dark:text-red-200",
    messageClass: "text-red-700 dark:text-red-300",
    buttonVariant: "destructive" as const,
  },
  success: {
    icon: CheckCircle,
    containerClass:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    iconClass: "text-green-600 dark:text-green-400",
    titleClass: "text-green-800 dark:text-green-200",
    messageClass: "text-green-700 dark:text-green-300",
    buttonVariant: "default" as const,
  },
};

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  alertTitle,
  alertMessage,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  isLoading = false,
  trigger,
  variant = "info",
  disabled = false,
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const dialogContent = (
    <DialogContent
      overlayClassName="bg-black/25"
      className="border border-border dark:border-white/10 bg-background shadow-lg dark:shadow-2xl"
    >
      <DialogHeader>
        <DialogTitle className="text-foreground">{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}

        {alertTitle && alertMessage && (
          <div
            className={`flex items-start gap-2 p-3 border rounded-lg ${config.containerClass}`}
          >
            <IconComponent
              className={`w-4 h-4 mt-0.5 shrink-0 ${config.iconClass}`}
            />
            <div className="text-sm">
              <p className={`font-medium mb-1 ${config.titleClass}`}>
                {alertTitle}
              </p>
              <p className={config.messageClass}>{alertMessage}</p>
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
          variant={config.buttonVariant}
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
