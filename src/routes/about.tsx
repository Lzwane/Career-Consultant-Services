import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Career Consultation Services" },
      {
        name: "description",
        content:
          "Career Consultation Services assists learners with identifying tertiary study opportunities and completing applications to institutions.",
      },
      { property: "og:title", content: "About Career Consultation Services" },
      {
        property: "og:description",
        content: "Who we are and how we assist learners with tertiary applications.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="bg-navy-gradient py-14 text-primary-foreground sm:py-20">
        <div className="mx-auto w-full max-w-4xl px-4 text-center sm:text-left">
          <h1 className="font-display text-3xl font-extrabold uppercase sm:text-4xl">About Us</h1>
          <p className="mt-4 text-primary-foreground/85">
            Career Consultation Services is an education and application support business.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-4xl space-y-10 px-4 py-12">
        <section>
          <h2 className="font-display text-xl font-extrabold uppercase text-primary">Who we are</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            We assist learners with identifying suitable tertiary education opportunities and completing
            applications to institutions. Many learners miss out on study opportunities simply because the
            application process is confusing, scattered across many institutions, and easy to get wrong. We
            take that burden off them.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-extrabold uppercase text-primary">What we do</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Receive learners' academic results and supporting documents securely through our portal.</li>
            <li>Assess those results against the requirements available at the time of assessment.</li>
            <li>Identify institutions and programmes the learner may qualify for.</li>
            <li>Use the submitted documents to complete the relevant applications.</li>
            <li>Track each application and keep the learner updated on progress.</li>
          </ul>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-extrabold uppercase text-primary">Our mission</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              To make the tertiary application process simple and accessible for every learner, regardless of
              where they live or what resources they have.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-extrabold uppercase text-primary">Our vision</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              A country where no learner loses a place at an institution because of paperwork, deadlines or a
              lack of guidance on where they qualify.
            </p>
          </div>
        </section>

        <p className="rounded-lg border border-border bg-secondary p-4 text-sm text-muted-foreground">
          Please note: eligibility information we provide is based on the requirements available at the time
          of assessment. Final admission decisions remain with the relevant institution.
        </p>

        <div className="pt-2">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/auth">Get Started / Sign In</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}