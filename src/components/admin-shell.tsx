import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, ShieldAlert, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import logo from "@/assets/ccs-logo.jpeg.asset.json";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getStaffAccess } from "@/lib/applications.functions";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/status";

export function StatusPill({ status }: { status: ApplicationStatus }) {
  const tone =
    status === "successful"
      ? "bg-success text-success-foreground"
      : status === "unsuccessful"
        ? "bg-destructive text-destructive-foreground"
        : status === "additional_documents_required"
          ? "bg-accent text-accent-foreground"
          : "bg-secondary text-primary";
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${tone}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchAccess = useServerFn(getStaffAccess);
  const { data: access, isLoading } = useQuery({
    queryKey: ["staff-access"],
    queryFn: () => fetchAccess(),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-navy-gradient text-primary-foreground">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:flex sm:justify-between">
          <Link to="/admin" className="flex min-w-0 items-center gap-3">
            <img
              src={logo.url}
              alt="Career Consultation Services logo"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-md object-cover"
            />
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-extrabold uppercase">
                Staff Dashboard
              </span>
              <span className="block truncate text-xs text-primary-foreground/70">
                Career Consultation Services
              </span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden text-primary-foreground hover:bg-primary-foreground/10 sm:inline-flex">
              <Link to="/">View website</Link>
            </Button>
            <Button
              onClick={signOut}
              size="sm"
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking your access…
          </div>
        ) : access?.isStaff ? (
          children
        ) : (
          <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-card">
            <ShieldAlert className="mx-auto h-10 w-10 text-accent" />
            <h1 className="mt-4 font-display text-xl font-extrabold uppercase text-primary">
              Access not approved yet
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your account exists but has not been given staff access. Ask an administrator at Career
              Consultation Services to approve it.
            </p>
            <Button onClick={signOut} className="mt-6" variant="outline">
              Sign out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
