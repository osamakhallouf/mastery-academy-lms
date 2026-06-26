type ResendEmailAttachment = {
  filename: string;
  content: string;
  contentType?: string;
};

type ResendEmailPayload = {
  to: string;
  subject: string;
  html: string;
  attachments?: ResendEmailAttachment[];
};

export type ResendResult = { ok: true } | { ok: false; error?: string };

export const sendResendEmail = async ({
  to,
  subject,
  html,
  attachments,
}: ResendEmailPayload): Promise<ResendResult> => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey || !fromEmail) {
    console.error("[RESEND] Missing RESEND_API_KEY or RESEND_FROM_EMAIL.");
    return { ok: false, error: "Missing config" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      html,
      attachments,
    }),
  });

  if (response.ok) {
    return { ok: true };
  }

  let errorMessage = response.statusText;
  try {
    const body = await response.json();
    errorMessage = body?.message ?? body?.msg ?? body?.error ?? JSON.stringify(body);
  } catch {
    // ignore
  }
  console.error("[RESEND] Send failed:", response.status, errorMessage);
  return { ok: false, error: errorMessage };
};
