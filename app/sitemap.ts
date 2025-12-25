import { MetadataRoute } from "next";

type Page = {
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
};

const baseUrl = "https://winwaterfall.com";
const languages = ["en", "fr"];

const pages: Page[] = [
  {
    path: "",
    priority: 1.0,
    changeFrequency: "monthly",
  },
  {
    path: "pricing",
    priority: 0.8,
    changeFrequency: "monthly",
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return pages.flatMap((page) =>
    languages.map((lang) => ({
      url: `${baseUrl}/${lang}${page.path ? `/${page.path}` : ""}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          en: `${baseUrl}/en${page.path ? `/${page.path}` : ""}`,
          fr: `${baseUrl}/fr${page.path ? `/${page.path}` : ""}`,
        },
      },
    }))
  );
}
