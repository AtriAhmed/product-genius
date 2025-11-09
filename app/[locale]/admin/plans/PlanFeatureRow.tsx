"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Edit, GripVertical, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { AddFeatureFormData } from "./AddFeatureDialog";

type SortableFeatureRowProps = {
  feature: {
    id: string;
    key: string;
    value?: string;
    description?: string;
    included: boolean;
    note?: string;
  };
  onRemove: () => void;
  onEdit: () => void;
};

export default function SortableFeatureRow({ feature, onRemove, onEdit }: SortableFeatureRowProps) {
  const t = useTranslations("plans");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: feature.id });
  const isMounted = useIsMounted();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="border-border hover:bg-muted/50 transition-colors">
      <TableCell>
        <div className="flex items-center cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{feature.key}</TableCell>
      <TableCell>{feature.value}</TableCell>
      <TableCell>
        {feature.description && <span className="text-muted-foreground text-sm">{feature.description}</span>}
      </TableCell>
      <TableCell>
        <Badge variant={feature.included ? "default" : "secondary"}>
          {!isMounted || feature.included ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              {t("included")}
            </>
          ) : (
            <>
              <X className="w-3 h-3 mr-1" />
              {t("not included")}
            </>
          )}
        </Badge>
      </TableCell>
      <TableCell>{feature.note && <span className="text-muted-foreground text-xs">{feature.note}</span>}</TableCell>
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
