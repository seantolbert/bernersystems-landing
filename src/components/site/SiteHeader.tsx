import { site } from '@/content/site';
import { Logo } from './Logo';
import styles from './site.module.css';

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <a href="#top" className={styles.brand} aria-label={`${site.name}, back to top`}>
          <Logo />
        </a>
        <nav aria-label="Sections" className={styles.nav}>
          <ul>
            {site.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a href={site.primaryCta.href} className={styles.headerCta}>
          {site.primaryCta.label}
        </a>
      </div>
    </header>
  );
}
