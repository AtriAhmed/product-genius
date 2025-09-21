"use client";

import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: FeatureCardProps) {
  return (
    <div
      className="relative"
      data-aos="fade-up"
      data-aos-delay={delay}
      data-aos-duration="600"
      data-aos-easing="ease-out-cubic"
    >
      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white shadow-lg">
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>
      <p className="ml-16 text-lg leading-6 font-medium text-foreground">
        {title}
      </p>
      <p className="mt-2 ml-16 text-base text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
