import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Credentialing Workbench',
  description: 'Credentialing operations workbench for provider enrollment and payer credentialing.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <header className="sr-only">Credentialing Workbench</header>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
