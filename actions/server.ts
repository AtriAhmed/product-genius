"use server";

export async function changeLocale(locale: string) {
  const cookies = await import("next/headers").then((mod) => mod.cookies);
  const store = await cookies();
  store.set("locale", locale, { path: "/" });
}
