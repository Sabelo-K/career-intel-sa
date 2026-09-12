"use client";
import { usePathname } from "next/navigation";
export function JourneyShell({children}:{children:React.ReactNode}) {
 const path=usePathname();const modern=path==="/dashboard"||path==="/opportunities";
 return <main id="main-content" className={`journey-shell-main ${modern?"":"journey-existing-tool"}`}>{children}</main>;
}
