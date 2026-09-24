import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lookupApplication } from "@/lib/applications.functions";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/status";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Check Where You Qualify | Career Consultation Services" },
      {
        name: "description",
        content:
          "Enter your reference number and ID number to see your application status and the institutions you may qualify for.",
      },
      { property: "og:title", content: "Application Status & Eligibility" },
      {
        property: "og:description",
        content: "Track your application progress and view the institutions you may qualify for.",
      },
    ],
  }),
  component: Status,
});

type Result = Awaited<ReturnType<typeof lookupApplication>>;

function Status() {
  const lookup = useServerFn(lookupApplication);
  const [reference, setReference] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await lookup({ data: { reference, idNumber } });
      setResult(res);
      if (!res.found) toast.error("We could not find an application with those details.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="bg-navy-gradient py-12 text-primary-foreground">
        <div className="mx-auto w-full max-w-3xl px-4">
          <h1 className="font-display text-3xl font-extrabold uppercase sm:text-4xl">
            Check Where You Qualify
          </h1>
          <p className="mt-3 text-primary-foreground/85">
            Use the reference number you received when you submitted your documents.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <form
          onSubmit={onSubmit}
          className="grid gap-4 rounded-xl border border-border bg-card p-6 shadow-card sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <div>
            <Label htmlFor="reference">Reference number</Label>
            <Input
              id="reference"
              placeholder="CCS-XXXXXX"
              value={reference}
              maxLength={20}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="idNumber">ID number</Label>
            <Input
              id="idNumber"
              value={idNumber}
              maxLength={20}
              onChange={(e) => setIdNumber(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="ml-2">Check</span>
          </Button>
        </form>

        {result?.found && (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-extrabold uppercase text-primary">
                {result.application.full_name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Reference {result.application.reference_code} · {result.documents.length} document(s)
                received
              </p>
              <span className="mt-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground">
                {STATUS_LABELS[result.application.status as ApplicationStatus]}
              </span>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-extrabold uppercase text-primary">
                Where you may qualify
              </h2>
              {result.eligibility.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Your results are still being assessed. Once a consultant has reviewed them, the
                  institutions and programmes you may qualify for will appear here.
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {result.eligibility.map((row, i) => (
                    <li key={i} className="rounded-lg border border-border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-display font-bold text-primary">{row.institution}</h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            row.meets_requirements
                              ? "bg-success text-success-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {row.meets_requirements ? "Meets requirements" : "Does not meet requirements"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-foreground">{row.programme}</p>
                      {row.requirements && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Requirements: {row.requirements}
                        </p>
                      )}
                      <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                        Application: {row.application_status}
                      </p>
                      {row.notes && <p className="mt-2 text-sm text-muted-foreground">{row.notes}</p>}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                Eligibility information is based on the requirements available at the time of assessment.
                Final admission decisions remain with the relevant institution.
              </p>
            </div>

            {result.updates.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-display text-lg font-extrabold uppercase text-primary">
                  Updates from our team
                </h2>
                <ul className="mt-4 space-y-3">
                  {result.updates.map((u, i) => (
                    <li key={i} className="rounded-lg bg-secondary p-4">
                      <p className="text-sm text-foreground">{u.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleString()}
                        {u.status ? ` · ${STATUS_LABELS[u.status as ApplicationStatus]}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {result && !result.found && (
          <p className="mt-8 rounded-lg border border-border bg-secondary p-4 text-sm text-muted-foreground">
            No application matched that reference number and ID number. Please check both and try again, or
            contact us for help.
          </p>
        )}
      </div>
    </SiteLayout>
  );
}
