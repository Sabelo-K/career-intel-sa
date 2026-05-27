import Link from "next/link";
import { Sparkles } from "lucide-react";

export const metadata = { title: "Privacy Policy | CareerIntel SA" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-foreground">CareerIntel <span className="text-indigo-400">SA</span></span>
        </Link>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to app</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: January 2025 · Compliant with POPIA (Protection of Personal Information Act 4 of 2013)</p>

        <div className="prose prose-sm prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section className="p-4 rounded-xl bg-indigo-500/8 border border-indigo-500/20 text-sm text-indigo-200">
            <strong className="text-indigo-300">Summary:</strong> We collect only what&apos;s needed to provide our service. We do not sell your personal information. You can delete your account and all associated data at any time.
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Who We Are (Responsible Party)</h2>
            <p>CareerIntel SA is operated by <strong className="text-foreground">Analytica (Pty) Ltd</strong>, registered in the Republic of South Africa. We are the &quot;responsible party&quot; as defined under POPIA for the personal information we process.</p>
            <p className="mt-2">Contact our Information Officer: <a href="mailto:privacy@careerintel.co.za" className="text-indigo-400 hover:text-indigo-300">privacy@careerintel.co.za</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. What Information We Collect</h2>
            <h3 className="text-sm font-semibold text-foreground mt-3 mb-2">Information you provide directly:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Name and email address (via Clerk authentication)</li>
              <li>Career profile information: current role, target role, province, skills, education, work experience</li>
              <li>CV documents you upload for analysis</li>
              <li>Chat messages sent to the AI Career Coach</li>
              <li>Payment information (processed by PayFast — we do not store card details)</li>
            </ul>
            <h3 className="text-sm font-semibold text-foreground mt-3 mb-2">Information collected automatically:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Usage data: features accessed, session duration, button clicks</li>
              <li>Technical data: browser type, device type, IP address</li>
              <li>Error logs for debugging and service improvement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <p>We process your personal information for the following purposes:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-foreground">Providing the service:</strong> Personalising AI recommendations, generating skills gap analyses, career path simulations, and CV feedback</li>
              <li><strong className="text-foreground">Account management:</strong> Creating and maintaining your account, processing subscription payments</li>
              <li><strong className="text-foreground">Service improvement:</strong> Analysing aggregated (anonymised) usage patterns to improve features</li>
              <li><strong className="text-foreground">Communications:</strong> Sending service notifications, product updates, and weekly career digests (where you have opted in)</li>
              <li><strong className="text-foreground">Legal compliance:</strong> Meeting our obligations under POPIA, the ECT Act, and other applicable South African legislation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. AI Processing of Your Data</h2>
            <p>Your CV content and career information is processed by AI systems (currently Groq AI with Llama models) to generate personalised insights. This processing occurs on secure servers. We do not use your personal data to train AI models without your explicit consent.</p>
            <p className="mt-2">AI-generated insights are stored in our database associated with your account and are accessible only to you.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Sharing Your Information</h2>
            <p>We do <strong className="text-foreground">not sell, rent, or trade</strong> your personal information. We share information only with:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-foreground">Clerk:</strong> Authentication and user management</li>
              <li><strong className="text-foreground">Supabase:</strong> Secure database hosting (data stored in EU-Central region)</li>
              <li><strong className="text-foreground">Vercel:</strong> Application hosting and delivery</li>
              <li><strong className="text-foreground">PayFast:</strong> Payment processing (they are a licensed SA payment provider)</li>
              <li><strong className="text-foreground">Groq AI:</strong> AI inference for career coaching features</li>
              <li><strong className="text-foreground">Legal authorities:</strong> Only when required by South African law or valid court order</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide services. Specifically:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Account data: retained until you delete your account</li>
              <li>CV uploads: retained until you delete them or your account</li>
              <li>Chat history: retained for 12 months, then automatically deleted</li>
              <li>Payment records: retained for 5 years as required by SA tax law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Your Rights Under POPIA</h2>
            <p>As a data subject under POPIA, you have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-foreground">Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong className="text-foreground">Deletion:</strong> Request deletion of your personal information (right to be forgotten)</li>
              <li><strong className="text-foreground">Objection:</strong> Object to the processing of your personal information</li>
              <li><strong className="text-foreground">Data portability:</strong> Request your data in a machine-readable format</li>
              <li><strong className="text-foreground">Complaint:</strong> Lodge a complaint with the Information Regulator of South Africa</li>
            </ul>
            <p className="mt-3">To exercise these rights, go to <strong className="text-foreground">Settings → Privacy</strong> in the app, or email <a href="mailto:privacy@careerintel.co.za" className="text-indigo-400 hover:text-indigo-300">privacy@careerintel.co.za</a>.</p>
            <p className="mt-2">We will respond to requests within <strong className="text-foreground">30 days</strong> as required by POPIA.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Security</h2>
            <p>We implement appropriate technical and organisational measures to protect your personal information, including:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>End-to-end encryption for data in transit (TLS 1.3)</li>
              <li>Encryption at rest for database storage</li>
              <li>Role-based access controls — only you can access your data</li>
              <li>Regular security monitoring and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use advertising or tracking cookies. You can disable non-essential cookies in your browser settings without affecting core functionality.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy to reflect changes in our practices or applicable law. We will notify you of significant changes by email. Continued use of the Platform after notification constitutes acceptance of the updated Policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Information Regulator</h2>
            <p>If you are not satisfied with how we handle your complaint, you may contact the Information Regulator of South Africa:</p>
            <div className="mt-2 p-3 bg-secondary rounded-lg text-sm">
              <p className="text-foreground font-medium">Information Regulator (South Africa)</p>
              <p>Website: <a href="https://www.inforegulator.org.za" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">www.inforegulator.org.za</a></p>
              <p>Email: inforeg@justice.gov.za</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2025 Analytica (Pty) Ltd · CareerIntel SA</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service →</Link>
        </div>
      </main>
    </div>
  );
}
