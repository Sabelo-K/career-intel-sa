import { PrismaClient } from "@prisma/client";
import assert from "node:assert/strict";
const db=new PrismaClient();
async function main(){
 const marker=new Error("ROLLBACK_VERIFICATION");
 try { await db.$transaction(async tx=>{
  const key=`journey-verification-${Date.now()}`;
  const a=await tx.user.create({data:{clerkId:key+"-a",email:key+"-a@example.invalid"}});
  const b=await tx.user.create({data:{clerkId:key+"-b",email:key+"-b@example.invalid"}});
  const plan=await tx.careerJourney.create({data:{userId:a.id,persona:"worker",goal:"Verify persistence"}});
  assert.equal((await tx.careerJourney.findUnique({where:{userId:a.id}}))?.goal,"Verify persistence");
  assert.equal((await tx.careerJourney.updateMany({where:{userId:b.id,version:0},data:{goal:"Wrong owner"}})).count,0);
  assert.equal((await tx.careerJourney.updateMany({where:{userId:a.id,version:0},data:{version:1,completedSteps:["strengths"]}})).count,1);
  assert.equal((await tx.careerJourney.updateMany({where:{userId:a.id,version:0},data:{goal:"Stale"}})).count,0);
  assert.deepEqual((await tx.careerJourney.findUnique({where:{id:plan.id}}))?.completedSteps,["strengths"]);
  const profile=await tx.profile.create({data:{userId:a.id}});assert.equal(profile.recruiterVisible,false);
  throw marker;
 },{timeout:20000}); } catch(e){if(e!==marker)throw e;}
 console.log("PASS: database persistence, owner scoping, stale-write rejection and private defaults. All verification records rolled back.");
}
main().finally(()=>db.$disconnect()).catch(()=>{console.error("Database verification failed; see connection or schema configuration.");process.exitCode=1});
