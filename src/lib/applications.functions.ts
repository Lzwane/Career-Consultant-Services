import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ApplicationStatus } from "@/lib/status";

/** Staff: is the signed-in user allowed into the admin area? */
export const getStaffAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roles = (data ?? []).map((r) => r.role);
    return { isStaff: roles.length > 0, isAdmin: roles.includes("admin"), roles };
  });

export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("applications")
      .select("id, reference_code, full_name, email, phone, grade_status, status, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input.id) }))
  .handler(async ({ data, context }) => {
    const { data: application, error } = await context.supabase
      .from("applications")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);

    const [{ data: documents }, { data: eligibility }, { data: updates }] = await Promise.all([
      context.supabase
        .from("application_documents")
        .select("*")
        .eq("application_id", data.id)
        .order("created_at", { ascending: true }),
      context.supabase
        .from("eligibility_results")
        .select("*")
        .eq("application_id", data.id)
        .order("created_at", { ascending: true }),
      context.supabase
        .from("application_updates")
        .select("*")
        .eq("application_id", data.id)
        .order("created_at", { ascending: false }),
    ]);

    return {
      application,
      documents: documents ?? [],
      eligibility: eligibility ?? [],
      updates: updates ?? [],
    };
  });

export const getDocumentLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { path: string }) => ({ path: String(input.path) }))
  .handler(async ({ data, context }) => {
    const { data: signed, error } = await context.supabase.storage
      .from("learner-documents")
      .createSignedUrl(data.path, 300);
    if (error || !signed) throw new Error(error?.message ?? "Could not create download link");
    return { url: signed.signedUrl };
  });

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: ApplicationStatus }) => ({
    id: String(input.id),
    status: input.status,
  }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("applications")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addEligibilityResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      applicationId: string;
      institution: string;
      programme: string;
      requirements: string;
      meetsRequirements: boolean;
      applicationStatus: string;
      notes: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("eligibility_results").insert({
      application_id: data.applicationId,
      institution: data.institution.trim(),
      programme: data.programme.trim(),
      requirements: data.requirements.trim() || null,
      meets_requirements: data.meetsRequirements,
      application_status: data.applicationStatus,
      notes: data.notes.trim() || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteEligibilityResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input.id) }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("eligibility_results").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addApplicationUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { applicationId: string; message: string; status: ApplicationStatus }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("application_updates").insert({
      application_id: data.applicationId,
      message: data.message.trim(),
      status: data.status,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
