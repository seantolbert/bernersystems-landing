import 'server-only';

export type ContactEnv = { resendApiKey: string; to: string; from: string };

/** Returns null when email isn't configured, so the form can fall back to the mailto link. */
export function getContactEnv(): ContactEnv | null {
  const resendApiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM;
  if (!resendApiKey || !to || !from) return null;
  return { resendApiKey, to, from };
}
