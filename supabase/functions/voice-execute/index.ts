import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ExecuteRequestSchema } from "../_shared/voiceSchemas.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const getAuthUser = async (token: string) => {
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    throw new Error("Unauthorized");
  }
  return { supabaseAdmin, user: data.user };
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Supabase env not configured" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing authorization token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const body = await req.json();
    const parsed = ExecuteRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!parsed.data.confirmed) {
      return new Response(
        JSON.stringify({ error: "Confirmation required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { intent } = parsed.data;
    if (intent.intent !== "create_task") {
      return new Response(
        JSON.stringify({ error: "Unsupported intent" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { supabaseAdmin, user } = await getAuthUser(token);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, org_id, role, fullname, email")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.org_id) {
      return new Response(
        JSON.stringify({ error: "No organization found for user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    let assigneeUserId: string | null = intent.entities.assigneeUserId ?? null;

    if (!assigneeUserId && intent.entities.assigneeName) {
      const { data: assignee } = await supabaseAdmin
        .from("profiles")
        .select("id, fullname, email")
        .eq("org_id", profile.org_id)
        .ilike("fullname", `%${intent.entities.assigneeName}%`)
        .limit(1)
        .maybeSingle();
      assigneeUserId = assignee?.id ?? null;
    }

    const taskPayload = {
      title: intent.entities.title,
      description: intent.entities.description ?? null,
      priority: intent.entities.priority ?? "Medium",
      status: intent.entities.status ?? "pending",
      assigned_to_user_id: assigneeUserId,
      deadline: intent.entities.deadlineIso ?? null,
      org_id: profile.org_id,
      created_by: user.id,
    };

    if (!taskPayload.title) {
      return new Response(
        JSON.stringify({ error: "Missing task title" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { data: task, error: insertError } = await supabaseAdmin
      .from("tasks")
      .insert(taskPayload)
      .select("id, title")
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        status: "success",
        action: "create_task",
        resourceId: task?.id,
        summary: `Created task "${task?.title}"`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Unexpected error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
