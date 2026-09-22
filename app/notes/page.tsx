'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useData } from '@/lib/data-context';
import { useQuickAdd } from '@/components/layout/quick-add-provider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatRelativeTime } from '@/lib/date';
import { Plus, FileText, Search, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function NotesPage() {
  const { data, getNoteByTopic, upsertNote } = useData();
  const { openQuickAdd } = useQuickAdd();
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get('topic');

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    initialTopic || data.topics[0]?.id || null
  );
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [savedLabel, setSavedLabel] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef('');

  const topicsWithNotes = useMemo(() => {
    return data.topics.map((t) => {
      const subject = data.subjects.find((s) => s.id === t.subjectId);
      const note = data.notes.find((n) => n.topicId === t.id);
      return { topic: t, subject, note };
    });
  }, [data.topics, data.subjects, data.notes]);

  const filteredTopics = useMemo(() => {
    if (!search.trim()) return topicsWithNotes;
    const q = search.toLowerCase();
    return topicsWithNotes.filter(({ topic, subject, note }) => {
      return (
        topic.name.toLowerCase().includes(q) ||
        subject?.name.toLowerCase().includes(q) ||
        note?.content.toLowerCase().includes(q)
      );
    });
  }, [topicsWithNotes, search]);

  // Load note content when topic changes
  useEffect(() => {
    if (selectedTopicId) {
      const note = getNoteByTopic(selectedTopicId);
      const text = note?.content || '';
      setContent(text);
      lastSaved.current = text;
      setSavedLabel(note ? `Last edited ${formatRelativeTime(note.updatedAt)}` : '');
    } else {
      setContent('');
      setSavedLabel('');
    }
  }, [selectedTopicId, getNoteByTopic]);

  // Auto-save with debounce
  const scheduleSave = useCallback((topicId: string, text: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (text !== lastSaved.current) {
        upsertNote(topicId, text);
        lastSaved.current = text;
        setSavedLabel('Saved just now');
        setTimeout(() => setSavedLabel('Saved'), 2000);
      }
    }, 800);
  }, [upsertNote]);

  const handleChange = (val: string) => {
    setContent(val);
    if (selectedTopicId) {
      scheduleSave(selectedTopicId, val);
    }
  };

  const selectedTopic = data.topics.find((t) => t.id === selectedTopicId);
  const selectedSubject = selectedTopic ? data.subjects.find((s) => s.id === selectedTopic.subjectId) : null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground mt-1">Browse, write, and search your study notes.</p>
        </div>
        <Button onClick={openQuickAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </div>

      {data.topics.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No notes yet.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Create a subject and topic first, then add notes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          {/* Topic list */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {filteredTopics.map(({ topic, subject, note }) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={cn(
                    'w-full text-left rounded-lg border p-3 transition-all',
                    selectedTopicId === topic.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-muted-foreground/30'
                  )}
                >
                  <p className="text-sm font-medium truncate">{topic.name}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {subject?.name}
                  </p>
                  {note ? (
                    <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">
                      {note.content.slice(0, 80)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/50 mt-1 italic">No notes yet</p>
                  )}
                </button>
              ))}
              {filteredTopics.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No matching notes.</p>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="rounded-xl border bg-card p-5 min-h-[50vh]">
            {selectedTopic ? (
              <>
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div>
                    <p className="text-xs text-muted-foreground">{selectedSubject?.name}</p>
                    <h2 className="font-display text-lg font-semibold">{selectedTopic.name}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {savedLabel && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Check className="h-3 w-3 text-success" />
                        {savedLabel}
                      </span>
                    )}
                  </div>
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="Start writing your notes here... (Auto-saves as you type)"
                  className="min-h-[40vh] border-0 focus-visible:ring-0 font-mono text-sm leading-relaxed resize-none"
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[40vh]">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Select a topic to view or edit notes.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
