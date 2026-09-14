import { Link } from "@tanstack/react-router";
import { Menu, Mail, Phone, MessageCircle } from "lucide-react";
import { useState, type ReactNode } from "react";
import logo from "@/assets/ccs-logo.jpeg.asset.json";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/submit", label: "Submit Documents" },
  { to: "/status", label: "Check Status" },
  { to: "/contact", label: "Contact" },
] as const;

export const CONTACT = {
  phone: "+27 00 000 0000",
  whatsapp: "+27 00 000 0000",
  email: "info@careerconsultations.co.za",
};

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 lg:flex lg:justify-between">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={logo.url}
              alt="Career Consultation Services logo"
              width={48}
              height={48}
              className="h-11 w-11 shrink-0 rounded-md object-cover"
            />
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-extrabold uppercase tracking-tight text-primary">
                Career Consultation
              </span>
              <span className="block truncate text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Services
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                activeProps={{ className: "bg-secondary text-primary" }}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild size="sm" className="ml-2">
              <Link to="/submit">Submit Your Documents</Link>
            </Button>
          </nav>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-primary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {open && (
          <nav className="border-t border-border bg-card px-4 pb-4 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground"
                activeProps={{ className: "bg-secondary text-primary" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 bg-navy-gradient text-primary-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
          <div>
            <h3 className="font-display text-lg font-extrabold uppercase">Career Consultation Services</h3>
            <p className="mt-3 text-sm text-primary-foreground/80">
              Application support for learners: submit your results and documents, and our consultants
              assist with applications to tertiary institutions.
            </p>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-accent">Pages</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-primary-foreground/80 hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/auth" className="text-primary-foreground/60 hover:text-accent">
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-accent">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm text-primary-foreground/85">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-accent" /> {CONTACT.phone}
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 shrink-0 text-accent" /> WhatsApp {CONTACT.whatsapp}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-accent" /> {CONTACT.email}
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/15 px-4 py-4 text-center text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Career Consultation Services. Final admission decisions remain with
          the relevant institution.
        </div>
      </footer>
    </div>
  );
}
