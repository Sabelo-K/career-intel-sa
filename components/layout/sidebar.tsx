"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Compass, ListChecks, BookOpen, Briefcase, MessageCircle, Menu, X, User, Settings, CircleHelp } from "lucide-react";
import { LanguageSelector } from "@/components/layout/language-selector";
const primary = [
  {href:"/dashboard",label:"My next steps",icon:ListChecks}, {href:"/explore",label:"Explore careers",icon:Compass},
  {href:"/opportunities",label:"Opportunities & funding",icon:Briefcase}, {href:"/career-coach",label:"Get guidance",icon:MessageCircle},
];
const groups = [
  {label:"School & study",links:[["/high-school","School guidance"],["/subject-choice","Subject choices"],["/matric","Matric options"],["/courses","Courses & learning"],["/degree-roi","Compare study costs"]]},
  {label:"Prepare for work",links:[["/cv-builder","My CV"],["/skills-gap","My skill gaps"],["/interview-prep","Interview practice"],["/career-paths","Career simulations"],["/job-alerts","Job alerts"]]},
  {label:"Career insights",links:[["/job-market","Job market"],["/salary-check","Salary comparison"],["/career-map","Career map"],["/wrapped","My career review"],["/bbbee","Workplace inclusion"]]},
];
export function Sidebar() {
 const pathname = usePathname(); const [open,setOpen] = useState(false);
 useEffect(()=>setOpen(false),[pathname]);
 useEffect(()=>{ if(!open)return; const previous=document.body.style.overflow; document.body.style.overflow="hidden"; const close=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",close);return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",close)}},[open]);
 const logo=<Link href="/" className="journey-brand"><Compass size={24}/>Career<span>Intel</span><small>SA</small></Link>;
 return <><header className="journey-mobile-header">{logo}<button aria-label={open?"Close navigation":"Open navigation"} aria-expanded={open} aria-controls="journey-navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></header>{open&&<button className="journey-overlay" aria-label="Close navigation" onClick={()=>setOpen(false)}/>}<aside id="journey-navigation" className={`journey-sidebar ${open?"open":""}`}><div className="hidden md:block">{logo}</div><nav aria-label="Your career journey">{primary.map(item=><Link key={item.href} href={item.href} aria-current={pathname===item.href?"page":undefined}><item.icon size={18}/>{item.label}</Link>)}{groups.map(group=><details key={group.label} open={group.links.some(([href])=>pathname===href)||undefined}><summary><BookOpen size={16}/>{group.label}</summary>{group.links.map(([href,label])=><Link key={href} href={href} aria-current={pathname===href?"page":undefined}>{label}</Link>)}</details>)}</nav><div className="journey-sidebar-bottom"><Link href="/upgrade" className="journey-button secondary">Plans & credits</Link><nav aria-label="Account"><Link href="/profile"><User size={16}/>My profile</Link><Link href="/settings"><Settings size={16}/>Settings</Link><Link href="/support"><CircleHelp size={16}/>Help & feedback</Link><Link href="/recruiter"><Briefcase size={16}/>For recruiters</Link></nav><div className="flex items-center justify-between"><UserButton/><LanguageSelector compact/></div><div className="flex gap-4 text-xs"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div></aside></>;
}
