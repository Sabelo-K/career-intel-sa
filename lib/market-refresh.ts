import { db } from "@/lib/db";
import { parseWorldBank, type MarketMetric } from "./market-source";
const HOUR = 3600000;
export async function refreshMarketData() {
 return Promise.all([refresh("world-bank", 24 * HOUR), refresh("adzuna", HOUR)]);
}
async function refresh(key: string, interval: number) {
 const now = new Date();
 await db.dataSnapshot.upsert({where:{key},create:{key},update:{}});
 const row = await db.dataSnapshot.findUniqueOrThrow({where:{key}});
 if (row.checkedAt && now.getTime()-row.checkedAt.getTime()<interval) return row;
 const claim = await db.dataSnapshot.updateMany({where:{key,AND:[{OR:[{leaseUntil:null},{leaseUntil:{lt:now}}]},{OR:[{attemptedAt:null},{attemptedAt:{lt:new Date(now.getTime()-300000)}}]}]},data:{leaseUntil:new Date(now.getTime()+30000),attemptedAt:now}});
 if (!claim.count) return row;
 try {
 let metrics: MarketMetric[];
 if(key === "world-bank") {
 const response=await fetch("https://api.worldbank.org/v2/country/ZAF/indicator/SL.UEM.TOTL.ZS?format=json&per_page=10",{cache:"no-store",signal:AbortSignal.timeout(10000)});
 if(!response.ok) throw new Error("Source unavailable");
 metrics=[parseWorldBank(await response.json())];
 } else {
 const id=process.env.ADZUNA_APP_ID, secret=process.env.ADZUNA_APP_KEY;
 if(!id || !secret) throw new Error("not-configured");
 const params=new URLSearchParams({app_id:id,app_key:secret,results_per_page:"1",max_days_old:"7"});
 const response=await fetch(`https://api.adzuna.com/v1/api/jobs/za/search/1?${params}`,{cache:"no-store",signal:AbortSignal.timeout(10000)});
 if(!response.ok) throw new Error("Source unavailable");
 const body=await response.json();
 if(!Number.isSafeInteger(body.count)||body.count<0) throw new Error("Invalid response");
 metrics=[{label:"Adverts posted in the past 7 days",value:body.count,period:"Rolling 7 days",source:"Jobs by Adzuna",url:"https://www.adzuna.co.za"}];
 }
 return await db.dataSnapshot.update({where:{key},data:{payload:JSON.parse(JSON.stringify(metrics)),checkedAt:new Date(),error:null,leaseUntil:null}});
 } catch(error) {
 return db.dataSnapshot.update({where:{key},data:{error:error instanceof Error && error.message==="not-configured"?"Source not connected":"Source check failed; previous data retained",leaseUntil:null}});
 }
}
