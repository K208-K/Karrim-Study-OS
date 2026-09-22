'use client';

import { useData } from '@/lib/data-context';
import { useQuickAdd } from '@/components/layout/quick-add-provider';
import { getSubjectProgress } from '@/lib/analytics';
import { formatRelativeTime } from '@/lib/date';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SubjectForm } from '@/components/subjects/subject-form';
import { SubjectEditDialog } from '@/components/subjects/subject-edit-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Pencil, Trash2, Plus, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Subject } from '@/types';

export default function SubjectsPage() {
  const { data, deleteSubject } = useData();
  const { openQuickAdd } = useQuickAdd();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground mt-1">Your study subjects and their progress.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Subject
        </Button>
      </div>

      {data.subjects.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Start building your study system.</p>
          <Button onClick={() => setAddOpen(true)} size="sm" variant="outline" className="mt-4">
            <Plus className="h-4 w-4 mr-1" />
            Add Subject
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.subjects.map((subject) => {
            const progress = getSubjectProgress(data.tasks, subject.id);
            const topicCount = data.topics.filter((t) => t.subjectId === subject.id).length;
            const taskCount = data.tasks.filter((t) => t.subjectId === subject.id).length;
            const IconComp = (Icons as unknown as Record<string, LucideIcon>)[subject.icon] || Icons.BookOpen;

            return (
              <div
                key={subject.id}
                className="group relative rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-muted-foreground/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <Link href={`/subjects/${subject.id}`} className="flex-1">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${subject.color}20` }}
                    >
                      <IconComp className="h-5 w-5" style={{ color: subject.color }} />
                    </div>
                  </Link>
                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => { setEditSubject(subject); setEditOpen(true); }}>
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete {subject.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the subject, all its topics, tasks, and notes. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  deleteSubject(subject.id);
                                  toast({ title: 'Subject deleted', description: subject.name });
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <Link href={`/subjects/${subject.id}`}>
                  <h3 className="font-display font-semibold text-base tracking-tight mb-1 group-hover:text-primary transition-colors">
                    {subject.name}
                  </h3>
                  {subject.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{subject.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mb-3">
                    {topicCount} Topics · {taskCount} Tasks
                  </p>
                  <div className="space-y-1.5">
                    <Progress value={progress.pct} className="h-1.5" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{progress.pct}%</span>
                      <span className="text-xs text-muted-foreground">
                        {subject.lastStudiedAt ? `Studied ${formatRelativeTime(subject.lastStudiedAt)}` : 'Not started'}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Subject</DialogTitle>
          </DialogHeader>
          <SubjectForm onSaved={() => setAddOpen(false)} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <SubjectEditDialog subject={editSubject} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
