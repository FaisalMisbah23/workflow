import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
serve(async (req) => {
  try {
    const { email, orgId, token, userId } = await req.json();
    const supabaseUrl = "https://nprftkuvmuspshklzfqc.supabase.co";
    const supabaseAnonKey = "sb_publishable_ja9WnBxj0XJ1iwcuNpob1g_-yHtoeVi";

    const supabase = createClient(supabaseAnonKey, supabaseUrl);

    const { data: inviter } = await supabase
      .from("profiles")
      .select("fullname")
      .eq("id", userId)
      .single();

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single();

    if (orgError) {
      console.error("Org fetch error:", orgError);
    }

    const orgName = org?.name || "our Organization";
    const inviterName = inviter?.fullname || "A team member";
    const invitelink = `https://smart-workflow.com/invite/${token}`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: "Smart Workflow <noreply@smark-workflow.com>",
        to: email,
        subject: `Invitation to join ${orgName} on Smart Workflow`,
        html: `
        <!DOCTYPE html>
        <html>
         <body style="margin:0; padding:0; background:#F9FAFB; font-family: sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
                <tr>
                  <td align="center">
                    <table width="520" cellpadding="0" cellspacing="0"
                      style="background:#ffffff; border-radius:12px; border:1px solid #E5E7EB; overflow:hidden;">

                      <!-- Header -->
                      <tr>
                        <td style="background:#4F46E5; padding: 32px 40px;">
                          <h1 style="margin:0; color:white; font-size:22px; font-weight:600;">
                            You're Invited!
                          </h1>
                          <p style="margin:8px 0 0; color:#C7D2FE; font-size:14px;">
                            Join ${orgName} on YourApp
                          </p>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding: 32px 40px;">
                          <p style="margin:0 0 16px; font-size:15px; color:#374151; line-height:1.6;">
                            Hi there,
                          </p>
                          <p style="margin:0 0 24px; font-size:15px; color:#374151; line-height:1.6;">
                            <strong>${inviterName}</strong> ne aapko
                            <strong>${orgName}</strong> organization me invite kiya hai.
                            Neeche button click kar ke join karo.
                          </p>

                          <!-- CTA Button -->
                          <table cellpadding="0" cellspacing="0" style="margin: 0 0 28px;">
                            <tr>
                              <td style="background:#4F46E5; border-radius:8px;">
                                <a href="${invitelink}"
                                  style="display:inline-block; padding:12px 28px; color:white;
                                  font-size:15px; font-weight:600; text-decoration:none;">
                                  Accept Invite
                                </a>
                              </td>
                            </tr>
                          </table>

                          <!-- Invite Link Box -->
                          <p style="margin:0 0 8px; font-size:13px; color:#6B7280;">
                            Ya yeh link copy karo:
                          </p>
                          <div style="background:#F3F4F6; border-radius:6px;
                            padding:10px 14px; word-break:break-all;">
                            <a href="${invitelink}"
                              style="font-size:13px; color:#4F46E5; text-decoration:none;">
                              ${invitelink}
                            </a>
                          </div>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding: 20px 40px; border-top: 1px solid #F3F4F6;">
                          <p style="margin:0; font-size:12px; color:#9CA3AF; line-height:1.6;">
                            Yeh invite 24 ghante me expire ho jayega.<br/>
                            Agar aapne invite request nahi ki to is email ko ignore kar sakte hain.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      }),
    });
    if (!res.ok) {
      const resendError = await res.json();
      console.error("Resend error:", resendError);
      return new Response(
        JSON.stringify({ success: false, error: resendError }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
    const data = await res.json();
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
