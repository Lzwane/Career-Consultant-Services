import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { DOCUMENT_TYPES } from "@/lib/status";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit Your Documents | Career Consultation Services" },
      {
        name: "description",
        content:
          "Upload your ID, academic results, matric certificate and proof of payment securely so we can assess where you qualify.",
      },
      { property: "og:title", content: "Submit Your Documents" },
      {
        property: "og:description",
        content: "A secure form for learners to submit personal details and application documents.",
      },
    ],
  }),
  component: Submit,
});

const GRADES = ["Grade 11", "Grade 12 (Matric)", "Matriculated", "Upgrading results", "Other"];

const schema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(120),
  id_number: z
    .string()
    .trim()
    .min(6, "Please enter a valid ID number")
    .max(20, "ID number is too long"),
  phone: z.string().trim().min(8, "Please enter a contact number").max(20),
  email: z.string().trim().email("Enter a valid email address").max(255),
  grade_status: z.string().trim().min(1, "Please select your grade or status"),
  school: z.string().trim().max(150).optional(),
  province: z.string().trim().max(100).optional(),
  field_of_interest: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(1000).optional(),
});

function makeReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `CCS-${code}`;
}

function Submit() {
  const [values, setValues] = useState({
    full_name: "",
    id_number: "",
    phone: "",
    email: "",
    grade_status: "",
    school: "",
    province: "",
    field_of_interest: "",
    notes: "",
  });
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  function set(key: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    if (!files["id_copy"] || !files["academic_results"]) {
      toast.error("Please upload your ID copy and your academic results");
      return;
    }

    setBusy(true);
    try {
      const code = makeReference();
      const { data: application, error } = await supabase
        .from("applications")
        .insert({
          reference_code: code,
          full_name: parsed.data.full_name,
          id_number: parsed.data.id_number,
          phone: parsed.data.phone,
          email: parsed.data.email,
          grade_status: parsed.data.grade_status,
          school: parsed.data.school || null,
          province: parsed.data.province || null,
          field_of_interest: parsed.data.field_of_interest || null,
          notes: parsed.data.notes || null,
        })
        .select("id, reference_code")
        .single();

      if (error || !application) throw new Error(error?.message ?? "Could not save your details");

      for (const doc of DOCUMENT_TYPES) {
        const file = files[doc.key];
        if (!file) continue;
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${application.id}/${doc.key}-${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("learner-documents")
          .upload(path, file, { upsert: false });
        if (uploadError) throw new Error(`${doc.label}: ${uploadError.message}`);

        const { error: docError } = await supabase.from("application_documents").insert({
          application_id: application.id,
          doc_type: doc.label,
          file_name: file.name,
          file_path: path,
        });
        if (docError) throw new Error(docError.message);
      }

      setReference(application.reference_code);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (reference) {
    return (
      <SiteLayout>
        <div className="mx-auto w-full max-w-2xl px-4 py-16">
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h1 className="mt-4 font-display text-2xl font-extrabold uppercase text-primary">
              Submission received
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your documents are with our consultants. Keep your reference number safe — you need it,
              together with your ID number, to check your progress.
            </p>
            <p className="mt-6 rounded-lg bg-secondary px-4 py-4 font-display text-3xl font-extrabold tracking-widest text-primary">
              {reference}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/status">Check Your Status</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Back Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="bg-navy-gradient py-12 text-primary-foreground">
        <div className="mx-auto w-full max-w-3xl px-4">
          <h1 className="font-display text-3xl font-extrabold uppercase sm:text-4xl">
            Submit Your Documents
          </h1>
          <p className="mt-3 text-primary-foreground/85">
            Step 1: your details. Step 2: your documents. Step 3: submit — we take it from there.
          </p>
        </div>
      </section>

      <form onSubmit={onSubmit} className="mx-auto w-full max-w-3xl space-y-8 px-4 py-12">
        <fieldset className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
          <legend className="px-2 font-display text-sm font-bold uppercase tracking-widest text-accent">
            Step 1 — Your details
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="full_name">Full name *</Label>
              <Input
                id="full_name"
                value={values.full_name}
                maxLength={120}
                onChange={(e) => set("full_name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="id_number">ID number *</Label>
              <Input
                id="id_number"
                value={values.id_number}
                maxLength={20}
                onChange={(e) => set("id_number", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Contact number *</Label>
              <Input
                id="phone"
                value={values.phone}
                maxLength={20}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email address *</Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                maxLength={255}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="grade_status">Grade / status *</Label>
              <Select value={values.grade_status} onValueChange={(v) => set("grade_status", v)}>
                <SelectTrigger id="grade_status">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="school">School</Label>
              <Input
                id="school"
                value={values.school}
                maxLength={150}
                onChange={(e) => set("school", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="province">Province / town</Label>
              <Input
                id="province"
                value={values.province}
                maxLength={100}
                onChange={(e) => set("province", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="field_of_interest">What would you like to study?</Label>
              <Input
                id="field_of_interest"
                value={values.field_of_interest}
                maxLength={200}
                onChange={(e) => set("field_of_interest", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Anything else we should know?</Label>
            <Textarea
              id="notes"
              rows={4}
              maxLength={1000}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
          <legend className="px-2 font-display text-sm font-bold uppercase tracking-widest text-accent">
            Step 2 — Your documents
          </legend>
          <p className="text-sm text-muted-foreground">
            PDF or photo (JPG/PNG), up to 20&nbsp;MB per file. Your uploads are private and only visible to
            our staff.
          </p>
          {DOCUMENT_TYPES.map((doc) => (
            <div key={doc.key} className="rounded-lg border border-border p-4">
              <Label htmlFor={doc.key} className="flex flex-wrap items-center gap-2">
                <Upload className="h-4 w-4 shrink-0 text-accent" />
                {doc.label}
                {doc.required && <span className="text-xs uppercase text-accent">Required</span>}
              </Label>
              <Input
                id={doc.key}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                className="mt-2"
                onChange={(e) =>
                  setFiles((f) => ({ ...f, [doc.key]: e.target.files?.[0] ?? null }))
                }
              />
            </div>
          ))}
        </fieldset>

        <div className="rounded-xl border border-border bg-secondary p-6">
          <p className="text-sm text-muted-foreground">
            By submitting, you agree that Career Consultation Services may use these documents to apply to
            institutions on your behalf. Eligibility feedback is based on requirements available at the time
            of assessment; final admission decisions remain with the institution.
          </p>
          <Button type="submit" size="lg" className="mt-5 w-full" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {busy ? "Submitting…" : "Submit My Documents"}
          </Button>
        </div>
      </form>
    </SiteLayout>
  );
}
