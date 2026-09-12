"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { JOURNEYS, PersonaSchema, type Persona } from "@/lib/journey";
import { JourneyHeader, JourneyFooter } from "./chrome";
export function JourneyStart() {
  const [persona, setPersona] = useState<Persona>("learner");
  useEffect(() => { const p = PersonaSchema.safeParse(new URLSearchParams(window.location.search).get("persona")); if (p.success) setPersona(p.data); }, []);
  return <div className="journey-surface"><JourneyHeader /><main id="main-content" className="journey-container journey-section"><p className="journey-eyebrow">Find your starting point</p><h1 className="journey-title">You don’t need every answer.<br /><em>Start with where you are.</em></h1><p className="journey-lead">Choose the journey closest to your situation. You can change it later.</p><div className="journey-grid three my-8">{(Object.keys(JOURNEYS) as Persona[]).map(p => <button className={`journey-choice ${p === persona ? "selected" : ""}`} aria-pressed={p === persona} key={p} onClick={() => setPersona(p)}><h3>{JOURNEYS[p].label}</h3><p>{JOURNEYS[p].description}</p></button>)}</div><section className="journey-card"><p className="journey-eyebrow">Your suggested starting steps</p><h2>{JOURNEYS[persona].title}</h2><ol className="journey-preview-steps">{JOURNEYS[persona].steps.map(step => <li key={step.id}><strong>{step.title}</strong><p>{step.description}</p><Link href={step.href} className="journey-text-link">{step.action} →</Link></li>)}</ol><Link href={`/dashboard?persona=${persona}`} onClick={() => { try { sessionStorage.setItem("ci-start-persona", persona); } catch {} }} className="journey-button">Make this my saved plan →</Link><p className="journey-caption">A free account keeps your plan private and available across devices.</p></section></main><JourneyFooter /></div>;
}
