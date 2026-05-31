import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { IntentRequestSchema, IntentSchema } from "../_shared/voiceSchemas.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_BASE_URL = Deno.env.get("GROQ_BASE_URL") || "https://api.groq.com/openai/v1";
const GROQ_MODEL = Deno.env.get("GROQ_INTENT_MODEL") || "llama-3.1-8b-instant";

const buildPrompt = (transcript: string, timezone: string) => ({
  system: "You convert voice task commands into strict JSON only. No prose. If unsure, set intent to unknown and confidence low.",
  user: `Transcript: "${transcript}"\nTimezone: "${timezone}"\nReturn JSON ONLY with this exact shape:\n{\n  \"intent\":\"create_task|update_task_status|query_today_tasks|unknown\",\n  \"confidence\":0.0,\n  \"requiresConfirmation\":true,\n  \"entities\":{\n    \"title\":null,\n    \"priority\":null,\n    \"assigneeName\":null,\n    \"assigneeUserId\":null,\n    \"deadlineIso\":null,\n    \"status\":null,\n    \"description\":null\n  },\n  \"missingFields\":[ ]\n}`,
});

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY not configured" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  try {
    const body = await req.json();
    const parsed = IntentRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { transcript, timezone } = parsed.data;
    const prompt = buildPrompt(transcript, timezone);

    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0,
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: "Intent extraction failed", details: errorText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(content);
    } catch (_err) {
      return new Response(
        JSON.stringify({ error: "Model returned non-JSON", raw: content }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
      );
    }

    const intentParsed = IntentSchema.safeParse(parsedJson);
    if (!intentParsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid intent schema", details: intentParsed.error.flatten() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    return new Response(
      JSON.stringify(intentParsed.data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Unexpected error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
