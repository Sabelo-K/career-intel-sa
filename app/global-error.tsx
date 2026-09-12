"use client";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
export default function GlobalError({error,reset}:{error:Error & {digest?:string};reset:()=>void}){
 useEffect(()=>{Sentry.captureException(error)},[error]);
 return <html lang="en"><body style={{margin:0,padding:40,fontFamily:"system-ui,sans-serif",background:"#f6f5f1",color:"#1b263e"}}><main style={{maxWidth:600,margin:"60px auto"}}><h1>Let’s get you back on track.</h1><p>Something went wrong while loading this page. Your saved information is still in your account.</p><button onClick={reset} style={{padding:"12px 20px",background:"#3d4fb0",color:"white",border:0,borderRadius:8}}>Try again</button><p><a href="/">Back to CareerIntel SA</a></p></main></body></html>;
}
