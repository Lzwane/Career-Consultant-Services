import { createFileRoute, Link } from "@tanstack/react-router";
import { FileUp, GraduationCap, Search, ShieldCheck, ClipboardList, Users } from "lucide-react";
import hero from "@/assets/hero-students.jpg";
import logo from "@/assets/ccs-logo.jpeg.asset.json";
import { SiteLayout, CONTACT } from "@/components/site-layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Career Consultation Services | Tertiary Application Support" },
      {
        name: "description",
        content:
          "Submit your results and documents. We assess where you qualify and our consultants assist with your applications to tertiary institutions.",
      },
      { property: "og:title", content: "Career Consultation Services" },
      {
        property: "og:description",
        content: "Submit your results. Know where you qualify. Let us assist with your application.",
      },
    ],
  }),
  component: Home,
});

const STEPS = [
  { icon: ClipboardList, title: "Submit your information", text: "Share your personal and school details." },
  { icon: FileUp, title: "Upload your documents", text: "ID, results, matric certificate, proof of payment." },
  { icon: Search, title: "We assess your results", text: "Our consultants review your academic record." },
  { icon: GraduationCap, title: "We identify institutions", text: "You see where you may qualify." },
  { icon: Users, title: "We assist with applications", text: "Our staff handle the application process." },
];

function Home() {
  return (
    <SiteLayout>
      <section className="bg-navy-gradient text-primary-foreground">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 md:py-20 lg:grid-cols-2">
          <div>
            <img
              src={logo.url}
              alt="Career Consultation Services logo"
              width={88}
              height={88}
              className="mb-6 h-20 w-20 rounded-lg object-cover"
            />
            <h1 className="font-display text-3xl font-extrabold uppercase leading-tight sm:text-4xl md:text-5xl">
              Submit your results. Know where you qualify.
            </h1>
            <p className="mt-5 max-w-xl text-base text-primary-foreground/85 sm:text-lg">
              Career Consultation Services helps learners find suitable tertiary study opportunities and
              completes the applications on their behalf, using the documents they submit here.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/submit">Submit Your Documents</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/status">Check Where You Qualify</Link>
              </Button>
            </div>
          </div>
          <img
            src={hero}
            alt="Graduates holding their National Senior Certificates outside a university"
            width={1600}
            height={1104}
            className="rounded-xl object-cover shadow-card"
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <h2 className="font-display text-2xl font-extrabold uppercase text-primary sm:text-3xl">
          What we do
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          We are an education and application support service. Learners send us their academic results and
          supporting documents, we work out which institutions and programmes they may qualify for, and our
          consultants use those documents to complete the relevant applications.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Secure document handling",
              text: "Your uploads are stored privately and are only accessible to our staff.",
            },
            {
              icon: Search,
              title: "Clear eligibility feedback",
              text: "You receive a list of institutions and programmes you may qualify for.",
            },
            {
              icon: Users,
              title: "Real people, no guesswork",
              text: "Consultants review your results and handle the applications for you.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <card.icon className="h-8 w-8 text-accent" />
              <h3 className="mt-4 font-display text-lg font-bold text-primary">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-14">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h2 className="font-display text-2xl font-extrabold uppercase text-primary sm:text-3xl">
            How the process works
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-xl border border-border bg-card p-5">
                <span className="font-display text-3xl font-extrabold text-accent">{i + 1}</span>
                <step.icon className="mt-2 h-6 w-6 text-primary" />
                <h3 className="mt-3 font-display text-sm font-bold uppercase text-primary">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link to="/submit">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="rounded-xl border border-border bg-card p-8 shadow-card">
          <h2 className="font-display text-xl font-extrabold uppercase text-primary">Talk to us</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Phone {CONTACT.phone} · WhatsApp {CONTACT.whatsapp} · {CONTACT.email}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
