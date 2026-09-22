'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  CheckSquare,
  BookOpen,
  FilePlus2,
  FileText,
  Search,
  LayoutDashboard,
  BarChart3,
  Settings,
  Download,
} from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useQuickAdd } from '@/components/layout/quick-add-provider';
import { globalSearch } from '@/lib/search';
import type { SearchResult } from '@/types';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { data } = useData();
  const { openQuickAdd } = useQuickAdd();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          e.preventDefault();
          openQuickAdd();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openQuickAdd]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const navigate = (href: string) => {
    router.push(href);
    close();
  };

  const results = query.trim() ? globalSearch(data, query) : [];
  const typeIcon = (type: string) => {
    switch (type) {
      case 'subject': return BookOpen;
      case 'topic': return FilePlus2;
      case 'task': return CheckSquare;
      case 'note': return FileText;
      default: return Search;
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(''); }}>
      <CommandInput placeholder="What do you want to do?" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {!query.trim() && (
          <>
            <CommandGroup heading="Create">
              <CommandItem onSelect={() => { close(); openQuickAdd(); }}>
                <CheckSquare className="mr-2 h-4 w-4" />
                Add task
              </CommandItem>
              <CommandItem onSelect={() => { close(); openQuickAdd(); }}>
                <BookOpen className="mr-2 h-4 w-4" />
                Add subject
              </CommandItem>
              <CommandItem onSelect={() => { close(); openQuickAdd(); }}>
                <FilePlus2 className="mr-2 h-4 w-4" />
                Add topic
              </CommandItem>
              <CommandItem onSelect={() => { close(); openQuickAdd(); }}>
                <FileText className="mr-2 h-4 w-4" />
                Add note
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Navigate">
              <CommandItem onSelect={() => navigate('/')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </CommandItem>
              <CommandItem onSelect={() => navigate('/tasks')}>
                <CheckSquare className="mr-2 h-4 w-4" />
                Today&apos;s tasks
              </CommandItem>
              <CommandItem onSelect={() => navigate('/notes')}>
                <FileText className="mr-2 h-4 w-4" />
                Notes
              </CommandItem>
              <CommandItem onSelect={() => navigate('/analytics')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </CommandItem>
              <CommandItem onSelect={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {results.length > 0 && (
          <CommandGroup heading="Search Results">
            {results.map((r: SearchResult) => {
              const Icon = typeIcon(r.type);
              return (
                <CommandItem
                  key={`${r.type}-${r.id}`}
                  onSelect={() => {
                    if (r.type === 'subject') navigate(`/subjects/${r.subjectId}`);
                    else if (r.type === 'topic') navigate(`/subjects/${r.subjectId}?topic=${r.topicId}`);
                    else if (r.type === 'task') navigate('/tasks');
                    else if (r.type === 'note') navigate(`/notes?topic=${r.topicId}`);
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{r.title}</span>
                    <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
