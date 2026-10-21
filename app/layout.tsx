import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'THERASSISTANT | Revenue Cycle Consulting',
  description: 'Project-based billing consulting and Health Checks for mental health practices.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <header className="sr-only">THERASSISTANT Consulting Portal</header>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
