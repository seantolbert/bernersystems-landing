'use server';

import { Resend } from 'resend';
import { z } from 'zod';
import { site } from '@/content/site';
import { getContactEnv } from '@/lib/server-env';

export type ContactField = 'name' | 'email' | 'company' | 'projectType' | 'budget' | 'message';

export type ContactState = {
  status: 'idle' | 'success' | 'invalid' | 'error';
  errors?: Partial<Record<ContactField, string>>;
  /** Echo of what the visitor typed, so a failed submit doesn't wipe the form. */
  values?: Partial<Record<ContactField, string>>;
};

const MIN_FILL_MS = 3000;

const schema = z.object({
  name: z.string().trim().min(1, 'Please add your name.').max(100, 'Keep the name under 100 characters.'),
  email: z.email('That email address doesn’t look right.').max(200),
  company: z.string().trim().max(120, 'Keep this under 120 characters.').optional(),
  projectType: z.enum(site.contact.projectTypes, 'Pick the closest project type.'),
  budget: z.enum(site.contact.budgets).optional(),
  message: z
    .string()
    .trim()
    .min(10, 'A sentence or two about the project helps.')
    .max(5000, 'Keep the message under 5,000 characters.'),
});

const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v : '');
const optional = (v: FormDataEntryValue | null) => {
  const s = str(v).trim();
  return s === '' ? undefined : s;
};

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values = {
    name: str(formData.get('name')),
    email: str(formData.get('email')).trim(),
    company: str(formData.get('company')),
    projectType: str(formData.get('projectType')),
    budget: str(formData.get('budget')),
    message: str(formData.get('message')),
  };

  // Bot checks: a hidden field people never see, and a minimum time on the form.
  // Bots get a normal-looking success so they don't learn to adapt.
  if (str(formData.get('website')) !== '') return { status: 'success' };
  const startedAt = Number(str(formData.get('startedAt')));
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS) {
    return { status: 'success' };
  }

  const parsed = schema.safeParse({
    name: values.name,
    email: values.email,
    company: optional(formData.get('company')),
    projectType: values.projectType,
    budget: optional(formData.get('budget')),
    message: values.message,
  });

  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;
    const errors: ContactState['errors'] = {};
    for (const [key, messages] of Object.entries(fieldErrors)) {
      if (messages?.[0]) errors[key as ContactField] = messages[0];
    }
    return { status: 'invalid', errors, values };
  }

  const env = getContactEnv();
  if (!env) {
    console.error('[contact] RESEND_API_KEY, CONTACT_TO, or CONTACT_FROM is not set');
    return { status: 'error', values };
  }

  const d = parsed.data;
  const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').slice(0, 120);
  const text = [
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Company: ${d.company ?? '—'}`,
    `Project type: ${d.projectType}`,
    `Budget: ${d.budget ?? '—'}`,
    '',
    d.message,
  ].join('\n');

  try {
    const resend = new Resend(env.resendApiKey);
    const { error } = await resend.emails.send({
      from: env.from,
      to: env.to,
      replyTo: d.email,
      subject: oneLine(`New inquiry from ${d.name}: ${d.projectType}`),
      text,
    });
    if (error) {
      console.error('[contact] Resend rejected the send', error.name, error.message);
      return { status: 'error', values };
    }
  } catch (err) {
    console.error('[contact] send failed', err instanceof Error ? err.message : err);
    return { status: 'error', values };
  }

  return { status: 'success' };
}
