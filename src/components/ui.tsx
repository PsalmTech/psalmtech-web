import { Icon } from "./icons";

export function Stat({ icon, label, value, sub, color }: { icon: string; label: string; value: React.ReactNode; sub?: string; color: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-5">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${color}`}><Icon name={icon} size={24} /></span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[13px] font-semibold text-muted">{label}</span>
        <span className="font-display text-2xl font-extrabold">{value}</span>
        {sub && <span className="truncate text-xs text-muted">{sub}</span>}
      </span>
    </div>
  );
}

export function Bar({ value, className = "bg-cyan", h = "h-2" }: { value: number; className?: string; h?: string }) {
  return (
    <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} className={`${h} overflow-hidden rounded-full bg-ice`}>
      <div className={`h-full rounded-full ${className}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

const STATUS: Record<string, string> = {
  graded: "bg-[#dff5ea] text-[#14724d]", success: "bg-[#dff5ea] text-[#14724d]", active: "bg-[#dff5ea] text-[#14724d]", replied: "bg-[#dff5ea] text-[#14724d]",
  submitted: "bg-ice text-royal", new: "bg-ice text-royal",
  pending: "bg-[#fdecd9] text-[#8a4a06]", overdue: "bg-red-50 text-red-700", failed: "bg-red-50 text-red-700",
  closed: "bg-[#eef1f6] text-muted", cancelled: "bg-[#eef1f6] text-muted",
};
export function StatusPill({ status, label }: { status: string; label?: string }) {
  return <span className={`pill ${STATUS[status] ?? "bg-[#eef1f6] text-muted"}`}>{label ?? status[0]!.toUpperCase() + status.slice(1)}</span>;
}

export function SectionCard({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-4 rounded-2xl border border-line bg-white p-6 ${className}`}>
      {(title || action) && <div className="flex items-center justify-between gap-3">{title && <h2 className="font-display text-lg font-bold">{title}</h2>}{action}</div>}
      {children}
    </section>
  );
}
