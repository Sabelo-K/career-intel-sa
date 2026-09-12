"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";

/** Decorative vector scenery: no video download or animation library required. */
export function CareerHorizon() {
  const [paused, setPaused] = useState(false);
  return <>
    <div className={`career-horizon${paused ? " is-paused" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1440 760" preserveAspectRatio="xMidYMax slice" focusable="false">
        <defs>
          <radialGradient id="career-dawn"><stop stopColor="#e9be75" stopOpacity=".38" /><stop offset="1" stopColor="#f6f5f1" stopOpacity="0" /></radialGradient>
          <linearGradient id="career-hills" x2="0" y2="1"><stop stopColor="#cdd7e4" /><stop offset="1" stopColor="#e9ecee" /></linearGradient>
          <linearGradient id="career-route"><stop stopColor="#7386bc" /><stop offset=".6" stopColor="#58776f" /><stop offset="1" stopColor="#c6954d" /></linearGradient>
        </defs>
        <circle className="career-horizon-sun" cx="1070" cy="300" r="330" fill="url(#career-dawn)" />
        <g fill="none" stroke="#8c9fb9" strokeWidth="1.5" opacity=".25">
          <path d="M70 660 270 488 355 550 505 380 690 579 850 472 1040 615 1270 440 1440 560" />
          <path d="M0 698 180 600 390 680 630 536 910 675 1180 575 1440 665" />
        </g>
        <path d="M0 709 Q170 640 360 695 T730 683 T1100 663 T1440 675 V760 H0Z" fill="url(#career-hills)" opacity=".65" />
        <g fill="#d4dce5" stroke="#8597b2" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M180 695 V646 H272 V695 M169 646 226 609 284 646 M211 695 V669 H240 V695" />
          <path d="M226 609 V586 L250 591 226 598" fill="#b5c5b5" />
          <path d="M1068 679 V611 H1105 V679 M1114 679 V572 H1158 V679 M1168 679 V631 H1205 V679 M1215 679 V595 H1256 V679" />
        </g>
        <g stroke="#8597b2" strokeWidth="3" opacity=".7">
          <path d="M191 656 H201 M251 656 H261 M1125 587 H1147 M1125 602 H1147 M1125 617 H1147 M1125 632 H1147 M1125 647 H1147 M1225 610 H1246 M1225 625 H1246 M1225 640 H1246 M1078 624 H1095 M1078 640 H1095" />
        </g>
        <path d="M-80 765 C180 705 310 760 460 704 S700 748 870 703 1130 732 1510 679" fill="none" stroke="url(#career-route)" strokeWidth="2" opacity=".65" />
        <path className="career-horizon-trail" d="M-80 765 C180 705 310 760 460 704 S700 748 870 703 1130 732 1510 679" fill="none" stroke="#3d4fb0" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 155" opacity=".65" />
        <g fill="#f6f5f1" stroke="#7386a9" strokeWidth="2">
          <circle cx="226" cy="729" r="7" /><circle cx="641" cy="721" r="7" /><circle cx="1138" cy="707" r="7" />
        </g>
      </svg>
    </div>
    <button type="button" className="career-motion-control" aria-pressed={paused} onClick={() => setPaused(value => !value)}>
      {paused ? <Play size={13} /> : <Pause size={13} />}
      {paused ? "Play background" : "Pause background"}
    </button>
  </>;
}
