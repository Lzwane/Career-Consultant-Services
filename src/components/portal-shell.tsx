import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/status";

export type PortalNavItem = { key: string; label: string; icon: LucideIcon };

export function StatusPill({ status }: { status: ApplicationStatus | string }) {
  const label = STATUS_LABELS[status as ApplicationStatus] || String(status).replace(/_/g, " ");
  const tone =
    status === "successful"
      ? "border-primary/30 bg-primary text-primary-foreground"
      : status === "unsuccessful"
        ? "border-destructive/30 bg-destructive/10 text-destructive"
        : status === "additional_documents_required"
          ? "border-accent bg-accent/25 text-foreground"
          : "border-primary/20 bg-primary/5 text-primary";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function PortalShell({
  title,
  subtitle,
  email,
  nav,
  active,
  onNav,
  children,
}: {
  title: string;
  subtitle: string;
  email?: string;
  nav: PortalNavItem[];
  active: string;
  onNav: (key: string) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const NavList = () => (
    <nav className="space-y-1">
      {nav.map((item) => {
        const Icon = item.icon;
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              onNav(item.key);
              setOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
              isActive
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-secondary/40">
      <aside className="hidden w-64 shrink-0 flex-col bg-navy-gradient p-5 text-primary-foreground lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <img src="/CCS logo.jpeg" alt="Career Consultation Services" className="h-11 w-11 rounded-md bg-card object-contain p-0.5" />
          <span className="font-display text-sm font-extrabold uppercase leading-tight tracking-tight">
            Career<br />Consultation
          </span>
        </Link>
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-primary-foreground/50">{subtitle}</p>
        <NavList />
        <div className="mt-auto border-t border-primary-foreground/15 pt-4">
          {email && <p className="mb-3 truncate px-3 text-xs text-primary-foreground/70">{email}</p>}
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Menu" onClick={() => setOpen(true)} className="rounded-md border border-border p-2 text-primary lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-extrabold uppercase tracking-tight text-primary">{title}</h1>
          </div>
          <Button size="sm" variant="outline" onClick={signOut} className="hidden gap-1.5 sm:inline-flex lg:hidden">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-navy-gradient p-5 text-primary-foreground">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-sm font-extrabold uppercase">{subtitle}</span>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList />
            <button type="button" onClick={signOut} className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-primary-foreground/75">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

export function Panel({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-border bg-card p-5 shadow-card sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-sm font-bold uppercase tracking-wide text-primary">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

export function Field({ label, children, span = 1 }: { label: string; children: ReactNode; span?: 1 | 2 }) {
  return (
    <label className={`block ${span === 2 ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
