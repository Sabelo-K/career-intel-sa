export type MarketMetric = { label: string; value: number; period: string; source: string; url: string };
export function parseWorldBank(body: unknown): MarketMetric {
 if (!Array.isArray(body) || !Array.isArray(body[1])) throw new Error("Invalid response");
 const row = body[1].find((r: any) => r.countryiso3code === "ZAF" && r.indicator?.id === "SL.UEM.TOTL.ZS" && typeof r.value === "number" && r.value >= 0 && r.value <= 100 && /^\d{4}$/.test(r.date));
 if (!row) throw new Error("No valid observation");
 return {label:"Annual unemployment estimate",value:row.value,period:row.date,source:"World Bank · modeled ILO estimate",url:"https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS?locations=ZA"};
}
