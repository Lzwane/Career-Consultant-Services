import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  UploadCloud, 
  CheckCircle2, 
  Building2, 
  FileText, 
  User, 
  ExternalLink, 
  Save, 
  Clock,
  GraduationCap
} from "lucide-react";
import { StudentShell } from "@/components/student-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/status";

// @ts-ignore
export const Route = createFileRoute('/dashboard')({
  head: () => ({
    meta: [{ title: "Student Dashboard | Career Consultant Services" }],
  }),
  component: StudentDashboard,
});

export function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Application Data
  const [application, setApplication] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [eligibility, setEligibility] = useState<any[]>([]);

  // Personal Info Form State
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [gradeStatus, setGradeStatus] = useState("Grade 12 (Matric)");
  const [school, setSchool] = useState("");
  const [province, setProvince] = useState("");
  const [fieldOfInterest, setFieldOfInterest] = useState("");
  const [notes, setNotes] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);

  // File Upload State
  const [uploading, setUploading] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/auth" as any });
      } else {
        setUser(session.user);
        loadStudentData(session.user.email || "");
      }
    });
  }, []);

  function makeReference() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return `CCS-${code}`;
  }

  const loadStudentData = async (email: string) => {
    setLoading(true);
    try {
      const { data: apps, error } = await (supabase.from("applications") as any)
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && apps && apps.length > 0) {
        const app = apps[0];
        setApplication(app);
        setFullName(app.full_name || "");
        setIdNumber(app.id_number || "");
        setPhone(app.phone || "");
        setGradeStatus(app.grade_status || "Grade 12 (Matric)");
        setSchool(app.school || "");
        setProvince(app.province || "");
        setFieldOfInterest(app.field_of_interest || "");
        setNotes(app.notes || "");

        // Load documents
        const { data: docs } = await (supabase.from("application_documents") as any)
          .select("*")
          .eq("application_id", app.id);
        setDocuments(docs || []);

        // Load eligibility results
        const { data: elig } = await (supabase.from("eligibility_results") as any)
          .select("*")
          .eq("application_id", app.id);
        setEligibility(elig || []);
      }
    } catch (err) {
      console.error("Error loading learner profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingInfo(true);

    try {
      if (application) {
        const { error } = await (supabase.from("applications") as any)
          .update({
            full_name: fullName,
            id_number: idNumber,
            phone,
            grade_status: gradeStatus,
            school: school || null,
            province: province || null,
            field_of_interest: fieldOfInterest || null,
            notes: notes || null,
          })
          .eq("id", application.id);

        if (error) throw error;
        toast.success("Personal details updated and saved permanently.");
      } else {
        const newRef = makeReference();
        const { data, error } = await (supabase.from("applications") as any)
          .insert([{
            reference_code: newRef,
            full_name: fullName,
            id_number: idNumber,
            phone,
            email: user.email,
            grade_status: gradeStatus,
            school: school || null,
            province: province || null,
            field_of_interest: fieldOfInterest || null,
            notes: notes || null,
            status: "documents_submitted",
          }])
          .select()
          .single();

        if (error) throw error;
        setApplication(data);
        toast.success("Profile initialized! You can now upload your documents.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save information.");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docKey: string, docLabel: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!application) {
      toast.error("Please fill in and save your Personal Information first before uploading.");
      setActiveTab("personal");
      return;
    }

    setUploading(docKey);

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${application.id}/${docKey}-${Date.now()}-${safeName}`;

      // 1. Upload to bucket 'learner-documents'
      const { error: uploadError } = await (supabase.storage as any)
        .from("learner-documents")
        .upload(storagePath, file, { upsert: true });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // 2. Obtain download URL
      const { data } = (supabase.storage as any)
        .from("learner-documents")
        .getPublicUrl(storagePath);

      const publicUrl = data?.publicUrl || storagePath;

      // 3. Save into application_documents
      const { error: docError } = await (supabase.from("application_documents") as any).insert([{
        application_id: application.id,
        doc_type: docLabel,
        file_name: file.name,
        file_path: publicUrl,
      }]);

      if (docError) throw docError;

      toast.success(`${docLabel} uploaded successfully!`);

      // 4. Refresh documents list immediately
      const { data: updatedDocs } = await (supabase.from("application_documents") as any)
        .select("*")
        .eq("application_id", application.id);
      setDocuments(updatedDocs || []);
    } catch (err: any) {
      toast.error("Upload error: " + (err.message || "Failed to upload document."));
    } finally {
      setUploading(null);
    }
  };

  const getDoc = (label: string) => documents?.find((d) => d?.doc_type === label);

  const documentChecklist = [
    { key: "id_copy", label: "Copy of ID or Birth Certificate", required: true },
    { key: "academic_results", label: "Academic Results (Grade 11 / Latest Term)", required: true },
    { key: "matric_certificate", label: "Matric Certificate (If finished school)", required: false },
    { key: "proof_of_payment", label: "Proof of Payment", required: true },
    { key: "other", label: "Other Supporting Documents", required: false },
  ];

  return (
    <StudentShell 
      userEmail={user?.email || ""} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
    >
      <div className="space-y-8">
        {/* Banner */}
        <div className="rounded-2xl bg-navy-gradient p-6 text-white shadow-md sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="rounded-full bg-accent/20 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-accent">
                Learner Profile & Submissions
              </span>
              <h1 className="mt-2 font-display text-2xl font-bold uppercase sm:text-3xl">
                {application?.full_name ? `Welcome, ${application.full_name}` : "Student Portal"}
              </h1>
              <p className="mt-1 text-xs text-slate-200">
                Manage your academic files, check qualification matches, and view feedback from your assigned consultant.
              </p>
            </div>

            {application && (
              <div className="rounded-xl border border-white/20 bg-white/10 p-3.5 text-center backdrop-blur-sm">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  Your Reference
                </span>
                <span className="font-mono text-xl font-extrabold tracking-wider text-accent">
                  {application.reference_code}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Documents Uploaded
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-primary">{documents.length}</span>
              <span className="text-xs text-slate-500">files securely stored</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Application Status
            </span>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold uppercase text-slate-800">
                {application?.status 
                  ? STATUS_LABELS[application.status as ApplicationStatus] || application.status.replace(/_/g, " ") 
                  : "Awaiting Details"}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Identified Institutions
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-accent">{eligibility.length}</span>
              <span className="text-xs text-slate-500">qualifying programmes</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Academic Level
            </span>
            <div className="mt-2 text-sm font-bold text-slate-800">
              {application?.grade_status || "Not Specified"}
            </div>
          </div>
        </div>

        {/* Tabs: Overview, Documents, Personal Info */}
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-500 font-mono">
            Loading your profile and documents...
          </div>
        ) : (
          <div>
            {/* 1. OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-1">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Application Progress
                    </h2>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Personal Information</p>
                          <p className="text-[11px] text-slate-500">
                            {application ? "Saved and recorded permanently" : "Pending completion"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {documents.length >= 2 ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-500" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900">Document Uploads</p>
                          <p className="text-[11px] text-slate-500">
                            {documents.length} document(s) on file
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {eligibility.length > 0 ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-slate-400" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900">Consultant Assessment</p>
                          <p className="text-[11px] text-slate-500">
                            {eligibility.length > 0 
                              ? `${eligibility.length} programmes matched` 
                              : "Review in progress"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                      <Button onClick={() => setActiveTab("documents")} size="sm" variant="default" className="w-full">
                        Upload More Documents
                      </Button>
                      <Button onClick={() => setActiveTab("personal")} size="sm" variant="outline" className="w-full">
                        Edit Personal Details
                      </Button>
                    </div>
                  </div>

                  {application?.notes && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Notes from Your Submission
                      </span>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {application.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 space-y-6">
                  {/* Qualifying Institutions Box */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <h2 className="font-display text-base font-bold uppercase text-primary">
                          Qualifying Institutions & Programmes
                        </h2>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                        {eligibility.length} Available
                      </span>
                    </div>

                    {eligibility.length === 0 ? (
                      <div className="py-10 text-center">
                        <Building2 className="mx-auto h-10 w-10 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          Your academic results are under consultant review
                        </p>
                        <p className="mx-auto mt-1 max-w-md text-xs text-slate-400">
                          Once our staff finish assessing your marks against tertiary requirements, 
                          the institutions and qualification options will be listed right here.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {eligibility.map((row: any, i: number) => (
                          <div key={i} className="rounded-xl border border-slate-200 p-4 transition-all hover:border-primary/40">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="font-bold text-slate-900 text-sm">{row.institution}</h3>
                              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                row.meets_requirements 
                                  ? "bg-emerald-100 text-emerald-800" 
                                  : "bg-slate-100 text-slate-600"
                              }`}>
                                {row.meets_requirements ? "Meets Requirements" : "Alternative Option"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs font-semibold text-primary">{row.programme}</p>
                            {row.requirements && (
                              <p className="mt-1 text-xs text-slate-500">Requirements: {row.requirements}</p>
                            )}
                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                              <span>Application Stage: <strong className="text-slate-700">{row.application_status}</strong></span>
                              {row.notes && <span>{row.notes}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. SUBMIT DOCUMENTS TAB */}
            {activeTab === "documents" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold uppercase text-primary">
                      Submit Your Documents
                    </h2>
                    <p className="text-xs text-slate-500">
                      Upload clear scans (PDF, JPG, or PNG up to 20MB). Your files are securely encrypted.
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab("overview")} variant="outline" size="sm">
                    Back to Overview
                  </Button>
                </div>

                <div className="space-y-4">
                  {documentChecklist.map((item) => {
                    const uploaded = getDoc(item.label);
                    return (
                      <div
                        key={item.key}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 transition-all hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-800">{item.label}</span>
                            {item.required && (
                              <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 uppercase">
                                Required
                              </span>
                            )}
                          </div>
                          
                          {uploaded ? (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                Document Uploaded
                              </span>
                              <span className="text-xs text-slate-500 truncate max-w-[200px]">({uploaded.file_name})</span>
                              <a
                                href={uploaded.file_path}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline"
                              >
                                View
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-slate-400">No document uploaded yet.</p>
                          )}
                        </div>

                        <div>
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100">
                            <UploadCloud className="h-4 w-4 text-primary" />
                            <span>
                              {uploading === item.key 
                                ? "Uploading..." 
                                : uploaded 
                                ? "Replace Document" 
                                : "Upload File"}
                            </span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.webp"
                              disabled={uploading === item.key}
                              onChange={(e) => handleFileUpload(e, item.key, item.label)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. PERSONAL INFORMATION TAB */}
            {activeTab === "personal" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 max-w-3xl">
                <div className="mb-6 border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold uppercase text-primary">
                      Personal & Academic Information
                    </h2>
                    <p className="text-xs text-slate-500">
                      Your details are saved permanently so our consultants can reach out with application updates.
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab("overview")} variant="outline" size="sm">
                    Back to Overview
                  </Button>
                </div>

                <form onSubmit={handleSavePersonalInfo} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Lethabo Clement Zwane"
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                        National ID Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder="ID or Passport Number"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                        Contact / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+27 00 000 0000"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                        Academic Level / Status *
                      </label>
                      <select
                        value={gradeStatus}
                        onChange={(e) => setGradeStatus(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 bg-white outline-none focus:border-primary"
                      >
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12 (Matric)">Grade 12 (Matric)</option>
                        <option value="Matriculated">Matriculated</option>
                        <option value="Upgrading results">Upgrading Results</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                        School Name
                      </label>
                      <input
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="High School attended"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                        Province / Town
                      </label>
                      <input
                        type="text"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        placeholder="e.g. Gauteng, Pretoria"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                        What Would You Like to Study?
                      </label>
                      <input
                        type="text"
                        value={fieldOfInterest}
                        onChange={(e) => setFieldOfInterest(e.target.value)}
                        placeholder="e.g. Computer Science, Nursing, Engineering"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                      Anything Else We Should Know?
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional details about your qualifications or institution choices..."
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <Button type="submit" disabled={savingInfo} className="w-full gap-2">
                    <Save className="h-4 w-4" />
                    <span>{savingInfo ? "Saving Details..." : "Save Information Permanently"}</span>
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </StudentShell>
  );
}