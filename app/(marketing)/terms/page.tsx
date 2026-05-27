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
        <p className="text-muted-foreground text-sm mb-8">Last updated: January 2025</p>

        <div className="prose prose-sm prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using CareerIntel SA (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. CareerIntel SA is operated by Analytica (Pty) Ltd, a company registered in the Republic of South Africa. If you do not agree to these terms, you may not use the Platform.</p>
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
            <p>CareerIntel SA offers both free and paid subscription tiers. Paid subscriptions are billed monthly or annually as selected at checkout. Payments are processed securely through PayFast, a licensed South African payment service provider.</p>
            <p className="mt-2">Subscriptions automatically renew unless cancelled before the renewal date. You may cancel your subscription at any time through the Settings page. Refunds are considered on a case-by-case basis and are not guaranteed.</p>
            <p className="mt-2">All prices are quoted in South African Rand (ZAR) and include applicable VAT where required by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Use the Platform for any unlawful purpose or in violation of South African law</li>
              <li>Upload malicious files, viruses, or harmful content</li>
              <li>Attempt to circumvent security measures or access other users&apos; data</li>
              <li>Scrape, copy, or redistribute Platform content without written permission</li>
              <li>Use the Platform to discriminate against any person on the basis of race, gender, disability, or any other protected characteristic</li>
              <li>Impersonate any person or misrepresent your identity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Intellectual Property</h2>
            <p>All content, features, and functionality of the Platform — including but not limited to AI models, algorithms, design, text, and graphics — are owned by Analytica (Pty) Ltd and protected by applicable South African and international intellectual property laws.</p>
            <p className="mt-2">CV content and personal data you upload remains your property. You grant us a limited licence to process this data solely to provide the services described in these Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Disclaimer of Warranties</h2>
            <p>The Platform is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not guarantee that the Platform will be uninterrupted, error-free, or that AI-generated content will be accurate or suitable for your specific circumstances.</p>
            <p className="mt-2">CareerIntel SA is not a registered employment agency, labour consultant, or career counsellor. Our AI tools do not constitute professional advice.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by South African law, Analytica (Pty) Ltd shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including loss of employment opportunities, income, or data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Governing Law</h2>
            <p>These Terms are governed by the laws of the Republic of South Africa. Any disputes shall be resolved in the courts of South Africa. The Consumer Protection Act 68 of 2008 and the Electronic Communications and Transactions Act 25 of 2002 apply where relevant.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will notify users of significant changes by email or through the Platform. Continued use of the Platform after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:legal@careerintel.co.za" className="text-indigo-400 hover:text-indigo-300">legal@careerintel.co.za</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2025 Analytica (Pty) Ltd · CareerIntel SA</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy →</Link>
        </div>
      </main>
    </div>
  );
}
