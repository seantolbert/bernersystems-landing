import { ContactForm } from '@/components/contact/ContactForm';
import { PhoneDemo } from '@/components/devices/PhoneDemo';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { WorkShowcase } from '@/components/work/WorkShowcase';
import { projects as allProjects } from '@/content/projects';
import { site } from '@/content/site';
import { withAvailableMedia } from '@/lib/media';
import styles from './page.module.css';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: site.name,
  url: site.url,
  email: site.email,
  description: site.description,
  areaServed: 'US',
  knowsAbout: ['Web design', 'Web development', 'Progressive web apps', 'Next.js', 'Supabase'],
};

export default function Home() {
  const projects = withAvailableMedia(allProjects);
  const heroProject = projects[0];

  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* Hero */}
        <section id="top" className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <h1 id="hero-heading">{site.hero.headline}</h1>
              <p className={styles.lede}>{site.hero.body}</p>
              <div className={styles.actions}>
                <a href={site.primaryCta.href} className={styles.primary}>
                  {site.primaryCta.label}
                </a>
                <a href={site.hero.secondary.href} className={styles.textLink}>
                  {site.hero.secondary.label}
                </a>
              </div>
            </div>
            <div className={styles.heroPhone}>
              <PhoneDemo project={heroProject} still tone="light" />
              <p className={styles.heroCaption}>
                {heroProject.name}, {heroProject.kind.toLowerCase()}
              </p>
            </div>
          </div>
        </section>

        <WorkShowcase projects={projects} heading={site.work.heading} intro={site.work.intro} />

        {/* Services */}
        <section id="services" className={styles.section} aria-labelledby="services-heading">
          <div className={styles.inner}>
            <h2 id="services-heading" className={styles.h2}>
              {site.services.heading}
            </h2>
            <div className={styles.services}>
              {site.services.items.map((s) => (
                <article key={s.name} className={styles.service}>
                  <div>
                    <h3 className={styles.h3}>{s.name}</h3>
                    <p className={styles.serviceFor}>{s.for}</p>
                  </div>
                  <ul className={styles.includes}>
                    {s.includes.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className={`${styles.section} ${styles.process}`} aria-labelledby="process-heading">
          <div className={styles.inner}>
            <h2 id="process-heading" className={styles.h2}>
              {site.process.heading}
            </h2>
            <ol className={styles.steps}>
              {site.process.steps.map((step) => (
                <li key={step.name} className={styles.step}>
                  <h3 className={styles.h3}>{step.name}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* About */}
        <section id="about" className={styles.section} aria-labelledby="about-heading">
          <div className={`${styles.inner} ${styles.about}`}>
            <div className={styles.aboutPhoto}>
              {site.about.photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- swap to next/image once the photo exists
                <img src={site.about.photo} alt={site.about.photoAlt} width={480} height={600} loading="lazy" />
              ) : (
                <div className={styles.photoPlaceholder} role="img" aria-label="Photo placeholder">
                  <span>Photo placeholder</span>
                </div>
              )}
            </div>
            <div className={styles.aboutText}>
              <h2 id="about-heading" className={styles.h2}>
                {site.about.heading}
              </h2>
              {site.about.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className={`${styles.section} ${styles.contact}`} aria-labelledby="contact-heading">
          <div className={`${styles.inner} ${styles.contactGrid}`}>
            <div className={styles.contactIntro}>
              <h2 id="contact-heading" className={styles.h2}>
                {site.contact.heading}
              </h2>
              <p>{site.contact.body}</p>
              <p className={styles.direct}>
                Prefer email? <a href={`mailto:${site.email}`}>{site.email}</a>
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        // Static object defined above; no user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </>
  );
}
