"use client";

import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, MapPin, Package } from "lucide-react";
import { format } from "date-fns";
import { ShippingZone } from "@/types";

interface ShippingZonesDataTableProps {
  shippingZones: ShippingZone[];
  onEdit: (zone: ShippingZone) => void;
  onDelete: (zone: ShippingZone) => void;
  isLoading?: boolean;
}

export default function ShippingZonesDataTable({
  shippingZones,
  onEdit,
  onDelete,
  isLoading = false,
}: ShippingZonesDataTableProps) {
  const t = useTranslations("shipping-zones");

  const skeletonRows = Array.from({ length: 4 }).map((_, idx) => (
    <TableRow key={`skeleton-${idx}`} className="border-border transition-colors">
      <TableCell className="font-medium">
        <Skeleton className="w-40 h-4 rounded" />
      </TableCell>
      <TableCell className="py-1">
        <Skeleton className="w-24 h-4 rounded" />
      </TableCell>
      <TableCell className="py-1">
        <Skeleton className="w-12 h-4 rounded" />
      </TableCell>
      <TableCell className="py-1">
        <Skeleton className="w-20 h-4 rounded" />
      </TableCell>
      <TableCell className="py-1">
        <div className="flex justify-end gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </TableCell>
    </TableRow>
  ));

  const emptyStateRow = (
    <TableRow>
      <TableCell colSpan={5}>
        <div className="p-8 text-center">
          <div className="flex justify-center items-center size-18 mx-auto mb-4 rounded-full bg-muted">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">{t("no zones found")}</h3>
          <p className="mb-4 text-muted-foreground text-sm">{t("try adjusting your search")}</p>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="w-0 min-w-full border rounded-md bg-background">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="w-[300px] font-medium">{t("zone name")}</TableHead>
            <TableHead className="w-[150px] font-medium">{t("countries")}</TableHead>
            <TableHead className="w-[120px] font-medium">{t("products")}</TableHead>
            <TableHead className="w-[150px] font-medium">Created</TableHead>
            <TableHead className="font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? skeletonRows
            : shippingZones.length > 0
            ? shippingZones.map((zone) => (
                <TableRow key={zone.id} className="hover:bg-muted/50">
                  <TableCell className="py-1">
                    <div className="font-medium">{zone.name}</div>
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{zone.countries?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>{zone._count?.productShippingZones || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-1 text-muted-foreground">
                    {zone?.createdAt ? format(new Date(zone.createdAt), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell className="py-1 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(zone);
                        }}
                        className="w-8 h-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="sr-only">{t("edit")}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(zone);
                        }}
                        className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">{t("delete")}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            : emptyStateRow}
        </TableBody>
      </Table>
    </div>
  );
}
