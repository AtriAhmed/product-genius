import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "winwaterfall",
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });

async function main() {
  // Get all translations
  const translations = await prisma.productTranslation.findMany({
    select: { id: true, description: true },
  });

  for (const t of translations) {
    if (!t.description) continue;

    const updated = t.description.replace(/\n/g, "<br>");

    // Only update if something changed
    if (updated !== t.description) {
      await prisma.productTranslation.update({
        where: { id: t.id },
        data: { description: updated },
      });
    }
  }

  console.log("✅ Finished updating descriptions.");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
