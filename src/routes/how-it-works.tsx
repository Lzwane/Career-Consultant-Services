import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { DOCUMENT_TYPES, STATUS_LABELS, APPLICATION_STATUSES } from "@/lib/status";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works | Career Consultation Services" },
      {
        name: "description",
        content:
          "Five simple steps: submit your information, upload your documents, we assess your results, we identify institutions, and our consultants assist with your applications.",
      },
      { property: "og:title", content: "How It Works" },
      {
        property: "og:description",
        content: "The five steps from submitting your documents to your application being handled by us.",
      },
    ],
  }),
  component: HowItWorks,
});

const STEPS = [
  {
    title: "1. Create Your Account",
    text: "Register an account or sign in to get personal access to your application portal.",
  },
  {
    title: "2. Submit your information & upload documents",
    text: "Provide your details and attach your ID copy, academic results, matric certificate (if available), and proof of payment.",
  },
  {
    title: "3. We assess your results",
    text: "A consultant reviews your academic record in detail against current tertiary requirements.",
  },
  {
    title: "4. We identify institutions you may qualify for",
    text: "We identify universities, technology institutions, and TVET colleges matching your profile and share them with you.",
  },
  {
    title: "5. Our consultants assist with your applications",
    text: "We use your documents to complete and submit the applications, keeping you informed at every stage.",
  },
];

function HowItWorks() {
  return (
    <SiteLayout>
      <section className="bg-navy-gradient py-14 text-primary-foreground sm:py-20">
        <div className="mx-auto w-full max-w-4xl px-4 text-center sm:text-left">
          <h1 className="font-display text-3xl font-extrabold uppercase sm:text-4xl">How It Works</h1>
          <p className="mt-4 text-primary-foreground/85">From creating your account to a completed submission.</p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <ol className="space-y-2">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent font-display text-lg font-extrabold text-accent-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-bold text-primary">{step.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                  </div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="h-5 w-5 text-accent" />
                </div>
              )}
            </li>
          ))}
        </ol>

        <section className="mt-12">
          <h2 className="font-display text-xl font-extrabold uppercase text-primary">
            Documents you will need
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {DOCUMENT_TYPES.map((doc) => (
              <li key={doc.key} className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
                <span className="font-semibold text-primary">{doc.label}</span>
                {doc.required && <span className="ml-2 text-xs uppercase text-accent font-semibold">Required</span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-extrabold uppercase text-primary">
            Application statuses you may see
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {APPLICATION_STATUSES.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-primary"
              >
                {STATUS_LABELS[s]}
              </span>
            ))}
          </div>
        </section>

        <div className="mt-10">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/auth">Get Started / Sign In</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}