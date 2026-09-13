import Link from "next/link";
import { Compass } from "lucide-react";
export function JourneyHeader() {
  return <header className="journey-header"><JourneyBrand /><nav aria-label="Main navigation"><Link href="/start">Start here</Link><Link href="/explore">Explore careers</Link><Link href="/dashboard">My next steps</Link></nav><Link href="/sign-in" className="journey-button secondary">Sign in</Link></header>;
}
export function JourneyFooter() {
  return <footer className="journey-footer"><div><Link href="/" className="journey-brand">Career<span>Intel</span><small>SA</small></Link><p>Career guidance for your next chapter.<br />Made for South Africa.</p></div><nav aria-label="Footer"><Link href="/start">Find my starting point</Link><Link href="/bursaries">Funding</Link><Link href="/how-credits-work">Plans & credits</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/support">Get help</Link></nav></footer>;
}

export function JourneyBrand() { return <Link href="/" className="journey-brand"><Compass size={26} aria-hidden="true" />Career<span>Intel</span><small>SA</small></Link>; }
