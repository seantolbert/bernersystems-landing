/** Ring-and-dot mark from the Outreach CRM icon, plus the wordmark. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width="22" height="22" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
        <circle cx="256" cy="256" r="200" fill="none" stroke="currentColor" strokeWidth="64" />
        <circle cx="256" cy="256" r="62" fill="var(--accent)" />
      </svg>
      <span>Berner Systems</span>
    </span>
  );
}
