import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

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
