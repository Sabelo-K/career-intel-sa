"use client";
import Link from "next/link";
export function CareerSaveLink({careerId}:{careerId:string}) {return <Link href={`/dashboard?career=${encodeURIComponent(careerId)}`} onClick={()=>{try{sessionStorage.setItem("ci-pending-career",careerId)}catch{}}} className="journey-button">Save to my career plan →</Link>}
