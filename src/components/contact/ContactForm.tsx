'use client';

import { useActionState, useEffect, useRef } from 'react';
import { sendContact, type ContactField, type ContactState } from '@/app/actions/contact';
import { site } from '@/content/site';
import styles from './ContactForm.module.css';

const initial: ContactState = { status: 'idle' };

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, initial);
  const startedRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  // Time the visitor started; the server drops anything sent faster than a person could type.
  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  // Move focus to the result so screen reader and keyboard users hear it.
  useEffect(() => {
    if (state.status === 'success' || state.status === 'error') statusRef.current?.focus();
  }, [state.status]);

  if (state.status === 'success') {
    return (
      <p ref={statusRef} tabIndex={-1} role="status" className={styles.success}>
        {site.contact.success}
      </p>
    );
  }

  const v = state.values ?? {};
  const err = state.errors ?? {};
  const fieldProps = (name: ContactField) => ({
    id: `contact-${name}`,
    name,
    defaultValue: v[name] ?? '',
    'aria-invalid': err[name] ? true : undefined,
    'aria-describedby': err[name] ? `contact-${name}-error` : undefined,
  });
  const error = (name: ContactField) =>
    err[name] ? (
      <p id={`contact-${name}-error`} className={styles.error}>
        {err[name]}
      </p>
    ) : null;

  return (
    <form action={action} className={styles.form} noValidate={state.status === 'invalid'}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="contact-name">Your name</label>
          <input {...fieldProps('name')} type="text" autoComplete="name" required maxLength={100} />
          {error('name')}
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-email">Email</label>
          <input {...fieldProps('email')} type="email" autoComplete="email" required maxLength={200} />
          {error('email')}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-company">
          Business or company <span className={styles.optional}>(optional)</span>
        </label>
        <input {...fieldProps('company')} type="text" autoComplete="organization" maxLength={120} />
        {error('company')}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="contact-projectType">What do you need?</label>
          <select {...fieldProps('projectType')} defaultValue={v.projectType || site.contact.projectTypes[0]} required>
            {site.contact.projectTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {error('projectType')}
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-budget">
            Budget <span className={styles.optional}>(optional)</span>
          </label>
          <select {...fieldProps('budget')} defaultValue={v.budget || site.contact.budgets[0]}>
            {site.contact.budgets.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          {error('budget')}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-message">About the project</label>
        <textarea {...fieldProps('message')} rows={6} required minLength={10} maxLength={5000} />
        {error('message')}
      </div>

      {/* Bot traps. People never see or fill these. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="contact-website">Leave this empty</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedRef} type="hidden" name="startedAt" defaultValue="" />

      {state.status === 'error' && (
        <p ref={statusRef} tabIndex={-1} role="alert" className={styles.error}>
          {site.contact.failure} <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      )}
      {state.status === 'invalid' && (
        <p role="alert" className={styles.error}>
          Please fix the highlighted fields and send again.
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={pending}>
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
