"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FAQ } from "@/types";

const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  order: z.number("A number should be provided").int("Order must be an integer").min(0, "Order must be at least 0"),
});

type FaqFormData = z.infer<typeof faqSchema>;

interface FaqDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq?: FAQ;
  onSave: (faq: { question: string; answer: string; order: number }) => void;
  isSaving?: boolean;
}

export default function FaqDialog({ open, onOpenChange, faq, onSave, isSaving = false }: FaqDialogProps) {
  const t = useTranslations("faqs");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FaqFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      order: 0,
    },
  });

  useEffect(() => {
    if (faq) {
      reset({
        question: faq.question || "",
        answer: faq.answer || "",
        order: faq.order || 0,
      });
    } else {
      reset({
        question: "",
        answer: "",
        order: 0,
      });
    }
  }, [faq, open, reset]);

  const onSubmit = (data: FaqFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{faq ? t("edit faq") : t("add faq")}</DialogTitle>
          <DialogDescription>{t("define faq details")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="faq-question">{t("question")}</Label>
            <Input id="faq-question" placeholder={t("enter question")} {...register("question")} />
            {errors.question && <p className="text-destructive text-sm">{errors.question.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="faq-answer">{t("answer")}</Label>
            <Textarea id="faq-answer" placeholder={t("enter answer")} {...register("answer")} rows={5} />
            {errors.answer && <p className="text-destructive text-sm">{errors.answer.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="faq-order">{t("order")}</Label>
            <Input
              id="faq-order"
              type="number"
              placeholder={t("display order")}
              {...register("order", { valueAsNumber: true })}
            />
            {errors.order && <p className="text-destructive text-sm">{errors.order.message}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSaving}>
              {t("cancel")}
            </Button>
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? t("saving") : faq ? t("update faq") : t("add faq")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
