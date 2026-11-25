export function naira(kobo: number | null | undefined) {
  if (kobo == null) return "—";
  return "₦" + (kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export function fmtDate(d: string | null | undefined, withTime = false) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "Africa/Lagos",
  });
}

export function initials(name: string | null | undefined) {
  return (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** Discount applies to students and researchers (as chosen at sign-up). */
export function priceFor(priceKobo: number, discountPercent: number, userType: string | null | undefined) {
  const eligible = userType === "student" || userType === "researcher";
  return eligible ? Math.round(priceKobo * (1 - discountPercent / 100)) : priceKobo;
}

export function letterGrade(pct: number) {
  if (pct >= 70) return "A";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 45) return "D";
  if (pct >= 40) return "E";
  return "F";
}

export const CONTACT = {
  whatsapp: "+234 904 520 4520",
  whatsappLink: "https://wa.me/2349045204520",
  phone: "+234 814 796 6893",
  email: "psalmtech0@gmail.com",
  github: "https://github.com/PsalmTech",
  linkedin: "https://www.linkedin.com/in/samuel-ojeleke-932628382/",
};
