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
  await prisma.$executeRawUnsafe(`
  UPDATE product p
  JOIN (
    SELECT product_id,
           MIN(price) AS min_price,
           MAX(price) AS max_price
    FROM product_variant
    GROUP BY product_id
  ) v ON v.product_id = p.id
  SET p.min_price = v.min_price,
      p.max_price = v.max_price;
`);

  console.log("✅ Finished updating descriptions.");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
