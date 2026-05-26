import { PrismaClient } from "@prisma/client";
import { SA_CAREERS } from "../lib/data/sa-careers";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  for (const career of SA_CAREERS) {
    await db.careerDemand.upsert({
      where: { title: career.title },
      update: {
        demandScore: career.demandScore,
        growthTrend: career.growthTrend as never,
        futureOutlook: career.futureOutlook as never,
        automationRisk: career.automationRisk,
        remoteFriendly: career.remoteFriendly,
        internationalDemand: career.internationalDemand,
        minSalaryZar: career.minSalaryZar,
        maxSalaryZar: career.maxSalaryZar,
        avgSalaryZar: career.avgSalaryZar,
        topSkills: career.topSkills,
        topProvinces: career.topProvinces,
        nqfLevel: career.nqfLevel || null,
        relatedCareers: career.relatedCareers,
      },
      create: {
        title: career.title,
        sector: career.sector,
        demandScore: career.demandScore,
        growthTrend: career.growthTrend as never,
        futureOutlook: career.futureOutlook as never,
        automationRisk: career.automationRisk,
        remoteFriendly: career.remoteFriendly,
        internationalDemand: career.internationalDemand,
        minSalaryZar: career.minSalaryZar,
        maxSalaryZar: career.maxSalaryZar,
        avgSalaryZar: career.avgSalaryZar,
        topSkills: career.topSkills,
        topProvinces: career.topProvinces,
        nqfLevel: career.nqfLevel || null,
        relatedCareers: career.relatedCareers,
      },
    });
  }

  console.log(`✅ Seeded ${SA_CAREERS.length} SA career records`);
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
