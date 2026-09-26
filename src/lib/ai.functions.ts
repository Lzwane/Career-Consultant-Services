import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AiRecommendation = {
  institution: string;
  programme: string;
  qualification_type: string;
  requirements: string;
  meets_requirements: boolean;
  suitability: "high" | "medium" | "low";
  reason: string;
  closing_date: string;
};

export type AiAnalysis = {
  summary: string;
  recommendations: AiRecommendation[];
  advice: string;
};

/** Admin-only: AI-assisted qualification analysis for a learner. */
export const analyzeApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input.id) }))
  .handler(async ({ data, context }): Promise<{ ok: true; analysis: AiAnalysis } | { ok: false; error: string }> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) return { ok: false, error: "Only the administrator can use the assistant." };

    const { data: app, error } = await context.supabase
      .from("applications")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !app) return { ok: false, error: "Application not found." };

    const { runQualificationAnalysis } = await import("./ai.server");
    return runQualificationAnalysis(app);
  });
