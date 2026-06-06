/**
 * CareerIntel SA — transactional email via Resend
 *
 * Setup:
 *  1. Sign up free at https://resend.com (3 000 emails/month free)
 *  2. Verify your domain (careerintelsa.co.za) in Resend → Domains
 *  3. Add RESEND_API_KEY to Vercel env vars
 *
 * If RESEND_API_KEY is not set, all send calls silently no-op so the
 * app works in development without an API key.
 */

import { Resend } from "resend";

// ── Client ────────────────────────────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

const FROM =
  process.env.EMAIL_FROM ?? "CareerIntel SA <hello@careerintelsa.co.za>";

/** Fire-and-forget email helper — logs errors but never throws */
async function send(opts: Parameters<typeof resend.emails.send>[0]) {
  if (!process.env.RESEND_API_KEY) return; // no-op in dev without key
  try {
    const { error } = await resend.emails.send(opts);
    if (error) console.error("[email]", error);
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}

// ── Shared HTML helpers ────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://career-intel-sa.vercel.app";

function emailWrapper(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CareerIntel SA</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo header -->
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <a href="${BASE_URL}" style="text-decoration:none;">
                <span style="font-size:20px;font-weight:800;color:#1e1b4b;letter-spacing:-0.5px;">
                  Career<span style="color:#6366f1;">Intel</span>
                  <span style="color:#f59e0b;font-size:13px;margin-left:3px;">SA</span>
                </span>
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;padding:36px 32px;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">
                CareerIntel SA · Built for the South African job market<br />
                <a href="${BASE_URL}/privacy" style="color:#9ca3af;">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="${BASE_URL}/settings" style="color:#9ca3af;">Manage Notifications</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function btn(label: string, href: string, color = "#6366f1"): string {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:${color};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">${label}</a>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #f0f0f0;margin:24px 0;" />`;
}

// ── 1. Welcome email ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  const firstName = name?.split(" ")[0] ?? "there";

  const html = emailWrapper(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111827;">
      Welcome to CareerIntel SA, ${firstName}! 🎉
    </h1>
    <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.6;">
      Your AI-powered career intelligence platform is ready. Here's what you can do right now:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${[
        ["🧠", "Run a Skills Gap Analysis", "Find exactly what skills you need for your dream role and get a personalised learning roadmap."],
        ["📄", "Build or Upload Your CV", "Get an ATS score and AI-powered suggestions tailored to the SA job market."],
        ["🔔", "Set Up Job Alerts", "Get notified when SA jobs matching your target role and salary appear."],
      ].map(([icon, title, desc]) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:22px;padding-right:12px;vertical-align:top;">${icon}</td>
              <td>
                <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111827;">${title}</p>
                <p style="margin:0;font-size:13px;color:#6b7280;">${desc}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`).join("")}
    </table>

    <div style="text-align:center;">
      ${btn("Go to My Dashboard →", `${BASE_URL}/dashboard`)}
    </div>

    ${divider()}
    <p style="margin:0;font-size:12px;color:#9ca3af;">
      You're on the <strong>Free plan</strong>. Upgrade from R24/mo to unlock unlimited AI coaching, skills gap analyses, and career simulations.
      <a href="${BASE_URL}/upgrade" style="color:#6366f1;">See plans →</a>
    </p>
  `);

  await send({
    from:    FROM,
    to,
    subject: `Welcome to CareerIntel SA, ${firstName}! 🚀`,
    html,
  });
}

// ── 2. Upgrade / payment receipt ──────────────────────────────────────────────

interface ReceiptOpts {
  name:           string;
  planName:       string;      // "Graduate" | "Professional" | "Recruiter"
  amountRands:    string;      // e.g. "49.00"
  planExpiresAt:  Date;
}

export async function sendUpgradeReceipt(to: string, opts: ReceiptOpts) {
  const firstName = opts.name?.split(" ")[0] ?? "there";
  const expiryStr = opts.planExpiresAt.toLocaleDateString("en-ZA", {
    day: "numeric", month: "long", year: "numeric",
  });

  const html = emailWrapper(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:#f0fdf4;border-radius:50%;padding:12px;margin-bottom:12px;">
        <span style="font-size:32px;">✅</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">
        You&apos;re now on ${opts.planName}!
      </h1>
      <p style="margin:0;font-size:15px;color:#6b7280;">
        Thanks ${firstName} — your payment was received.
      </p>
    </div>

    <!-- Receipt box -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f9fafb;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <tr>
        <td style="font-size:13px;color:#6b7280;padding:4px 0;">Plan</td>
        <td style="font-size:13px;font-weight:600;color:#111827;text-align:right;padding:4px 0;">
          CareerIntel SA ${opts.planName}
        </td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#6b7280;padding:4px 0;">Amount paid</td>
        <td style="font-size:13px;font-weight:600;color:#111827;text-align:right;padding:4px 0;">
          R${opts.amountRands}
        </td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#6b7280;padding:4px 0;">Access until</td>
        <td style="font-size:13px;font-weight:600;color:#111827;text-align:right;padding:4px 0;">
          ${expiryStr}
        </td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#6b7280;padding:4px 0;">Payment method</td>
        <td style="font-size:13px;color:#6b7280;text-align:right;padding:4px 0;">PayFast</td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:14px;color:#374151;font-weight:600;">
      What&apos;s unlocked on ${opts.planName}:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${[
        "Unlimited AI Career Coach sessions",
        "Unlimited Skills Gap analyses",
        "Unlimited Career Path simulations",
        "Advanced CV analysis &amp; revamp",
        "Salary forecasting &amp; market insights",
      ].map(f => `
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#374151;">
          <span style="color:#22c55e;margin-right:8px;">✓</span>${f}
        </td>
      </tr>`).join("")}
    </table>

    <div style="text-align:center;">
      ${btn("Start Using CareerIntel SA →", `${BASE_URL}/dashboard`)}
    </div>

    ${divider()}
    <p style="margin:0;font-size:12px;color:#9ca3af;">
      Need help? Reply to this email or visit <a href="${BASE_URL}" style="color:#6366f1;">careerintelsa.co.za</a>.
      Refunds within 7 days per our <a href="${BASE_URL}/terms" style="color:#6366f1;">Terms of Service</a>.
    </p>
  `);

  await send({
    from:    FROM,
    to,
    subject: `Your CareerIntel SA ${opts.planName} plan is active ✅`,
    html,
  });
}

// ── 3. Job alert digest ────────────────────────────────────────────────────────

export interface AlertJobItem {
  title:     string;
  company:   string;
  location:  string;
  salaryMin: number | null;
  salaryMax: number | null;
  url:       string;
  postedAt:  string;
}

interface JobAlertDigestOpts {
  name:       string;
  keywords:   string[];
  province?:  string | null;
  jobs:       AlertJobItem[];
}

export async function sendJobAlertDigest(to: string, opts: JobAlertDigestOpts) {
  const firstName  = opts.name?.split(" ")[0] ?? "there";
  const roleLabel  = opts.keywords.join(", ");
  const locationLabel = opts.province ?? "South Africa";
  const count      = opts.jobs.length;

  const jobRows = opts.jobs.map(job => {
    const salary =
      job.salaryMin && job.salaryMax
        ? `R${Math.round(job.salaryMin / 1000)}k–R${Math.round(job.salaryMax / 1000)}k/mo`
        : job.salaryMin
        ? `From R${Math.round(job.salaryMin / 1000)}k/mo`
        : "";

    const daysAgo = job.postedAt
      ? Math.max(0, Math.round((Date.now() - new Date(job.postedAt).getTime()) / 86_400_000))
      : null;

    const timeLabel =
      daysAgo === null ? "" :
      daysAgo === 0 ? "Today" :
      daysAgo === 1 ? "Yesterday" :
      `${daysAgo}d ago`;

    return `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <a href="${job.url}" style="font-size:14px;font-weight:600;color:#4f46e5;text-decoration:none;">
                ${job.title}
              </a>
              <p style="margin:2px 0 0;font-size:12px;color:#6b7280;">
                ${job.company} &nbsp;·&nbsp; ${job.location}
                ${salary ? `&nbsp;·&nbsp; <span style="color:#16a34a;">${salary}</span>` : ""}
                ${timeLabel ? `&nbsp;·&nbsp; <span style="color:#9ca3af;">${timeLabel}</span>` : ""}
              </p>
            </td>
            <td style="text-align:right;vertical-align:top;white-space:nowrap;">
              <a href="${job.url}"
                style="display:inline-block;padding:6px 14px;background:#eff6ff;color:#4f46e5;font-size:12px;font-weight:600;text-decoration:none;border-radius:8px;border:1px solid #c7d2fe;">
                Apply →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  }).join("");

  const html = emailWrapper(`
    <h1 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#111827;">
      ${count} new job${count !== 1 ? "s" : ""} matching your alert 🔔
    </h1>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
      Hi ${firstName}, here are today&apos;s <strong>${roleLabel}</strong> opportunities in
      <strong>${locationLabel}</strong>:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${jobRows}
    </table>

    <div style="text-align:center;">
      ${btn("Manage My Job Alerts", `${BASE_URL}/job-alerts`)}
    </div>

    ${divider()}
    <p style="margin:0;font-size:11px;color:#9ca3af;">
      Jobs sourced from the SA market via
      <a href="https://www.adzuna.co.za" style="color:#9ca3af;">Adzuna</a>.
      You&apos;re receiving this because you set up a job alert on CareerIntel SA.
      <a href="${BASE_URL}/job-alerts" style="color:#9ca3af;">Manage alerts</a>
    </p>
  `);

  await send({
    from:    FROM,
    to,
    subject: `${count} new ${roleLabel} job${count !== 1 ? "s" : ""} in ${locationLabel} — CareerIntel SA`,
    html,
  });
}

// ── 4. Weekly career digest ───────────────────────────────────────────────────

interface WeeklyDigestOpts {
  name:     string;
  topCareers: { title: string; sector: string; demandScore: number; avgSalary: number }[];
  salaryInsight: string;
  careerTip: string;
}

export async function sendWeeklyDigest(to: string, opts: WeeklyDigestOpts) {
  const firstName = opts.name?.split(" ")[0] ?? "there";
  const weekOf    = new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

  const careerRows = opts.topCareers.map((c, i) => `
  <tr>
    <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:28px;vertical-align:top;padding-top:2px;">
            <span style="font-size:16px;font-weight:800;color:#6366f1;">${i + 1}</span>
          </td>
          <td>
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111827;">${c.title}</p>
            <p style="margin:0;font-size:12px;color:#6b7280;">
              ${c.sector} &nbsp;·&nbsp;
              <span style="color:#16a34a;">Avg R${Math.round(c.avgSalary / 1000)}k/mo</span> &nbsp;·&nbsp;
              <span style="color:#6366f1;">Demand: ${c.demandScore}/100</span>
            </p>
          </td>
          <td style="text-align:right;vertical-align:top;">
            <a href="${BASE_URL}/job-market"
              style="display:inline-block;padding:5px 12px;background:#eff6ff;color:#4f46e5;font-size:11px;font-weight:600;text-decoration:none;border-radius:6px;border:1px solid #c7d2fe;white-space:nowrap;">
              Explore →
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`).join("");

  const html = emailWrapper(`
    <div style="margin-bottom:8px;">
      <span style="display:inline-block;background:#f0f9ff;color:#0369a1;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;border:1px solid #bae6fd;">
        Week of ${weekOf}
      </span>
    </div>
    <h1 style="margin:12px 0 6px;font-size:22px;font-weight:800;color:#111827;">
      Your SA Career Intel — Weekly Digest 🇿🇦
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Hi ${firstName}, here&apos;s your weekly snapshot of the South African job market.
    </p>

    <!-- Top careers -->
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.05em;">
      🔥 Top SA Careers This Week
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${careerRows}
    </table>

    <!-- Salary insight -->
    <div style="background:#f0fdf4;border-left:3px solid #22c55e;border-radius:8px;padding:14px 16px;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.05em;">
        💰 Salary Insight
      </p>
      <p style="margin:0;font-size:14px;color:#166534;line-height:1.6;">${opts.salaryInsight}</p>
    </div>

    <!-- Career tip -->
    <div style="background:#faf5ff;border-left:3px solid #a855f7;border-radius:8px;padding:14px 16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#7e22ce;text-transform:uppercase;letter-spacing:0.05em;">
        💡 Career Tip
      </p>
      <p style="margin:0;font-size:14px;color:#581c87;line-height:1.6;">${opts.careerTip}</p>
    </div>

    <div style="text-align:center;">
      ${btn("Open My Dashboard →", `${BASE_URL}/dashboard`)}
    </div>

    ${divider()}
    <p style="margin:0;font-size:11px;color:#9ca3af;">
      You&apos;re receiving this weekly digest as a CareerIntel SA member.
      <a href="${BASE_URL}/settings" style="color:#9ca3af;">Manage email preferences</a>
    </p>
  `);

  await send({
    from:    FROM,
    to,
    subject: `Your weekly SA career intel — ${weekOf}`,
    html,
  });
}

// ── Owner revenue alert ───────────────────────────────────────────────────────

const OWNER_EMAIL = "bareer57@gmail.com";

export async function sendOwnerRevenueAlert(opts: {
  userEmail:      string;
  userName:       string;
  planName:       string;
  amountRands:    string;
  billingType:    "ONCE_OFF" | "SUBSCRIPTION";
  planExpiresAt:  Date;
}) {
  const billingLabel = opts.billingType === "SUBSCRIPTION" ? "Monthly Subscription" : "Once-off (30 days)";
  const emoji        = opts.billingType === "SUBSCRIPTION" ? "🔄" : "💳";
  const planEmoji    = opts.planName === "Recruiter" ? "👔" : opts.planName === "Professional" ? "⭐" : "🎓";

  await send({
    from:    FROM,
    to:      OWNER_EMAIL,
    subject: `${planEmoji} New ${opts.planName} subscriber — R${opts.amountRands} — CareerIntel SA`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0d1117;border-radius:12px;padding:32px;color:#e5e7eb;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#ffffff;">💰 New Paid User!</h2>
        <p style="margin:0 0 24px;color:#9ca3af;font-size:14px;">Someone just upgraded on CareerIntel SA</p>

        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #1f2937;color:#9ca3af;font-size:13px;width:40%;">User</td>
            <td style="padding:10px 0;border-bottom:1px solid #1f2937;color:#ffffff;font-size:13px;">${opts.userName || "—"}<br/><span style="color:#6366f1;font-size:12px;">${opts.userEmail}</span></td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #1f2937;color:#9ca3af;font-size:13px;">${planEmoji} Plan</td>
            <td style="padding:10px 0;border-bottom:1px solid #1f2937;color:#ffffff;font-size:13px;">${opts.planName}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #1f2937;color:#9ca3af;font-size:13px;">💵 Amount</td>
            <td style="padding:10px 0;border-bottom:1px solid #1f2937;font-size:18px;font-weight:bold;color:#34d399;">R${opts.amountRands}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #1f2937;color:#9ca3af;font-size:13px;">${emoji} Billing</td>
            <td style="padding:10px 0;border-bottom:1px solid #1f2937;color:#ffffff;font-size:13px;">${billingLabel}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#9ca3af;font-size:13px;">📅 Access until</td>
            <td style="padding:10px 0;color:#ffffff;font-size:13px;">${opts.planExpiresAt.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</td>
          </tr>
        </table>

        <div style="margin-top:24px;padding:16px;background:#111827;border-radius:8px;border-left:3px solid #34d399;">
          <p style="margin:0;font-size:13px;color:#9ca3af;">View in admin panel</p>
          <a href="${BASE_URL}/admin" style="color:#6366f1;font-size:13px;">${BASE_URL}/admin</a>
        </div>
      </div>
    `,
  });
}
