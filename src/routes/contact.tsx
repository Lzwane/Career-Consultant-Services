import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteLayout, CONTACT } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Career Consultation Services" },
      {
        name: "description",
        content:
          "Call, WhatsApp or email Career Consultation Services for help with your tertiary application documents.",
      },
      { property: "og:title", content: "Contact Career Consultation Services" },
      { property: "og:description", content: "Phone, WhatsApp and email details, plus a contact form." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  message: z.string().trim().min(1, "Please enter a message").max(1000),
});

function Contact() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    const body = `Name: ${parsed.data.name}%0AEmail: ${parsed.data.email}%0A%0A${encodeURIComponent(
      parsed.data.message,
    )}`;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
      "Website enquiry",
    )}&body=${body}`;
  }

  return (
    <SiteLayout>
      <section className="bg-navy-gradient py-14 text-primary-foreground">
        <div className="mx-auto w-full max-w-4xl px-4">
          <h1 className="font-display text-3xl font-extrabold uppercase sm:text-4xl">Contact Us</h1>
          <p className="mt-4 text-primary-foreground/85">
            We are here to help with your application documents.
          </p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-12 md:grid-cols-2">
        <div className="space-y-4">
          <a
            href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 shadow-card"
          >
            <Phone className="h-5 w-5 shrink-0 text-accent" />
            <span>
              <span className="block text-xs uppercase text-muted-foreground">Phone</span>
              <span className="font-semibold text-primary">{CONTACT.phone}</span>
            </span>
          </a>
          <a
            href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 shadow-card"
          >
            <MessageCircle className="h-5 w-5 shrink-0 text-accent" />
            <span>
              <span className="block text-xs uppercase text-muted-foreground">WhatsApp</span>
              <span className="font-semibold text-primary">{CONTACT.whatsapp}</span>
            </span>
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 shadow-card"
          >
            <Mail className="h-5 w-5 shrink-0 text-accent" />
            <span className="min-w-0">
              <span className="block text-xs uppercase text-muted-foreground">Email</span>
              <span className="block truncate font-semibold text-primary">{CONTACT.email}</span>
            </span>
          </a>
          <p className="text-xs text-muted-foreground">
            These contact details are placeholders — send us the real phone number, WhatsApp number, email
            address and social media links and we will put them in.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
          <div>
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              value={values.name}
              maxLength={100}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={values.email}
              maxLength={255}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={6}
              maxLength={1000}
              value={values.message}
              onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
            />
          </div>
          <Button type="submit" className="w-full">
            Send Message
          </Button>
        </form>
      </div>
    </SiteLayout>
  );
}
