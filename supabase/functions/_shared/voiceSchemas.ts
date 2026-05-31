import { z } from "https://esm.sh/zod@3.23.8";

export const IntentEntitySchema = z.object({
  title: z.string().min(1).nullable(),
  priority: z.enum(["Low", "Medium", "High"]).nullable(),
  assigneeName: z.string().min(1).nullable(),
  assigneeUserId: z.string().uuid().nullable(),
  deadlineIso: z.string().datetime().nullable(),
  status: z.enum(["pending", "in_progress", "completed"]).nullable(),
  description: z.string().min(1).nullable(),
});

export const IntentSchema = z.object({
  intent: z.enum(["create_task", "update_task_status", "query_today_tasks", "unknown"]),
  confidence: z.number().min(0).max(1),
  requiresConfirmation: z.boolean(),
  entities: IntentEntitySchema,
  missingFields: z.array(z.enum(["title", "assignee", "deadline", "status"]))
    .optional()
    .default([]),
});

export type IntentPayload = z.infer<typeof IntentSchema>;

export const TranscribeRequestSchema = z.object({
  audioBase64: z.string().min(1),
  mimeType: z.enum(["audio/m4a", "audio/wav", "audio/mp4", "audio/x-wav"]).default("audio/m4a"),
  locale: z.string().min(2).default("en-US"),
  clientRequestId: z.string().uuid().optional(),
});

export const IntentRequestSchema = z.object({
  transcript: z.string().min(1),
  timezone: z.string().min(2).default("UTC"),
  orgId: z.string().uuid().optional(),
  clientRequestId: z.string().uuid().optional(),
});

export const ExecuteRequestSchema = z.object({
  intent: IntentSchema,
  confirmed: z.boolean(),
});

export const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
