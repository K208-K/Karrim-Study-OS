'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  FileText,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Menu,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/lib/data-context';
import { useQuickAdd } from '@/components/layout/quick-add-provider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { ready } = useData();
  const { openQuickAdd } = useQuickAdd();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Loading Screen Animation
  if (!mounted || !ready) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background">
        <motion.div
          animate={{
            scale: [0.95, 1.05, 0.95],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut',
          }}
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-display text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20"
        >
          K

          <span className="absolute -inset-1 rounded-2xl border border-primary/40 animate-ping" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 font-display text-sm font-semibold tracking-wide text-muted-foreground"
        >
          Karrim Study OS
        </motion.p>
      </div>
    );
  }

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex h-full flex-col">
      {/* Brand Header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-5',
          collapsed && !onNav && 'justify-center px-2'
        )}
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 font-display text-sm font-bold text-primary-foreground shadow-md shadow-primary/20"
        >
          K
        </motion.div>

        {(!collapsed || onNav) && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex flex-col leading-none"
          >
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text font-display text-sm font-bold tracking-tight text-transparent">
              Karrim Study OS
            </span>

            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Study Command
            </span>
          </motion.div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 px-2.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                onNav?.();
              }}
              className="relative block"
            >
              <motion.div
                whileHover={{
                  scale: 1.02,
                  x: collapsed ? 0 : 2,
                }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'font-semibold text-primary'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  collapsed && !onNav && 'justify-center px-2'
                )}
                title={collapsed && !onNav ? item.label : undefined}
              >
                {/* Active Background */}
                {active && (
                  <motion.div
                    layoutId="activeNavBackground"
                    className="absolute inset-0 rounded-xl border border-primary/20 bg-primary/10"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                <Icon
                  className={cn(
                    'z-10 h-4 w-4 shrink-0 transition-colors duration-200',
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />

                {(!collapsed || onNav) && (
                  <span className="relative z-10">{item.label}</span>
                )}

                {(!collapsed || onNav) && active && (
                  <motion.span
                    layoutId="activeDot"
                    className="z-10 ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-sm shadow-primary/50"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="space-y-1.5 px-2.5 pb-2">
        {/* Quick Add Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            openQuickAdd();
            onNav?.();
          }}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            collapsed && !onNav && 'justify-center px-2'
          )}
          title={collapsed && !onNav ? 'Quick Add' : undefined}
        >
          <Plus className="h-4 w-4 shrink-0 text-amber-500" />

          {(!collapsed || onNav) && <span>Quick Add</span>}

          {(!collapsed || onNav) && (
            <kbd className="ml-auto rounded-md border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              N
            </kbd>
          )}
        </motion.button>

        {/* Settings Link */}
        <Link
          href="/settings"
          onClick={() => {
            onNav?.();
          }}
          className="relative block"
        >
          <motion.div
            whileHover={{
              scale: 1.02,
              x: collapsed ? 0 : 2,
            }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive('/settings')
                ? 'font-semibold text-primary'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              collapsed && !onNav && 'justify-center px-2'
            )}
            title={collapsed && !onNav ? 'Settings' : undefined}
          >
            {isActive('/settings') && (
              <motion.div
                layoutId="activeNavBackground"
                className="absolute inset-0 rounded-xl border border-primary/20 bg-primary/10"
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 30,
                }}
              />
            )}

            <Settings className="z-10 h-4 w-4 shrink-0" />

            {(!collapsed || onNav) && (
              <span className="z-10">Settings</span>
            )}
          </motion.div>
        </Link>
      </div>

      {/* Footer Shortcut Helper */}
      {(!collapsed || onNav) && (
        <div className="border-t border-border/50 px-4 py-3">
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Sparkles className="inline h-3 w-3 text-amber-500" />

            Press{' '}
            <kbd className="rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[9px] font-semibold">
              Ctrl K
            </kbd>{' '}
            to search
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Animated Sidebar */}
      <motion.aside
        animate={{
          width: collapsed ? 68 : 240,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 28,
        }}
        className="z-20 hidden flex-col border-r border-border/60 bg-sidebar-background text-sidebar-foreground shadow-xs md:flex"
      >
        <SidebarContent />

        {/* Expand / Collapse Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setCollapsed(!collapsed);
          }}
          className="flex cursor-pointer items-center justify-center border-t border-border/50 py-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </motion.button>
      </motion.aside>

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-card/80 shadow-md backdrop-blur-md md:hidden"
          >
            <Menu className="h-5 w-5" />
          </motion.button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-64 border-r border-border/60 bg-sidebar-background p-0"
        >
          <SidebarContent onNav={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.2,
              ease: 'easeOut',
            }}
            className="mx-auto max-w-6xl px-4 pb-6 pt-16 md:px-8 md:py-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}