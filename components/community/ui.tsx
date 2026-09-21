"use client";

// ============================================================
// Komponen UI kecil yang dipakai bersama seluruh section Community
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { avatarColor, initialsOf2 } from "@/lib/communityData";

export function Avatar({
  name,
  size = "md",
  ring = false,
}: {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  ring?: boolean;
}) {
  const sizes = {
    xs: "w-6 h-6 text-[9px]",
    sm: "w-8 h-8 text-[11px]",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  };
  return (
    <div
      className={`${sizes[size]} ${avatarColor(name)} ${
        ring ? "ring-2 ring-white shrink-0" : "shrink-0"
      } rounded-full text-white flex items-center justify-center font-headline-sm font-bold`}
      title={name}
    >
      {initialsOf2(name)}
    </div>
  );
}

export function AvatarStack({ names, max = 5 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((n) => (
        <Avatar key={n} name={n} size="sm" ring />
      ))}
      {rest > 0 && (
        <div className="w-8 h-8 rounded-full bg-slate-200 ring-2 ring-white shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-600">
          +{rest}
        </div>
      )}
    </div>
  );
}

export function CommunityHeader({ subtitle }: { subtitle: string }) {
  return (
    <div>
      <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        Community
      </h1>
      <p className="mt-1.5 font-body-md text-sm text-slate-600">{subtitle}</p>
    </div>
  );
}

export function CommunityNav() {
  const pathname = usePathname();
  const tabs = [
    { href: "/dashboard/community", label: "For You", exact: true },
    { href: "/dashboard/community/circles", label: "Circles" },
    { href: "/dashboard/community/skill-rooms", label: "Skill Rooms" },
    { href: "/dashboard/community/events", label: "Events" },
  ];
  return (
    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none" aria-label="Navigasi community">
      {tabs.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              active
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SectionHeader({
  title,
  action,
  href,
}: {
  title: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-headline-sm text-base sm:text-lg font-bold text-slate-900">{title}</h2>
      {action && href && (
        <Link
          href={href}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-0.5 shrink-0"
        >
          {action}
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="p-8 sm:p-10 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="font-headline-sm text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatChip({
  icon,
  label,
  value,
  className = "bg-indigo-50 text-indigo-600 border-indigo-200",
}: {
  icon: string;
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${className}`}
    >
      <span className="material-symbols-outlined text-[14px]">{icon}</span>
      {value} {label}
    </span>
  );
}
