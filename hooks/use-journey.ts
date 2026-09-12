"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { defaultJourney, type JourneyAction, type JourneyState } from "@/lib/journey";
import { track } from "@/lib/analytics";
export function useJourney() {
  const { isLoaded, isSignedIn } = useUser();
  const [journey, setJourney] = useState<JourneyState>(defaultJourney());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);
  const load = useCallback(async () => {
    if (!isLoaded) return;
    if (!isSignedIn) { setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/journey", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load your plan.");
      setJourney(data.journey); setSaved(data.saved);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load your plan."); }
    finally { setLoading(false); }
  }, [isLoaded, isSignedIn]);
  useEffect(() => { void load(); }, [load]);
  const save = async (action: JourneyAction) => {
    if (lock.current || !isSignedIn) return false;
    lock.current = true; setBusy(true); setError("");
    try {
      const res = await fetch("/api/journey", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save. Please retry.");
      setJourney(data.journey); setSaved(true);
      track(action.type === "task" ? "journey_step_updated" : action.type === "shortlist" ? "career_shortlist_updated" : "journey_saved", { persona: data.journey.persona });
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save. Please retry."); return false; }
    finally { setBusy(false); lock.current = false; }
  };
  return { journey, loading, busy, error, saved, load, save, isSignedIn, isLoaded };
}
