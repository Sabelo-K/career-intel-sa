"use client";

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import type { ReactNode, AnchorHTMLAttributes } from "react";

/** Wait for Clerk before showing a sign-in action: loading is not signed out. */
export function JourneyAccountControls() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) {
    return <span className="journey-account-loading" role="status" aria-label="Loading account">Loading account…</span>;
  }
  if (!isSignedIn) {
    return <Link href="/sign-in" className="journey-button secondary">Sign in</Link>;
  }
  return <div className="journey-account-controls">
    <Link href="/dashboard" className="journey-button secondary">My workspace</Link>
    <UserButton />
  </div>;
}

/** Public tools remain accessible, while members continue to the relevant tool. */
export function MemberActionLink({ signedInHref, signedInLabel, className, children, ...props }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  signedInHref: string;
  signedInLabel: string;
  className?: string;
  children: ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  return <Link href={isLoaded && !isSignedIn ? "/sign-up" : signedInHref} className={className} {...props}>
    {isLoaded && !isSignedIn ? children : signedInLabel}
  </Link>;
}
