"use client";

import { useTranslations } from "next-intl";
import useSWR from "swr";
import axios from "axios";
import { HelpCircle } from "lucide-react"; // Ensure you have lucide-react installed
import { FAQ } from "@/types";

interface FaqsResponse {
  data: FAQ[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

async function fetcher() {
  const response = await axios.get("/api/faqs", {
    params: { limit: 100, sortBy: "order", sortOrder: "asc" },
  });
  return response.data;
}

// Static Skeleton Component
function FAQSkeleton() {
  return (
    <div className="gap-6 grid md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-40 p-6 border rounded-lg bg-background">
          <div className="w-3/4 h-6 mb-4 rounded bg-muted" />
          <div className="w-full h-4 rounded bg-muted" />
          <div className="w-5/6 h-4 mt-2 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export default function FAQSection() {
  const t = useTranslations("pricing");

  const { data, error, isLoading } = useSWR<FaqsResponse>(["faqs"], fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const faqs = data?.data || [];

  if (error) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="font-bold text-primary-500 text-base uppercase tracking-widest">{t("faqs")}</h2>
          <p className="mt-3 font-bold text-foreground text-3xl sm:text-4xl tracking-tight">
            {t("frequently asked questions")}
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <FAQSkeleton />
        ) : (
          <div className="gap-6 grid md:grid-cols-2">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col items-start p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Visual Accent */}
                <div className="top-0 left-0 absolute w-1 h-full rounded-l-lg bg-primary-500" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary/10 text-primary-500 shrink-0">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg leading-tight">{faq.question}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && faqs.length === 0 && (
          <div className="p-12 border border-dashed rounded-lg text-muted-foreground text-center">
            No FAQs available at the moment.
          </div>
        )}
      </div>
    </section>
  );
}
