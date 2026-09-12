import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { FeedbackProvider } from "@/components/feedback-provider";
import { PlanExpiredBanner } from "@/components/plan-expired-banner";
import { JourneyShell } from "@/components/journey/shell";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
 const {userId}=await auth();if(!userId)redirect("/sign-in");
 return <FeedbackProvider><div className="journey-shell"><Sidebar/><JourneyShell><PlanExpiredBanner/>{children}</JourneyShell></div></FeedbackProvider>;
}
