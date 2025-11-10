import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Package, Link, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order, OrderStatus } from "@/types";

interface TrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onSave: (data: { trackingNumber: string; trackingUrl: string; status: OrderStatus }) => void;
  isLoading?: boolean;
}

export default function TrackingDialog({ open, onOpenChange, order, onSave, isLoading = false }: TrackingDialogProps) {
  const t = useTranslations("orders");

  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [status, setStatus] = useState<OrderStatus>("UNPAID");

  // Update state when order changes
  useEffect(() => {
    if (order) {
      setTrackingNumber(order.trackingNumber || "");
      setTrackingUrl(order.trackingUrl || "");
      setStatus(order.status || "UNPAID");
    }
  }, [order]);

  const handleSave = () => {
    onSave({
      trackingNumber: trackingNumber.trim(),
      trackingUrl: trackingUrl.trim(),
      status,
    });
  };

  const handleCancel = () => {
    // Reset to original values
    if (order) {
      setTrackingNumber(order.trackingNumber || "");
      setTrackingUrl(order.trackingUrl || "");
      setStatus(order.status || "UNPAID");
    }
    onOpenChange(false);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {t("tracking information")} - {order.orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Shipment Status */}
          {/* <div className="space-y-2">
            <Label htmlFor="status" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              {t("shipment status")}
            </Label>
            <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">{t("draft")}</SelectItem>
                <SelectItem value="UNPAID">{t("unpaid")}</SelectItem>
                <SelectItem value="PAID">{t("paid")}</SelectItem>
                <SelectItem value="PROCESSING">{t("processing")}</SelectItem>
                <SelectItem value="COMPLETED">{t("completed")}</SelectItem>
                <SelectItem value="CANCELED">{t("canceled")}</SelectItem>
                <SelectItem value="REFUNDED">{t("refunded")}</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* Tracking Number */}
          <div className="space-y-2">
            <Label htmlFor="trackingNumber" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              {t("tracking number")}
            </Label>
            <Input
              id="trackingNumber"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder={t("enter tracking number")}
            />
          </div>

          {/* Tracking URL */}
          <div className="space-y-2">
            <Label htmlFor="trackingUrl" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              {t("tracking url")}
            </Label>
            <Input
              id="trackingUrl"
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder={t("enter tracking url")}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
