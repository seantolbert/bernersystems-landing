// Contact form checks: invalid input, the too-fast bot trap, and a real submit (no email env → error state).
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 375, height: 812 } });
await p.goto('' + (process.env.BASE_URL ?? 'http://localhost:3000') + '/#contact', { waitUntil: 'networkidle' });

// 1. Too fast: filled and sent immediately → silently "succeeds", nothing sent.
await p.fill('#contact-name', 'Bot');
await p.fill('#contact-email', 'bot@example.com');
await p.fill('#contact-message', 'Buy cheap things now please');
await p.click('button[type=submit]');
await p.waitForSelector('[role=status]');
console.log('too-fast →', (await p.textContent('[role=status]')).trim());

// 2. Invalid fields (after the timing window).
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(3200);
await p.fill('#contact-name', 'Pat');
await p.fill('#contact-email', 'not-an-email');
await p.fill('#contact-message', 'short');
await p.$eval('form', (f) => (f.noValidate = true));
await p.click('button[type=submit]');
await p.waitForSelector('#contact-email-error');
console.log('invalid → email:', await p.textContent('#contact-email-error'), '| message:', await p.textContent('#contact-message-error'));
console.log('values kept → name:', await p.inputValue('#contact-name'), '| email:', await p.inputValue('#contact-email'));

// 3. Valid input with no RESEND env locally → error message with the mailto fallback.
await p.fill('#contact-email', 'pat@example.com');
await p.fill('#contact-message', 'I need a website for my plumbing business in Tempe.');
await p.waitForTimeout(3200);
await p.click('button[type=submit]');
await p.waitForSelector('[role=alert] a[href^="mailto:"]');
console.log('no env →', (await p.textContent('[role=alert]')).trim());
await b.close();
