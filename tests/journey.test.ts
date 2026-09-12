import test from "node:test";
import assert from "node:assert/strict";
import { applyJourneyAction, defaultJourney, JourneyActionSchema, JourneySettingsSchema, JOURNEYS } from "../lib/journey";
const ids = new Set(Array.from({length:13},(_,i)=>`career-${i}`));
test("each audience has a valid, reversible action checklist",()=>{
 for (const persona of ["learner","seeker","worker"] as const) {
  let state=defaultJourney(persona); const task=JOURNEYS[persona].steps[0].id;
  state=applyJourneyAction(state,{type:"task",id:task,completed:true,version:0},ids);
  assert.deepEqual(state.completedSteps,[task]);
  state=applyJourneyAction(state,{type:"task",id:task,completed:true,version:1},ids);
  assert.deepEqual(state.completedSteps,[task]);
  state=applyJourneyAction(state,{type:"task",id:task,completed:false,version:2},ids);
  assert.deepEqual(state.completedSteps,[]);
 }
});
test("stale updates and tasks from a different journey are rejected",()=>{
 assert.throws(()=>applyJourneyAction({...defaultJourney(),version:2},{type:"task",id:"interests",completed:true,version:1},ids),/another tab/);
 assert.throws(()=>applyJourneyAction(defaultJourney(),{type:"task",id:"cv",completed:true,version:0},ids),/does not belong/);
});
test("shortlist validates careers, deduplicates and enforces its limit",()=>{
 let state=defaultJourney();
 assert.throws(()=>applyJourneyAction(state,{type:"shortlist",careerId:"missing",saved:true,version:0},ids),/catalogue/);
 for(let i=0;i<12;i++)state=applyJourneyAction(state,{type:"shortlist",careerId:`career-${i}`,saved:true,version:state.version},ids);
 assert.throws(()=>applyJourneyAction(state,{type:"shortlist",careerId:"career-12",saved:true,version:state.version},ids),/12 careers/);
 state=applyJourneyAction(state,{type:"shortlist",careerId:"career-0",saved:true,version:state.version},ids);assert.equal(state.shortlist.length,12);
 state=applyJourneyAction(state,{type:"shortlist",careerId:"career-0",saved:false,version:state.version},ids);assert.equal(state.shortlist.length,11);
});
test("changing goal or audience resets completion but retains shortlist",()=>{
 const state={...defaultJourney(),completedSteps:["interests"],shortlist:["career-0"]};
 const next=applyJourneyAction(state,{type:"settings",version:0,settings:{...defaultJourney("worker"),goal:"Data Analyst"}},ids);
 assert.deepEqual(next.completedSteps,[]);assert.deepEqual(next.shortlist,["career-0"]);
 const budgetOnly=applyJourneyAction(state,{type:"settings",version:0,settings:{...state,monthlyBudget:100}},ids);assert.deepEqual(budgetOnly.completedSteps,["interests"]);
});
test("settings reject impossible dates, negative budgets and unbounded fields",()=>{
 for(const override of [{targetDate:"2026-02-30"},{hoursPerWeek:81},{hoursPerWeek:1.2},{monthlyBudget:-1},{goal:"x".repeat(161)}])assert.equal(JourneySettingsSchema.safeParse({...defaultJourney(),...override}).success,false);
 assert.equal(JourneySettingsSchema.safeParse({...defaultJourney(),hoursPerWeek:0,monthlyBudget:0,targetDate:"2028-02-29"}).success,true);
});
test("client cannot set owner or arbitrary progress arrays",()=>{
 const action=JourneyActionSchema.parse({type:"task",version:0,id:"interests",completed:true,userId:"someone-else",completedSteps:["funding"]});
 assert.equal("userId" in action,false);assert.equal("completedSteps" in action,false);
});
