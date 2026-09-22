'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckSquare, BookOpen, FileText, FilePlus2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { SubjectForm } from '@/components/subjects/subject-form';
import { TopicForm } from '@/components/topics/topic-form';
import { NoteForm } from '@/components/notes/note-form';
import { useData } from '@/lib/data-context';
import { useToast } from '@/hooks/use-toast';

type Tab = 'task' | 'subject' | 'topic' | 'note';

interface QuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddDialog({ open, onOpenChange }: QuickAddDialogProps) {
  const [tab, setTab] = useState<Tab>('task');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (open) setTab('task');
  }, [open]);

  const handleClose = () => onOpenChange(false);

  const handleCreated = (type: string, redirect?: string) => {
    toast({ title: `${type} added`, description: 'Saved successfully.' });
    handleClose();
    if (redirect) router.push(redirect);
  };

  const tabs: { id: Tab; label: string; icon: typeof CheckSquare }[] = [
    { id: 'task', label: 'Task', icon: CheckSquare },
    { id: 'subject', label: 'Subject', icon: BookOpen },
    { id: 'topic', label: 'Topic', icon: FilePlus2 },
    { id: 'note', label: 'Note', icon: FileText },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick Add</DialogTitle>
          <DialogDescription>Create a new task, subject, topic, or note.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  tab === t.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
          {tab === 'task' && <TaskForm onSaved={() => handleCreated('Task')} onCancel={handleClose} />}
          {tab === 'subject' && <SubjectForm onSaved={() => handleCreated('Subject', '/subjects')} onCancel={handleClose} />}
          {tab === 'topic' && <TopicForm onSaved={() => handleCreated('Topic')} onCancel={handleClose} />}
          {tab === 'note' && <NoteForm onSaved={() => handleCreated('Note', '/notes')} onCancel={handleClose} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
