// Small stroke icon set used across the site and portal.
const P: Record<string, React.ReactNode> = {
  chat: <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.5A8.4 8.4 0 1 1 21 11.5z" />,
  mail: (<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" /></>),
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />,
  book: (<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></>),
  chart: (<><path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" /><rect x="12" y="8" width="3" height="10" /><rect x="17" y="5" width="3" height="13" /></>),
  cpu: (<><rect x="5" y="5" width="14" height="14" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></>),
  shield: (<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>),
  check: (<><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></>),
  tick: <path d="M20 6 9 17l-5-5" />,
  award: (<><circle cx="12" cy="8" r="6" /><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" /></>),
  grid: (<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>),
  clip: (<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3v3h6V3M9 11h6M9 15h4" /></>),
  card: (<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>),
  users: (<><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5" /><circle cx="17" cy="7" r="2.5" /><path d="M17 13c3 0 5 1.6 5 4.5" /></>),
  quote: (<><path d="M4 4h16v12H8l-4 4z" /><path d="M8 9h8M8 12h5" /></>),
  out: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  play: (<><circle cx="12" cy="12" r="10" /><path d="m10 8 6 4-6 4z" /></>),
  file: (<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>),
  reading: (<><path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z" /><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" /></>),
  clock: (<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>),
  upload: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
  down: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  lock: (<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>),
  bell: (<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>),
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
  code: (<><path d="m16 18 6-6-6-6" /><path d="m8 6-6 6 6 6" /></>),
};

export function Icon({ name, size = 20, className = "", strokeWidth = 2 }: { name: keyof typeof P | string; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {P[name]}
    </svg>
  );
}

export function LogoMark({ size = 44, frame = "#131a2f", arrow = "#11a2d7" }: { size?: number; frame?: string; arrow?: string }) {
  return (
    <svg role="img" aria-label="PsalmTech logo" width={size} height={Math.round(size * 0.9)} viewBox="0 0 100 90">
      <path d="M8 4V82H96" fill="none" stroke={frame} strokeWidth="8" />
      <rect x="24" y="60" width="8" height="20" fill={frame} />
      <rect x="42" y="50" width="8" height="30" fill={frame} />
      <rect x="60" y="64" width="8" height="16" fill={frame} />
      <polyline points="18,48 36,26 54,44 84,12" fill="none" stroke={arrow} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M66 10H86V30" fill="none" stroke={arrow} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ dark = false, sub = "SOLUTIONS" }: { dark?: boolean; sub?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={40} frame={dark ? "#ffffff" : "#131a2f"} />
      <span className="flex flex-col gap-[3px]">
        <span className={`font-display text-lg font-extrabold leading-none tracking-[3px] ${dark ? "text-white" : "text-navy"}`}>PSALMTECH</span>
        <span className={`text-[9px] font-semibold leading-none tracking-[6px] ${dark ? "text-[#9fb0d8]" : "text-royal"}`}>{sub}</span>
      </span>
    </span>
  );
}
