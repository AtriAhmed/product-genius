// configure dotenv
import dotenv from "dotenv";
dotenv.config();

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
  const cdnUrl = process.env.CDN_URL || "https://cdn.winwaterfall.com";
  console.log("-------------------- cdnUrl --------------------");
  console.log(cdnUrl);
  console.log("Starting media URLs update...");

  // Update URL field where key exists
  const urlResult = await prisma.$executeRaw`
    UPDATE media 
    SET url = CONCAT(${cdnUrl}, '/', \`key\`)
    WHERE \`key\` IS NOT NULL AND \`key\` != ''
  `;

  // Update poster field where posterKey exists
  const posterResult = await prisma.$executeRaw`
    UPDATE media 
    SET poster = CONCAT(${cdnUrl}, '/', poster_key)
    WHERE poster_key IS NOT NULL AND poster_key != ''
  `;

  // Update preview field where previewKey exists
  const previewResult = await prisma.$executeRaw`
    UPDATE media 
    SET preview = CONCAT(${cdnUrl}, '/', preview_key)
    WHERE preview_key IS NOT NULL AND preview_key != ''
  `;

  console.log(`Updated ${urlResult} media records with new URLs`);
  console.log(`Updated ${posterResult} media records with new poster URLs`);
  console.log(`Updated ${previewResult} media records with new preview URLs`);
  console.log("Media URLs update completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
