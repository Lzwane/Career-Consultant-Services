import { Link, useNavigate } from "@tanstack/react-router";
import { 
  Users, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap, 
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/status";

export function StatusPill({ status }: { status: ApplicationStatus | string }) {
  const label = STATUS_LABELS[status as ApplicationStatus] || status.replace(/_/g, " ");
  
  let color = "bg-slate-100 text-slate-700 border-slate-200";
  if (status === "documents_submitted") color = "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "under_assessment") color = "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "institution_identified") color = "bg-purple-50 text-purple-700 border-purple-200";
  if (status === "application_in_progress") color = "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (status === "successful") color = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "unsuccessful") color = "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border uppercase ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" as any });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100/70 text-slate-900 font-sans antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-3">
              <img
                src="/CCS logo.jpeg"
                alt="CCS Logo"
                className="h-10 w-10 rounded-lg border border-slate-200 object-contain p-0.5 shadow-sm"
              />
              <div>
                <span className="block font-display text-sm font-black uppercase tracking-tight text-primary">
                  Staff Command Center
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Career Consultant Services
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Right */}
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Admin Verified</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleSignOut}
              className="gap-1.5 rounded-full border-slate-300 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 sm:hidden hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-3 sm:hidden space-y-2">
            <div className="text-xs font-semibold text-slate-500">
              Logged in as Senior Admissions Consultant
            </div>
            <Button size="sm" variant="outline" onClick={handleSignOut} className="w-full text-rose-600 text-xs">
              Sign Out
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}