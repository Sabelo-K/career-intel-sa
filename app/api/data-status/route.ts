import { NextResponse } from "next/server";
import { refreshMarketData } from "@/lib/market-refresh";
export const dynamic="force-dynamic";
export async function GET() {
 try { return NextResponse.json((await refreshMarketData()).map(row=>({...row,scheduledRefreshConfigured:Boolean(process.env.CRON_SECRET)})),{headers:{"Cache-Control":"no-store"}}); }
 catch { return NextResponse.json({error:"Data checks temporarily unavailable"},{status:503}); }
}
