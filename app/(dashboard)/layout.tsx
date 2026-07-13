import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { FeedbackProvider } from "@/components/feedback-provider";
import { PlanExpiredBanner } from "@/components/plan-expired-banner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <FeedbackProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        {/* ml-0 on mobile (sidebar is a drawer), ml-60 on md+ (sidebar is always visible) */}
        <main className="flex-1 md:ml-60 min-h-screen overflow-y-auto">
          {/* pt-14 offsets the fixed mobile top bar; md:pt-0 removes it on desktop */}
          <div className="max-w-7xl mx-auto p-4 pt-[4.5rem] md:pt-6 md:p-6 lg:p-8">
            <PlanExpiredBanner />
            {children}
          </div>
        </main>
      </div>
    </FeedbackProvider>
  );
}
