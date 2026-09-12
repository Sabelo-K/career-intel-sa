"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
const STORAGE_KEY = "careerintelsa_cookie_consent";
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { try { setVisible(!localStorage.getItem(STORAGE_KEY)); } catch { setVisible(true); } }, []);
  function dismiss() { try { localStorage.setItem(STORAGE_KEY, "acknowledged"); } catch {} setVisible(false); }
  if (!visible) return null;
  return <aside aria-label="Cookie notice" className="career-cookie-notice"><Cookie size={20} aria-hidden="true"/><p>We use essential cookies to keep you signed in. No advertising cookies are used. Read our <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms of Service</Link>.</p><button onClick={dismiss}>Got it</button></aside>;
}
