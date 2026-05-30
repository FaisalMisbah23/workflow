import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@yourapp.com";
const FROM_NAME = Deno.env.get("FROM_NAME") || "Task Manager";
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:8081";

function getInviteEmailTemplate(inviteLink: string, orgId: string, role: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You're invited to join an organization</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 30px; border-bottom: 3px solid #3b82f6;">
                  <h1 style="margin: 0; color: #333; font-size: 24px;">You've been invited!</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <p style="margin: 0 0 16px; color: #666; font-size: 16px; line-height: 1.5;">
                    You have been invited to join an organization on Task Manager as a <strong>${role}</strong>.
                  </p>
                  <p style="margin: 0 0 24px; color: #666; font-size: 16px; line-height: 1.5;">
                    Click the button below to accept the invitation and create your account.
                  </p>
                  <a href="${inviteLink}"
                    style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none;
                           padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                    Accept Invitation
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; color: #999; font-size: 12px;">
                    If you did not expect this invitation, you can safely ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

serve(async (req: Request) => {
  console.log("[send-invite] Function invoked, method:", req.method);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Step 1: Parse body ---
    let body: any;
    try {
      body = await req.json();
    } catch (parseErr) {
      console.error("[send-invite] Failed to parse request body:", parseErr);
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { email, orgId, token, role = "member" } = body;
    console.log("[send-invite] Received payload:", { email, orgId, token: token ? "***" : undefined, role });

    // --- Step 2: Validate required fields ---
    if (!email || !orgId || !token) {
      console.error("[send-invite] Missing fields — email:", !!email, "orgId:", !!orgId, "token:", !!token);
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, orgId, token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // --- Step 3: Check env vars ---
    console.log("[send-invite] Env check — BREVO_API_KEY set:", !!BREVO_API_KEY);
    console.log("[send-invite] Env check — FROM_EMAIL:", FROM_EMAIL);
    console.log("[send-invite] Env check — FROM_NAME:", FROM_NAME);
    console.log("[send-invite] Env check — APP_URL:", APP_URL);

    if (!BREVO_API_KEY) {
      console.warn("[send-invite] BREVO_API_KEY not set — skipping email send.");
      return new Response(
        JSON.stringify({ success: true, emailSent: false, reason: "BREVO_API_KEY not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // --- Step 4: Build invite link ---
    const inviteLink = `${APP_URL}/invite/${token}`;
    console.log("[send-invite] Invite link:", inviteLink);

    const htmlContent = getInviteEmailTemplate(inviteLink, orgId, role);

    // --- Step 5: Build Brevo payload ---
    const brevoPayload = {
      sender: { email: FROM_EMAIL, name: FROM_NAME },
      to: [{ email, name: email.split("@")[0] }],
      subject: "You've been invited to join an organization",
      htmlContent,
    };
    console.log("[send-invite] Sending to Brevo — to:", email, "from:", FROM_EMAIL);

    // --- Step 6: Call Brevo API ---
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(brevoPayload),
    });

    console.log("[send-invite] Brevo response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[send-invite] Brevo API returned error:", JSON.stringify(errorData));
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: errorData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const data = await response.json();
    console.log("[send-invite] Brevo success response:", JSON.stringify(data));

    return new Response(
      JSON.stringify({ success: true, emailSent: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("[send-invite] Unexpected error:", error?.message, error?.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
