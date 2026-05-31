import { supabase } from "@/lib/supabase";

export interface VoiceIntent {
  intent: "create_task" | "update_task_status" | "query_today_tasks" | "unknown";
  confidence: number;
  requiresConfirmation: boolean;
  entities: {
    title: string | null;
    priority: "Low" | "Medium" | "High" | null;
    assigneeName: string | null;
    assigneeUserId: string | null;
    deadlineIso: string | null;
    status: "pending" | "in_progress" | "completed" | null;
    description: string | null;
  };
  missingFields?: Array<"title" | "assignee" | "deadline" | "status">;
}

export const transcribeAudio = async (payload: {
  audioBase64: string;
  mimeType: string;
  locale: string;
}) => {
  const { data, error } = await supabase.functions.invoke("voice-transcribe", {
    body: payload,
  });
  if (error) throw error;
  return data as { transcript: string; confidence: number | null };
};

export const extractIntent = async (payload: {
  transcript: string;
  timezone: string;
  orgId?: string;
}) => {
  const { data, error } = await supabase.functions.invoke("voice-intent", {
    body: payload,
  });
  if (error) throw error;
  return data as VoiceIntent;
};

export const executeIntent = async (payload: {
  intent: VoiceIntent;
  confirmed: boolean;
}) => {
  const { data, error } = await supabase.functions.invoke("voice-execute", {
    body: payload,
  });
  if (error) throw error;
  return data as { status: string; action: string; resourceId?: string; summary?: string };
};
