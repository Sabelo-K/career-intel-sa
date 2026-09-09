"use client";

/**
 * The Weave — all 307 SA careers on one cloth.
 *
 * The shweshwe discharge print stops being wallpaper and becomes the data
 * structure. Every career is a stamp on the weave:
 *
 *   position (angle)  sector
 *   position (radius) demand — high demand is pulled toward the centre
 *   size              average monthly pay
 *   colour            how much of the job a machine can already do
 *   thread            relatedCareers, so "one step away" is visible, not read
 *
 * Both scales normalise against the range the data actually occupies
 * (WEAVE_RANGES). Scoring demand or automation risk against a nominal 0-100
 * collapses every career into one ring of one colour.
 *
 * Canvas rather than SVG: 307 nodes plus 620 curved threads redrawn on hover is
 * far past the point where per-node DOM stops being sensible.
 */

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import {
  WEAVE_CAREERS,
  WEAVE_SECTORS,
  WEAVE_RANGES,
  type WeaveCareer,
} from "@/lib/data/weave-index.generated";
import { formatZarShort, PROVINCE_NAME } from "@/lib/data/salary-model";

const W = 1400;
const H = 1000;
const CX = W / 2;
const CY = H / 2;
const R = Math.min(W, H) / 2 - 96;

/** Low risk to high, walked by normalised automation risk. */
const RISK_STOPS = ["#3FB380", "#8FBE6E", "#D9A03C", "#CE7B4A", "#C4544F"];

const norm = (v: number, lo: number, hi: number) => (hi === lo ? 0.5 : (v - lo) / (hi - lo));

function riskColour(risk: number) {
  const t = norm(risk, WEAVE_RANGES.automation.min, WEAVE_RANGES.automation.max);
  return RISK_STOPS[Math.min(RISK_STOPS.length - 1, Math.floor(t * RISK_STOPS.length))];
}

interface Node {
  c: WeaveCareer;
  x: number;
  y: number;
  r: number;
  on: boolean;
}

export function CareerWeave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedId, setSelectedId] = useState<string>("data-scientist");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [sector, setSector] = useState("");
  const [remote, setRemote] = useState(false);
  const [intl, setIntl] = useState(false);
  const [safe, setSafe] = useState(false);
  const [query, setQuery] = useState("");
  const [tip, setTip] = useState<{ x: number; y: number; c: WeaveCareer } | null>(null);

  // Layout is deterministic: same data always draws the same cloth.
  const nodes = useMemo<Node[]>(() => {
    const per = (Math.PI * 2) / WEAVE_SECTORS.length;
    return WEAVE_CAREERS.map((c) => {
      const si = WEAVE_SECTORS.indexOf(c.sector);
      // Stable pseudo-jitter inside the sector wedge, derived from the id.
      let seed = 0;
      for (let i = 0; i < c.id.length; i++) seed = (seed * 31 + c.id.charCodeAt(i)) % 9973;
      const frac = seed / 9973;
      const a = si * per + per * (0.12 + frac * 0.76) - Math.PI / 2;
      const rad = R * (0.17 + (1 - norm(c.demandScore, WEAVE_RANGES.demand.min, WEAVE_RANGES.demand.max)) * 0.8);
      const sizeT = norm(c.avgSalaryZar, WEAVE_RANGES.salary.min, WEAVE_RANGES.salary.max);
      return {
        c,
        x: CX + Math.cos(a) * rad,
        y: CY + Math.sin(a) * rad,
        r: 3.2 + Math.sqrt(sizeT) * 9,
        on: true,
      };
    });
  }, []);

  const index = useMemo(() => {
    const m: Record<string, Node> = {};
    nodes.forEach((n) => (m[n.c.id] = n));
    return m;
  }, [nodes]);

  const links = useMemo(() => {
    const out: Array<[Node, Node]> = [];
    nodes.forEach((n) =>
      n.c.related.forEach((rid) => {
        if (index[rid] && n.c.id < rid) out.push([n, index[rid]]);
      })
    );
    return out;
  }, [nodes, index]);

  // Filters mark nodes rather than removing them, so the cloth keeps its shape.
  const active = useMemo(() => {
    const q = query.trim().toLowerCase();
    const set = new Set<string>();
    WEAVE_CAREERS.forEach((c) => {
      const ok =
        (!sector || c.sector === sector) &&
        (!remote || c.remoteFriendly) &&
        (!intl || c.internationalDemand) &&
        (!safe || norm(c.automationRisk, WEAVE_RANGES.automation.min, WEAVE_RANGES.automation.max) <= 0.3) &&
        (!q ||
          c.title.toLowerCase().includes(q) ||
          c.sector.toLowerCase().includes(q) ||
          c.topSkills.some((s) => s.toLowerCase().includes(q)));
      if (ok) set.add(c.id);
    });
    return set;
  }, [sector, remote, intl, safe, query]);

  const selected = index[selectedId] ?? nodes[0];

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070912";
    ctx.fillRect(0, 0, W, H);

    // The discharge print: pale stamps on indigo ink.
    ctx.fillStyle = "rgba(255,255,255,.045)";
    for (let y = 0; y < H; y += 30) {
      for (let x = 0; x < W; x += 30) {
        ctx.beginPath(); ctx.arc(x, y, 1.3, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 15, y + 15, 1, 0, 7); ctx.fill();
      }
    }
    const bloom = ctx.createRadialGradient(CX, CY, 0, CX, CY, R * 1.2);
    bloom.addColorStop(0, "rgba(74,95,199,.26)");
    bloom.addColorStop(0.55, "rgba(74,95,199,.07)");
    bloom.addColorStop(1, "rgba(9,11,22,0)");
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, W, H);

    // Demand rings
    ctx.strokeStyle = "rgba(255,255,255,.07)";
    ctx.lineWidth = 1;
    [0.28, 0.52, 0.76, 1].forEach((f) => {
      ctx.beginPath(); ctx.arc(CX, CY, R * f, 0, 7); ctx.stroke();
    });
    ctx.font = "500 15px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.fillStyle = "rgba(126,134,166,.8)";
    ctx.textAlign = "center";
    ctx.fillText("HIGHEST DEMAND", CX, CY - R * 0.17 - 12);
    ctx.fillText("LOWEST DEMAND", CX, CY - R - 16);

    // Threads between related careers
    links.forEach(([a, b]) => {
      const lit = a.c.id === selectedId || b.c.id === selectedId;
      const dim = !active.has(a.c.id) && !active.has(b.c.id);
      if (dim && !lit) return;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(mx + (CX - mx) * 0.34, my + (CY - my) * 0.34, b.x, b.y);
      ctx.strokeStyle = lit ? "rgba(143,160,240,.8)" : "rgba(143,160,240,.14)";
      ctx.lineWidth = lit ? 2 : 1;
      ctx.stroke();
    });

    // Careers
    nodes.forEach((n) => {
      const on = active.has(n.c.id);
      ctx.globalAlpha = on ? 1 : 0.12;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, 7);
      ctx.fillStyle = riskColour(n.c.automationRisk);
      ctx.fill();
      if (n.c.id === selectedId || n.c.id === hoverId) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 6, 0, 7);
        ctx.strokeStyle = n.c.id === selectedId ? "#E8EAF4" : "rgba(232,234,244,.55)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });

    // Name the selected career on the cloth
    if (selected) {
      ctx.font = "600 18px 'Inter', system-ui, sans-serif";
      const right = selected.x > CX;
      ctx.textAlign = right ? "right" : "left";
      const ox = right ? -selected.r - 12 : selected.r + 12;
      const tw = ctx.measureText(selected.c.title).width;
      ctx.fillStyle = "rgba(9,11,22,.88)";
      ctx.fillRect(selected.x + ox - (right ? tw + 8 : 8), selected.y - 15, tw + 16, 27);
      ctx.fillStyle = "#E8EAF4";
      ctx.fillText(selected.c.title, selected.x + ox, selected.y + 5);
    }
  }, [nodes, links, active, selectedId, hoverId, selected]);

  useEffect(() => { draw(); }, [draw]);

  function locate(ev: React.MouseEvent | React.TouchEvent) {
    const cv = canvasRef.current;
    if (!cv) return null;
    const box = cv.getBoundingClientRect();
    const t = "touches" in ev ? ev.touches[0] : (ev as React.MouseEvent);
    const x = (t.clientX - box.left) * (W / box.width);
    const y = (t.clientY - box.top) * (H / box.height);
    let best: Node | null = null;
    let bd = 24;
    nodes.forEach((n) => {
      if (!active.has(n.c.id)) return;
      const d = Math.hypot(n.x - x, n.y - y);
      if (d < bd) { bd = d; best = n; }
    });
    return { node: best as Node | null, box };
  }

  const matches = useMemo(
    () => WEAVE_CAREERS.filter((c) => active.has(c.id)),
    [active]
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_330px] lg:gap-6">
      <div>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="relative flex-1 min-w-[190px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 307 careers, sectors or skills…"
              aria-label="Search careers"
              className="w-full bg-white/5 border border-white/12 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-shweshwe/60"
            />
            {query && (
              <button
                type="button" onClick={() => setQuery("")} aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            aria-label="Filter by sector"
            className="bg-white/5 border border-white/12 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-shweshwe/60"
          >
            <option value="" className="bg-[#12152a]">All {WEAVE_SECTORS.length} sectors</option>
            {WEAVE_SECTORS.map((s) => (
              <option key={s} value={s} className="bg-[#12152a]">{s}</option>
            ))}
          </select>
          {([
            ["Remote-friendly", remote, setRemote] as const,
            ["In demand abroad", intl, setIntl] as const,
            ["Low automation risk", safe, setSafe] as const,
          ]).map(([label, on, set]) => (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              onClick={() => set(!on)}
              className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                on
                  ? "bg-shweshwe/25 border-shweshwe text-white"
                  : "border-white/12 text-white/60 hover:text-white hover:border-white/25"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* The cloth */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="block w-full h-auto rounded-xl border border-white/10 bg-[#070912] cursor-crosshair touch-none"
            onMouseMove={(e) => {
              const hit = locate(e);
              if (!hit) return;
              setHoverId(hit.node?.c.id ?? null);
              setTip(
                hit.node
                  ? {
                      x: (hit.node.x / W) * hit.box.width,
                      y: (hit.node.y / H) * hit.box.height,
                      c: hit.node.c,
                    }
                  : null
              );
            }}
            onMouseLeave={() => { setHoverId(null); setTip(null); }}
            onClick={(e) => {
              const hit = locate(e);
              if (hit?.node) setSelectedId(hit.node.c.id);
            }}
          />
          {tip && (
            <div
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[125%] rounded-lg border border-white/15 bg-[#141833]/97 px-3 py-2 shadow-2xl"
              style={{ left: tip.x, top: tip.y }}
            >
              <span className="block text-sm font-semibold text-white">{tip.c.title}</span>
              <span className="block text-[11px] font-mono text-white/45">
                {formatZarShort(tip.c.avgSalaryZar)} · demand {tip.c.demandScore} · {tip.c.automationRisk}% automatable
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-[11px] font-mono text-white/40">
          <span>Toward the centre = higher demand</span>
          <span>Bigger = pays more</span>
          <span className="flex items-center gap-1.5">
            Automation risk {WEAVE_RANGES.automation.min}%
            {RISK_STOPS.map((c, i) => (
              <i
                key={c}
                className="block w-5 h-2"
                style={{
                  background: c,
                  borderRadius: i === 0 ? "2px 0 0 2px" : i === RISK_STOPS.length - 1 ? "0 2px 2px 0" : 0,
                }}
              />
            ))}
            {WEAVE_RANGES.automation.max}%
          </span>
          <span className="text-white/30">{matches.length} of {WEAVE_CAREERS.length} shown</span>
        </div>
      </div>

      {/* Detail panel */}
      <aside className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#141833]/55 p-5 h-fit lg:sticky lg:top-6">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-shweshwe-light">
            {selected.c.sector}
          </p>
          <h2 className="mt-1 text-xl font-bold leading-tight tracking-tight">{selected.c.title}</h2>
        </div>

        <dl className="grid grid-cols-2 gap-px rounded-lg border border-white/10 overflow-hidden bg-white/10">
          {[
            ["Avg / month", formatZarShort(selected.c.avgSalaryZar)],
            ["Demand", `${selected.c.demandScore} / 100`],
            ["NQF level", selected.c.nqfLevel ? `NQF ${selected.c.nqfLevel}` : "—"],
            ["Automatable", `${selected.c.automationRisk}%`],
          ].map(([k, v]) => (
            <div key={k} className="bg-[#0e1224] px-3 py-2">
              <dt className="text-[10px] font-mono uppercase tracking-[0.1em] text-white/40">{k}</dt>
              <dd className="mt-0.5 font-mono text-sm tabular-nums text-white">{v}</dd>
            </div>
          ))}
        </dl>

        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-white/40 mb-2">Range</p>
          <p className="font-mono text-sm text-white/80">
            {formatZarShort(selected.c.minSalaryZar)} – {formatZarShort(selected.c.maxSalaryZar)}
            <span className="text-white/35"> per month</span>
          </p>
        </div>

        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-white/40 mb-2">Top skills</p>
          <div className="flex flex-wrap gap-1.5">
            {selected.c.topSkills.map((s) => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-shweshwe/15 border border-shweshwe/30 text-shweshwe-pale">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-white/40 mb-2">Hires most in</p>
          <p className="text-sm text-white/70">
            {selected.c.topProvinces.map((p) => PROVINCE_NAME[p] ?? p).join(" · ")}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-white/40 mb-1">One step away</p>
          {selected.c.related.length > 0 ? (
            <div className="flex flex-col">
              {selected.c.related.map((rid) => {
                const r = index[rid];
                if (!r) return null;
                const diff = r.c.avgSalaryZar - selected.c.avgSalaryZar;
                return (
                  <button
                    key={rid}
                    type="button"
                    onClick={() => setSelectedId(rid)}
                    className="flex items-center justify-between gap-2 border-b border-white/6 py-2 text-left text-sm text-white/70 hover:text-white last:border-0"
                  >
                    <span className="truncate">{r.c.title}</span>
                    <span className={`shrink-0 font-mono text-xs ${diff > 0 ? "text-emerald-400" : diff < 0 ? "text-white/35" : "text-white/35"}`}>
                      {diff > 0 ? "+" : diff < 0 ? "−" : ""}{formatZarShort(Math.abs(diff))}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-white/40">No mapped neighbours yet.</p>
          )}
        </div>

        <Link
          href={`/explore/${selected.c.id}`}
          className="group flex items-center justify-center gap-2 rounded-lg bg-shweshwe hover:bg-shweshwe-light px-4 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          Full profile
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </aside>
    </div>
  );
}
