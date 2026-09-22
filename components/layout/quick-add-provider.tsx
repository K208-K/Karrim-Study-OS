'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { QuickAddDialog } from '@/components/layout/quick-add-dialog';

interface QuickAddContextValue {
  openQuickAdd: () => void;
}

const QuickAddContext = createContext<QuickAddContextValue | null>(null);

export function useQuickAdd() {
  const ctx = useContext(QuickAddContext);
  if (!ctx) throw new Error('useQuickAdd must be used within QuickAddProvider');
  return ctx;
}

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openQuickAdd = useCallback(() => setOpen(true), []);

  return (
    <QuickAddContext.Provider value={{ openQuickAdd }}>
      {children}
      <QuickAddDialog open={open} onOpenChange={setOpen} />
    </QuickAddContext.Provider>
  );
}
