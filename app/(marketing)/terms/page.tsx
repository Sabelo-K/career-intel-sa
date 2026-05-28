import Link from "next/link";
import { Sparkles } from "lucide-react";

export const metadata = { title: "Terms of Service | CareerIntel SA" };

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: May 2026 · Governed by the laws of the Republic of South Africa</p>

        <div className="prose prose-sm prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using CareerIntel SA (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. CareerIntel SA is operated by <strong className="text-foreground">Sabelo Khanyile</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), trading as CareerIntel SA, in the Republic of South Africa. If you do not agree to these terms, you may not use the Platform.</p>
          </section>

          {/* ECT Act Section 43 — Supplier Information */}
          <section className="p-4 rounded-xl bg-secondary border border-border text-sm">
            <h2 className="text-base font-semibold text-foreground mb-3">Supplier Information (ECT Act Section 43)</h2>
            <p className="text-muted-foreground mb-2">As required by the Electronic Communications and Transactions Act 25 of 2002:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Full name:</strong> Sabelo Khanyile (trading as CareerIntel SA)</li>
              <li><strong className="text-foreground">Country of registration:</strong> Republic of South Africa</li>
              <li><strong className="text-foreground">Physical address:</strong> KwaZulu-Natal, South Africa</li>
              <li><strong className="text-foreground">Email:</strong> <a href="mailto:legal@careerintelsa.co.za" className="text-indigo-400 hover:text-indigo-300">legal@careerintelsa.co.za</a></li>
              <li><strong className="text-foreground">Website:</strong> <a href="https://careerintelsa.co.za" className="text-indigo-400 hover:text-indigo-300">careerintelsa.co.za</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>CareerIntel SA provides AI-powered career intelligence tools including CV analysis, skills gap analysis, career coaching, interview preparation, and career path simulation. The Platform is intended to supplement — not replace — professional career counselling, human resources advice, or legal employment guidance.</p>
            <p className="mt-2">AI-generated content is provided for informational purposes only. Salary ranges, demand scores, and market insights are estimates based on publicly available data and AI analysis. They do not constitute guarantees of employment outcomes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. User Accounts</h2>
            <p>You must create an account to access most features of the Platform. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorised use of your account.</p>
            <p className="mt-2">You must be at least 16 years old to create an account. By creating an account, you represent that you meet this requirement.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Subscriptions and Payments</h2>
            <p>CareerIntel SA offers both free and paid subscription tiers. Paid subscriptions are billed monthly as selected at checkout. Payments are processed securely through PayFast, a licensed South African payment service provider.</p>
            <p className="mt-2">All prices are quoted in South African Rand (ZAR) and are inclusive of VAT where applicable.</p>
            <p className="mt-2">Subscriptions automatically renew each month unless cancelled before the renewal date. You may cancel your subscription at any time through the <strong className="text-foreground">Settings</strong> page in the app.</p>
          </section>

          {/* CPA Section 16 — Cooling-Off Period */}
          <section className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 text-sm">
            <h2 className="text-base font-semibold text-foreground mb-3">5. Cooling-Off Period (Consumer Protection Act Section 44, ECT Act)</h2>
            <p>In accordance with the <strong className="text-foreground">Electronic Communications and Transactions Act 25 of 2002 (Section 44)</strong> and the <strong className="text-foreground">Consumer Protection Act 68 of 2008</strong>, you have the right to cancel any electronic transaction within <strong className="text-foreground">7 (seven) business days</strong> of the date of the transaction without reason or penalty.</p>
            <p className="mt-2">To exercise your cooling-off right, notify us in writing at <a href="mailto:legal@careerintelsa.co.za" className="text-indigo-400 hover:text-indigo-300">legal@careerintelsa.co.za</a> within the 7-day period. We will process a full refund within 30 days of receiving your cancellation notice.</p>
          </section>

          {/* Refund Policy */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Refund and Cancellation Policy</h2>
            <p>Outside of the statutory cooling-off period described above:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Subscriptions cancelled mid-month will not be refunded for the remaining period but will remain active until the end of the billing cycle</li>
              <li>Refund requests due to technical failures or service unavailability will be assessed on a case-by-case basis</li>
              <li>To request a refund outside the cooling-off period, contact <a href="mailto:legal@careerintelsa.co.za" className="text-indigo-400 hover:text-indigo-300">legal@careerintelsa.co.za</a> with your account details and reason</li>
              <li>We will respond to all refund requests within <strong className="text-foreground">5 business days</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Use the Platform for any unlawful purpose or in violation of South African law</li>
              <li>Upload malicious files, viruses, or harmful content</li>
              <li>Attempt to circumvent security measures or access other users&apos; data</li>
              <li>Scrape, copy, or redistribute Platform content without written permission</li>
              <li>Use the Platform to discriminate against any person on the basis of race, gender, disability, or any other protected characteristic under the Constitution of the Republic of South Africa</li>
              <li>Impersonate any person or misrepresent your identity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Intellectual Property</h2>
            <p>All content, features, and functionality of the Platform — including but not limited to AI models, algorithms, design, text, and graphics — are owned by CareerIntel SA and protected by applicable South African and international intellectual property laws.</p>
            <p className="mt-2">CV content and personal data you upload remains your property. You grant us a limited licence to process this data solely to provide the services described in these Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Disclaimer of Warranties</h2>
            <p>The Platform is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not guarantee that the Platform will be uninterrupted, error-free, or that AI-generated content will be accurate or suitable for your specific circumstances.</p>
            <p className="mt-2">CareerIntel SA is not a registered employment agency, labour consultant, or career counsellor. Our AI tools do not constitute professional advice. Nothing on this Platform constitutes legal, financial, or regulated career advice.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by South African law, CareerIntel SA shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including loss of employment opportunities, income, or data.</p>
            <p className="mt-2">Nothing in these Terms limits your rights under the Consumer Protection Act 68 of 2008 that cannot be excluded or limited by agreement.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. PAIA — Access to Information</h2>
            <p>In terms of the <strong className="text-foreground">Promotion of Access to Information Act 2 of 2000 (PAIA)</strong>, a copy of our PAIA manual is available on request. To request access to records held by CareerIntel SA, contact our Information Officer at <a href="mailto:privacy@careerintelsa.co.za" className="text-indigo-400 hover:text-indigo-300">privacy@careerintelsa.co.za</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Governing Law and Dispute Resolution</h2>
            <p>These Terms are governed by the laws of the Republic of South Africa. Any disputes shall be resolved in the courts of South Africa. The Consumer Protection Act 68 of 2008, the Electronic Communications and Transactions Act 25 of 2002, and the Protection of Personal Information Act 4 of 2013 (POPIA) apply where relevant.</p>
            <p className="mt-2">Before initiating legal proceedings, parties agree to attempt resolution through good-faith negotiation. If unresolved within 30 days, either party may approach the National Consumer Commission or a relevant Ombud.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">13. Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will notify users of significant changes by email or through the Platform. Continued use of the Platform after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">14. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:legal@careerintelsa.co.za" className="text-indigo-400 hover:text-indigo-300">legal@careerintelsa.co.za</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 CareerIntel SA · Sabelo Khanyile</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy →</Link>
        </div>
      </main>
    </div>
  );
}
