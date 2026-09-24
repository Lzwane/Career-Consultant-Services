import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminShell, StatusPill } from "@/components/admin-shell";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { listApplications } from "@/lib/applications.functions";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Staff Dashboard | Career Consultation Services" }, { name: "robots", content: "noindex" }] }),
  component: AdminHome,
});

function AdminHome() {
  const fetchApplications = useServerFn(listApplications);
  const { data, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => fetchApplications(),
  });
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        r.reference_code.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q),
    );
  }, [data, search]);

  const counts = useMemo(() => {
    const list = data ?? [];
    return {
      total: list.length,
      newOnes: list.filter((r) => r.status === "documents_submitted").length,
      inProgress: list.filter((r) =>
        ["under_assessment", "institution_identified", "application_in_progress"].includes(r.status),
      ).length,
      successful: list.filter((r) => r.status === "successful").length,
    };
  }, [data]);

  return (
    <AdminShell>
      <h1 className="font-display text-2xl font-extrabold uppercase text-primary">Learner applications</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total", value: counts.total },
          { label: "Newly submitted", value: counts.newOnes },
          { label: "In progress", value: counts.inProgress },
          { label: "Successful", value: counts.successful },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-primary">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card shadow-card">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Search by name, reference or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading applications…
          </div>
        ) : rows.length === 0 ? (
          <p className="p-8 text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Learner</TableHead>
                  <TableHead className="hidden md:table-cell">Grade / status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Submitted</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs font-semibold">{r.reference_code}</TableCell>
                    <TableCell>
                      <span className="block font-semibold text-primary">{r.full_name}</span>
                      <span className="block text-xs text-muted-foreground">{r.email}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{r.grade_status}</TableCell>
                    <TableCell>
                      <StatusPill status={r.status as ApplicationStatus} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/admin/$id" params={{ id: r.id }}>
                          Open
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Statuses available: {Object.values(STATUS_LABELS).join(" · ")}
      </p>
    </AdminShell>
  );
}
