export async function notify(
  to: string,
  subject: string,
  text: string
) {
  const apiKey = process.env.SENDCOREX_API_KEY;
  const from = process.env.EMAIL_FROM;
  const senderName = process.env.EMAIL_SENDER_NAME || "SocietyCare";

  if (!apiKey) {
    console.info(
      `[email fallback] to=${to} subject=${subject}: ${text}`
    );
    return { delivered: false };
  }

  if (!from) {
    throw new Error("EMAIL_FROM is not configured");
  }

  const response = await fetch("https://mail.sendcorex.com/v3.0/send", {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      from,
      senderName,
      subject,
      body: text,
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error("SendCoreX API error:", response.status, responseText);
    throw new Error(
      `SendCoreX email failed (${response.status}): ${responseText}`
    );
  }

  console.log("Email sent successfully:", responseText);

  return { delivered: true };
}