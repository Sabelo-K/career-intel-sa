import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Admin layout — only the email in ADMIN_EMAIL env var can access /admin.
 * Set ADMIN_EMAIL=your@email.com in Vercel environment variables.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    // Env var not set — block all access until it is configured
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Admin access not configured. Set <code className="text-indigo-400">ADMIN_EMAIL</code> in Vercel.
        </p>
      </div>
    );
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  if (email.toLowerCase() !== adminEmail.toLowerCase()) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
