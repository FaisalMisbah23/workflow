import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MAX_AUDIO_BYTES, TranscribeRequestSchema } from "../_shared/voiceSchemas.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_BASE_URL = Deno.env.get("GROQ_BASE_URL") || "https://api.groq.com/openai/v1";
const GROQ_TRANSCRIBE_MODEL = Deno.env.get("GROQ_TRANSCRIBE_MODEL") || "whisper-large-v3";

const base64ToBytes = (base64: string) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

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
    const parsed = TranscribeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { audioBase64, mimeType, locale } = parsed.data;
    const audioBytes = base64ToBytes(audioBase64);
    if (audioBytes.byteLength > MAX_AUDIO_BYTES) {
      return new Response(
        JSON.stringify({ error: "Audio too large", maxBytes: MAX_AUDIO_BYTES }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 413 }
      );
    }

    const form = new FormData();
    const audioBlob = new Blob([audioBytes], { type: mimeType });
    form.append("file", audioBlob, `voice.${mimeType.split("/")[1] || "m4a"}`);
    form.append("model", GROQ_TRANSCRIBE_MODEL);
    form.append("language", locale.split("-")[0] || "en");

    const response = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: "Transcription failed", details: errorText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
      );
    }

    const data = await response.json();
    const transcript = data.text || "";

    return new Response(
      JSON.stringify({ transcript, confidence: data.confidence ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Unexpected error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
