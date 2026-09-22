import './globals.css';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { DataProvider } from '@/lib/data-context';
import { QuickAddProvider } from '@/components/layout/quick-add-provider';
import { AppShell } from '@/components/layout/app-shell';
import { CommandPalette } from '@/components/layout/command-palette';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' });

export const metadata: Metadata = {
  title: 'Karrim Study OS',
  description: 'Your personal study command center',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <DataProvider>
            <QuickAddProvider>
              <AppShell>{children}</AppShell>
              <CommandPalette />
              <Toaster />
            </QuickAddProvider>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
