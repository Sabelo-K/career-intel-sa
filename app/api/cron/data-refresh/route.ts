import { NextResponse } from "next/server";
import { refreshMarketData } from "@/lib/market-refresh";
export const dynamic="force-dynamic";
export const maxDuration=60;
export async function GET(request:Request) {
 const secret=process.env.CRON_SECRET;
 if(!secret || request.headers.get("authorization")!==`Bearer ${secret}`) return NextResponse.json({error:"Unauthorized"},{status:401});
 try { const sources=await refreshMarketData(); return NextResponse.json({sources}, {status:sources.some(s=>s.error && s.error!=="Source not connected")?503:200}); }
 catch { return NextResponse.json({error:"Refresh unavailable"},{status:503}); }
}
