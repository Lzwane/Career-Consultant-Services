import { Link, useNavigate } from "@tanstack/react-router";
import { 
  UploadCloud, 
  User, 
  LogOut, 
  Menu, 
  X, 
  MessageSquare, 
  Send,
  Phone,
  MessageCircle,
  CheckCircle2,
  Loader2,
  Sparkles
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function StudentShell({ 
  children, 
  userEmail, 
  activeTab = "overview",
  onTabChange 
}: { 
  children: ReactNode; 
  userEmail: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [sendingHelp, setSendingHelp] = useState(false);
  const [helpSubject, setHelpSubject] = useState("");
  const [helpMessage, setHelpMessage] = useState("");
  const [helpSent, setHelpSent] = useState(false);

  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" as any });
  };

  const handleSendHelpEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpMessage.trim()) {
      toast.error("Please enter a message before sending.");
      return;
    }

    setSendingHelp(true);
    const recipient = "sitholenathi817@gmail.com";
    const subject = encodeURIComponent(helpSubject || "Student Consultation Query");
    const body = encodeURIComponent(
      `Learner Email: ${userEmail}\nSubject: ${helpSubject || "Application Assistance"}\n\nMessage:\n${helpMessage}`
    );

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;

    setSendingHelp(false);
    setHelpSent(true);
    toast.success("Opening your mail client to send your message...");
    setTimeout(() => {
      setHelpSent(false);
      setHelpModalOpen(false);
      setHelpSubject("");
      setHelpMessage("");
    }, 2000);
  };

  const selectTab = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Top Learner Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to={"/dashboard" as any} className="flex items-center gap-3">
              <img
                src="/CCS logo.jpeg"
                alt="CCS Logo"
                className="h-10 w-10 rounded-md border border-slate-200 object-contain p-0.5"
              />
              <div>
                <span className="block font-display text-sm font-extrabold uppercase tracking-tight text-primary">
                  Learner Dashboard
                </span>
                <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  Career Consultant Services
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => selectTab("overview")}
              className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "overview" 
                  ? "bg-primary text-white" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-primary"
              }`}
            >
              Overview & Stats
            </button>

            <button
              onClick={() => selectTab("documents")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "documents" 
                  ? "bg-primary text-white" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-primary"
              }`}
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Submit Documents</span>
            </button>

            <button
              onClick={() => selectTab("personal")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "personal" 
                  ? "bg-primary text-white" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-primary"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Personal Info</span>
            </button>

            <button
              onClick={() => setHelpModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700 shadow-sm transition-colors hover:bg-emerald-100"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span>Consultant Help</span>
            </button>

            <div className="ml-2 flex items-center gap-3 border-l border-slate-200 pl-3">
              <span className="max-w-32.5 truncate text-xs text-slate-500 font-mono" title={userEmail}>
                {userEmail}
              </span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleSignOut}
                className="h-8 gap-1 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Exit</span>
              </Button>
            </div>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 md:hidden hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden space-y-2">
            <div className="text-xs font-mono text-slate-500 pb-1 border-b border-slate-100 truncate">
              User: {userEmail}
            </div>
            <button
              onClick={() => selectTab("overview")}
              className={`w-full text-left rounded-md px-3 py-2 text-xs font-bold uppercase ${
                activeTab === "overview" ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Overview & Stats
            </button>
            <button
              onClick={() => selectTab("documents")}
              className={`w-full text-left rounded-md px-3 py-2 text-xs font-bold uppercase ${
                activeTab === "documents" ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Submit Documents
            </button>
            <button
              onClick={() => selectTab("personal")}
              className={`w-full text-left rounded-md px-3 py-2 text-xs font-bold uppercase ${
                activeTab === "personal" ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Personal Info
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setHelpModalOpen(true);
              }}
              className="w-full text-left rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold uppercase text-emerald-700"
            >
              Consultant Help
            </button>
            <Button size="sm" variant="outline" onClick={handleSignOut} className="w-full text-rose-600 mt-2 text-xs">
              Sign Out
            </Button>
          </div>
        )}
      </header>

      {/* Main Content View */}
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      {/* Consultant Help Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              onClick={() => setHelpModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-primary">
                  Consultant Assistance
                </h3>
                <p className="text-xs text-slate-500">
                  Direct message link to our senior admissions advisors
                </p>
              </div>
            </div>

            {helpSent ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h4 className="mt-3 font-bold text-slate-900">Message Dispatched!</h4>
                <p className="mt-1 text-xs text-slate-500">
                  Your mail client has received your message draft.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <a
                    href="tel:+27695170424"
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 hover:bg-slate-100 transition-colors"
                  >
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Call Advisor</span>
                      <span className="font-semibold text-slate-800">+27 69 517 0424</span>
                    </div>
                  </a>
                  <a
                    href="https://wa.me/27695170424"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="block text-[10px] text-emerald-600 font-bold uppercase">WhatsApp</span>
                      <span className="font-semibold text-emerald-900">+27 69 517 0424</span>
                    </div>
                  </a>
                </div>

                <form onSubmit={handleSendHelpEmail} className="mt-4 space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={helpSubject}
                      onChange={(e) => setHelpSubject(e.target.value)}
                      placeholder="e.g. Question regarding Wits / SMU admissions"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2.5 text-xs text-slate-900 outline-none focus:border-primary focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={helpMessage}
                      onChange={(e) => setHelpMessage(e.target.value)}
                      placeholder="Write your question or request here..."
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2.5 text-xs text-slate-900 outline-none focus:border-primary focus:bg-white resize-none transition-all"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={sendingHelp} 
                    className="w-full gap-2 py-5 font-semibold uppercase tracking-wider"
                  >
                    {sendingHelp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>Send Message</span>
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}