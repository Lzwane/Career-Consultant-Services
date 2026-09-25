import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Phone, 
  MessageCircle, 
  Mail, 
  GraduationCap, 
  FileCheck2, 
  X, 
  Save, 
  Plus, 
  Trash2,
  Calendar,
  Building2,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { AdminShell, StatusPill } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/status";

export const Route = createFileRoute('/_authenticated/admin/')({
  head: () => ({
    meta: [{ title: "Staff Command Center | Career Consultant Services" }],
  }),
  component: AdminDashboard,
});

// Benchmark South African Prospectus Database
const UNIVERSITY_PROSPECTUS = [
  {
    institution: "University of the Witwatersrand (Wits)",
    program: "BSc Computer Science",
    requirements: "APS 42+ | Mathematics Level 6 (70%), English Level 5 (60%)",
    category: "Science & IT",
  },
  {
    institution: "University of Pretoria (UP)",
    program: "BSc Information Technology",
    requirements: "APS 34+ | Mathematics Level 5 (60%), English Level 5",
    category: "Science & IT",
  },
  {
    institution: "Sefako Makgatho Health Sciences University (SMU)",
    program: "Bachelor of Nursing / Pharmacy",
    requirements: "APS 32+ | Life Sciences Level 5, Physical Science Level 5, Mathematics Level 4",
    category: "Health Sciences",
  },
  {
    institution: "University of Johannesburg (UJ)",
    program: "BCom Accounting / Business Management",
    requirements: "APS 30+ | English 4 (50%), Mathematics 4 (50%) or Math Lit 6 (70%)",
    category: "Commerce",
  },
  {
    institution: "Tshwane University of Technology (TUT)",
    program: "National Diploma: Software Development",
    requirements: "APS 26+ | English Level 4, Mathematics Level 4 or Technical Maths Level 5",
    category: "Science & IT",
  },
  {
    institution: "Tshwane North TVET College (TNC)",
    program: "National Certificate (Vocational): Engineering Studies / IT",
    requirements: "Grade 9 / 11 / 12 pass with English and Mathematics or Math Literacy",
    category: "Vocational & TVET",
  },
  {
    institution: "University of South Africa (UNISA)",
    program: "Bachelor of Arts in Law / Applied Psychology",
    requirements: "APS 24+ | National Senior Certificate with Bachelor Degree endorsement",
    category: "Humanities & Law",
  },
];

export function AdminDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Selected Profile for the Full Profile Inspector Drawer
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [appDocuments, setAppDocuments] = useState<any[]>([]);
  const [appEligibility, setAppEligibility] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Editing controls in detail view
  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus>("documents_submitted");
  const [staffNote, setStaffNote] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  // Manual Programme Adder
  const [customInst, setCustomInst] = useState("");
  const [customProg, setCustomProg] = useState("");
  const [customReqs, setCustomReqs] = useState("");

  useEffect(() => {
    loadAllApplications();
  }, []);

  const loadAllApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase.from("applications") as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err: any) {
      toast.error("Failed to load applications: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfile = async (app: any) => {
    setSelectedApp(app);
    setCurrentStatus(app.status);
    setStaffNote(app.notes || "");
    setLoadingDetails(true);

    try {
      const [docsRes, eligRes] = await Promise.all([
        (supabase.from("application_documents") as any).select("*").eq("application_id", app.id),
        (supabase.from("eligibility_results") as any).select("*").eq("application_id", app.id),
      ]);

      setAppDocuments(docsRes.data || []);
      setAppEligibility(eligRes.data || []);
    } catch (err: any) {
      toast.error("Error fetching applicant records: " + err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveStatus = async () => {
    if (!selectedApp) return;
    setSavingStatus(true);
    try {
      const { error } = await (supabase.from("applications") as any)
        .update({
          status: currentStatus,
          notes: staffNote,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedApp.id);

      if (error) throw error;

      toast.success("Application status updated.");
      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, status: currentStatus, notes: staffNote } : a))
      );
      setSelectedApp((prev: any) => ({ ...prev, status: currentStatus, notes: staffNote }));
    } catch (err: any) {
      toast.error("Failed to update record: " + err.message);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAssignProspectusMatch = async (match: typeof UNIVERSITY_PROSPECTUS[0]) => {
    if (!selectedApp) return;

    try {
      const { data, error } = await (supabase.from("eligibility_results") as any)
        .insert([{
          application_id: selectedApp.id,
          institution: match.institution,
          programme: match.program,
          requirements: match.requirements,
          meets_requirements: true,
          application_status: "Qualified — Ready to Apply",
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success(`Assigned ${match.program} at ${match.institution}`);
      setAppEligibility((prev) => [...prev, data]);
    } catch (err: any) {
      toast.error("Error assigning match: " + err.message);
    }
  };

  const handleAddCustomQualification = async () => {
    if (!selectedApp || !customInst.trim() || !customProg.trim()) {
      toast.error("Please provide both an institution and programme title.");
      return;
    }

    try {
      const { data, error } = await (supabase.from("eligibility_results") as any)
        .insert([{
          application_id: selectedApp.id,
          institution: customInst.trim(),
          programme: customProg.trim(),
          requirements: customReqs.trim() || null,
          meets_requirements: true,
          application_status: "Assessment Complete",
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Qualification match added.");
      setAppEligibility((prev) => [...prev, data]);
      setCustomInst("");
      setCustomProg("");
      setCustomReqs("");
    } catch (err: any) {
      toast.error("Failed to add qualification: " + err.message);
    }
  };

  const handleDeleteQualification = async (eligId: string) => {
    try {
      const { error } = await (supabase.from("eligibility_results") as any)
        .delete()
        .eq("id", eligId);

      if (error) throw error;
      setAppEligibility((prev) => prev.filter((item) => item.id !== eligId));
      toast.success("Programme removed.");
    } catch (err: any) {
      toast.error("Could not remove: " + err.message);
    }
  };

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        app.full_name?.toLowerCase().includes(q) ||
        app.email?.toLowerCase().includes(q) ||
        app.reference_code?.toLowerCase().includes(q) ||
        app.id_number?.toLowerCase().includes(q);

      const matchesStatus = filterStatus === "all" || app.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [applications, search, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((a) => a.status === "documents_submitted").length,
      assessment: applications.filter((a) => a.status === "under_assessment").length,
      completed: applications.filter((a) => ["successful", "institution_identified"].includes(a.status)).length,
    };
  }, [applications]);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Top Control Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-2xl font-black uppercase tracking-tight text-primary sm:text-3xl">
              Learner Application Management
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Review submissions, match academic profiles with institutional requirements, and monitor applications.
            </p>
          </div>

          <Button onClick={loadAllApplications} variant="outline" size="sm" className="w-full md:w-auto text-xs">
            Refresh Records
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Applicants</span>
            <div className="mt-1 text-2xl font-black text-slate-900">{stats.total}</div>
          </div>
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Needs Review</span>
            <div className="mt-1 text-2xl font-black text-amber-900">{stats.pending}</div>
          </div>
          <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">In Assessment</span>
            <div className="mt-1 text-2xl font-black text-blue-900">{stats.assessment}</div>
          </div>
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Matched / Qualified</span>
            <div className="mt-1 text-2xl font-black text-emerald-900">{stats.completed}</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID number, reference, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All" },
              { id: "documents_submitted", label: "New" },
              { id: "under_assessment", label: "Assessing" },
              { id: "institution_identified", label: "Matched" },
              { id: "application_in_progress", label: "Applying" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  filterStatus === tab.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Applicant Table / Cards */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-slate-400">Loading student directory...</div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-700">No applicants found</p>
              <p className="text-xs text-slate-400">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/75 uppercase tracking-wider text-slate-400 font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Reference</th>
                    <th className="px-5 py-3.5">Learner Details</th>
                    <th className="px-5 py-3.5">Current Standing</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => handleOpenProfile(app)}
                      className="cursor-pointer transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4 font-mono font-bold text-primary">{app.reference_code}</td>
                      <td className="px-5 py-4">
                        <span className="block font-bold text-slate-900 text-sm">{app.full_name}</span>
                        <span className="block text-slate-400 text-[11px]">{app.email} · {app.phone}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-700">{app.grade_status}</span>
                        {app.school && <span className="block text-slate-400 text-[11px]">{app.school}</span>}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill status={app.status} />
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProfile(app);
                          }}
                          className="h-8 gap-1.5 rounded-lg border-slate-300 text-xs font-semibold text-primary hover:bg-primary hover:text-white"
                        >
                          <span>Full Profile</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Profile Details & Matching Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                  {selectedApp.full_name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">{selectedApp.full_name}</h2>
                  <p className="text-xs font-mono text-slate-400">Reference: {selectedApp.reference_code}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="p-16 text-center text-xs font-mono text-slate-400">Loading student dossier...</div>
            ) : (
              <div className="space-y-6 p-6">
                {/* Contact & Bio Card */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Applicant Information
                  </span>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">ID Number:</span>
                      <strong className="text-slate-800">{selectedApp.id_number}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Grade / Level:</span>
                      <strong className="text-slate-800">{selectedApp.grade_status}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">School / Town:</span>
                      <strong className="text-slate-800">{selectedApp.school || "Not specified"} ({selectedApp.province || "N/A"})</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Field of Interest:</span>
                      <strong className="text-primary">{selectedApp.field_of_interest || "General Tertiary"}</strong>
                    </div>
                  </div>

                  {/* Direct Contact Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                    <a
                      href={`tel:${selectedApp.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      <span>{selectedApp.phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/${selectedApp.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`mailto:${selectedApp.email}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      <span>{selectedApp.email}</span>
                    </a>
                  </div>
                </div>

                {/* Uploaded Documents Review */}
                <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Uploaded Documents ({appDocuments.length})
                    </span>
                  </div>

                  {appDocuments.length === 0 ? (
                    <p className="text-xs text-slate-400">No documents submitted yet by learner.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {appDocuments.map((doc) => (
                        <div key={doc.id} className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between text-xs shadow-sm">
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-slate-800 block truncate">{doc.doc_type}</span>
                            <span className="text-slate-400 text-[11px] block truncate">{doc.file_name}</span>
                          </div>
                          <a
                            href={doc.file_path}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* University Prospectus Matching Recommendation Engine */}
                <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <h3 className="font-display text-sm font-bold uppercase tracking-tight text-primary">
                        Prospectus Requirement Matching Engine
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Matches based on standard admission requirements for major public institutions:
                  </p>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {UNIVERSITY_PROSPECTUS.map((match, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-100/80 transition-colors"
                      >
                        <div>
                          <strong className="text-slate-900 block">{match.institution}</strong>
                          <span className="text-primary font-semibold">{match.program}</span>
                          <span className="block text-[11px] text-slate-500">{match.requirements}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAssignProspectusMatch(match)}
                          className="h-7 shrink-0 text-[11px] font-semibold gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Assign Match</span>
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Already Assigned Programmes */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Active Matches for this Learner ({appEligibility.length})
                    </span>

                    {appEligibility.length === 0 ? (
                      <p className="text-xs text-slate-400">No programmes matched yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {appEligibility.map((el) => (
                          <div key={el.id} className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 text-xs flex items-center justify-between">
                            <div>
                              <strong className="text-emerald-950 block">{el.institution}</strong>
                              <span className="text-emerald-800 font-semibold">{el.programme}</span>
                              {el.requirements && (
                                <span className="text-emerald-700/80 text-[11px] block">{el.requirements}</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteQualification(el.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Manual Qualification Input */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Add Custom Programme Match
                    </span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Institution name..."
                        value={customInst}
                        onChange={(e) => setCustomInst(e.target.value)}
                        className="rounded-lg border border-slate-200 p-2 text-xs text-slate-900 outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="Degree / Diploma title..."
                        value={customProg}
                        onChange={(e) => setCustomProg(e.target.value)}
                        className="rounded-lg border border-slate-200 p-2 text-xs text-slate-900 outline-none focus:border-primary"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Admission requirements / APS criteria..."
                      value={customReqs}
                      onChange={(e) => setCustomReqs(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 outline-none focus:border-primary"
                    />
                    <Button onClick={handleAddCustomQualification} size="sm" variant="outline" className="w-full text-xs">
                      Record Custom Match
                    </Button>
                  </div>
                </div>

                {/* Status Update & Consultant Internal Notes */}
                <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Update Application Status & Internal Notes
                  </span>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value as ApplicationStatus)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-primary"
                    >
                      {Object.entries(STATUS_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Notes for Student / Team</label>
                    <textarea
                      rows={3}
                      value={staffNote}
                      onChange={(e) => setStaffNote(e.target.value)}
                      placeholder="Add assessment remarks or missing document notices..."
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleSaveStatus}
                    disabled={savingStatus}
                    className="w-full gap-2 py-5 font-semibold uppercase tracking-wider"
                  >
                    <Save className="h-4 w-4" />
                    <span>{savingStatus ? "Saving..." : "Save Record Updates"}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}