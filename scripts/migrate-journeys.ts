import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
const db=new PrismaClient();
async function main(){
 const sql=readFileSync("prisma/changes/20260912-career-journeys.sql","utf8");
 const statements=sql.split(";").map(s=>s.trim()).filter(Boolean);
 await db.$transaction(async tx=>{for(const statement of statements)await tx.$executeRawUnsafe(statement);},{timeout:20000});
 console.log("Applied additive career journey table and private-profile setting.");
}
main().finally(()=>db.$disconnect()).catch(()=>{console.error("Migration failed. No credentials printed. Check connection and permissions.");process.exitCode=1});
