import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("not-found");

  return (
    <main className="place-items-center grid min-h-full px-6 lg:px-8 py-24 sm:py-32">
      <div className="text-center">
        <p className="font-bold text-primary-500 text-3xl">{t("404")}</p>
        <h1 className="mt-4 font-semibold text-5xl sm:text-7xl text-balance tracking-tight">{t("page not found")}</h1>
        <p className="mt-6 font-medium text-muted-foreground text-lg sm:text-xl/8 text-pretty">
          {t("sorry could not find")}
        </p>
        <div className="flex justify-center items-center gap-x-6 mt-10">
          <Link
            href="/"
            className="px-3.5 py-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2 bg-primary-500 hover:bg-primary-600 shadow-xs font-semibold text-white text-sm"
          >
            {t("go back home")}
          </Link>
        </div>
      </div>
    </main>
  );
}
