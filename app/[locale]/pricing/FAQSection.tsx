"use client";

import { useTranslations } from "next-intl";

export default function FAQSection() {
  const t = useTranslations("pricing");

  const faqs = [
    {
      question: t("is there a free trial?"),
      answer: t(
        "yes! we offer a 7-day free trial for all plans; no credit card required"
      ),
    },
    {
      question: t("can i change plans later?"),
      answer: t("absolutely; you can upgrade, downgrade, or cancel anytime"),
    },
    {
      question: t("do you offer discounts?"),
      answer: t("yes! we offer 20% off for annual subscriptions"),
    },
    {
      question: t("what payment methods do you accept?"),
      answer: t("we accept all major credit cards and paypal"),
    },
  ];

  return (
    <div className="bg-muted py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="lg:text-center">
          <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">
            {t("faqs")}
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t("frequently asked questions")}
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="mt-10">
          <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-8">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-background p-6 rounded-xl shadow-sm border hover:shadow-md transition hover:-translate-y-1"
              >
                <h3 className="text-lg font-semibold text-foreground">
                  {faq.question}
                </h3>
                <p className="mt-2 text-base text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
