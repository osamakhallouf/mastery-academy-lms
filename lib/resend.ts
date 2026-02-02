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

export const sendResendEmail = async ({
  to,
  subject,
  html,
  attachments,
}: ResendEmailPayload) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey || !fromEmail) {
    console.error("[RESEND] Missing API key or from email.");
    return { ok: false };
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

  return { ok: response.ok };
};
