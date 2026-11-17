import { site } from '@/content/site';
import { Logo } from './Logo';
import styles from './site.module.css';

export function SiteFooter() {
  const year = 2026; // Static on purpose: the page is prerendered. Update yearly or derive at build.
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <Logo className={styles.footerLogo} />
        <ul className={styles.footerLinks}>
          <li>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          {site.social.map((s) => (
            <li key={s.href}>
              <a href={s.href} rel="me noopener noreferrer" target="_blank">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.copyright}>
          © {year} {site.name}
        </p>
      </div>
    </footer>
  );
}
