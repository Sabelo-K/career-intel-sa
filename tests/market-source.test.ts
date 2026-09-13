import test from "node:test";
import assert from "node:assert/strict";
import { parseWorldBank } from "../lib/market-source";
const row={countryiso3code:"ZAF",indicator:{id:"SL.UEM.TOTL.ZS"},value:32.391,date:"2025"};
test("keeps the publisher's year and precision",()=>{const m=parseWorldBank([{},[row]]);assert.equal(m.value,32.391);assert.equal(m.period,"2025")});
test("skips missing observations",()=>{assert.equal(parseWorldBank([{},[{...row,value:null},row]]).value,32.391)});
test("rejects malformed or unrelated observations",()=>{for(const value of [null,{},[{},[]],[{},[{...row,countryiso3code:"USA"}]],[{},[{...row,value:101}]],[{},[{...row,indicator:{id:"OTHER"}}]]])assert.throws(()=>parseWorldBank(value))});
