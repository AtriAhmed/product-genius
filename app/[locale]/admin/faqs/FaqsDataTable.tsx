"use client";

import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { FAQ } from "@/types";

interface FaqsDataTableProps {
  faqs: FAQ[];
  onEdit: (faq: FAQ) => void;
  onDelete: (faq: FAQ) => void;
  isLoading?: boolean;
}

export default function FaqsDataTable({ faqs, onEdit, onDelete, isLoading = false }: FaqsDataTableProps) {
  const t = useTranslations("faqs");

  const skeletonRows = Array.from({ length: 4 }).map((_, idx) => (
    <TableRow key={`skeleton-${idx}`} className="border-border transition-colors">
      <TableCell className="w-12 py-1">
        <Skeleton className="w-8 h-4 rounded" />
      </TableCell>
      <TableCell className="font-medium">
        <Skeleton className="w-64 h-4 rounded" />
      </TableCell>
      <TableCell className="py-1">
        <Skeleton className="w-96 h-4 rounded" />
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
            <HelpCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">{t("no faqs found")}</h3>
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
            <TableHead className="w-[80px] font-medium">{t("order")}</TableHead>
            <TableHead className="w-[300px] font-medium">{t("question")}</TableHead>
            <TableHead className="font-medium">{t("answer")}</TableHead>
            <TableHead className="w-[150px] font-medium">Created</TableHead>
            <TableHead className="font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? skeletonRows
            : faqs.length > 0
            ? faqs.map((faq) => (
                <TableRow key={faq.id} className="hover:bg-muted/50">
                  <TableCell className="py-1 text-muted-foreground">{faq.order}</TableCell>
                  <TableCell className="py-1">
                    <div className="font-medium line-clamp-2">{faq.question}</div>
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="text-muted-foreground line-clamp-2">{faq.answer}</div>
                  </TableCell>
                  <TableCell className="py-1 text-muted-foreground">
                    {faq?.createdAt ? format(new Date(faq.createdAt), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell className="py-1 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(faq);
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
                          onDelete(faq);
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
