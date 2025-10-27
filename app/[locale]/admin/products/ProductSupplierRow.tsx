"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Edit, GripVertical, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { AddSupplierFormData } from "./types";

// Sortable row component for drag and drop
export default function SortableSupplierRow({
  supplier,
  onRemove,
  onEdit,
}: {
  supplier: AddSupplierFormData;
  onRemove: () => void;
  onEdit: () => void;
}) {
  const t = useTranslations("products");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: supplier.id?.toString() || "" });
  const isMounted = useIsMounted();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="border-border hover:bg-muted/50 transition-colors"
    >
      <TableCell>
        <div
          className="flex items-center cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="font-medium">
        {supplier.marketplace || "—"}
      </TableCell>
      <TableCell>
        {supplier.url ? (
          <a
            href={supplier.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {supplier.url.length > 40
              ? `${supplier.url.substring(0, 40)}...`
              : supplier.url}
          </a>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="font-semibold text-nowrap">
        {supplier.price ? `${supplier.price} ${supplier.currency || ""}` : "—"}
      </TableCell>
      <TableCell>
        <Badge variant={supplier.isInternal ? "primary" : "secondary"}>
          {!isMounted || supplier.isInternal ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              {t("internal")}
            </>
          ) : (
            <>
              <X className="w-3 h-3 mr-1" />
              {t("external")}
            </>
          )}
        </Badge>
      </TableCell>
      <TableCell>
        {supplier.notes && (
          <span className="text-muted-foreground text-xs">
            {supplier.notes}
          </span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-primary/10 hover:text-primary"
            onClick={onEdit}
          >
            <Edit className="w-4 h-4" />
            <span className="sr-only">{t("edit")}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">{t("remove")}</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
