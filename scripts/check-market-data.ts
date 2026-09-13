import { refreshMarketData } from "../lib/market-refresh";
import {db} from "../lib/db";
refreshMarketData().then(rows=>console.log(JSON.stringify(rows.map(r=>({key:r.key,checkedAt:r.checkedAt,error:r.error,payload:r.payload}))))).finally(()=>db.$disconnect());
