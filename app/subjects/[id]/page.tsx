'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { useData } from '@/lib/data-context';
import { getSubjectProgress, getTopicProgress } from '@/lib/analytics';
import { formatRelativeTime } from '@/lib/date';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { TopicForm } from '@/components/topics/topic-form';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  ArrowLeft,
  Check,
  FileText,
  CheckSquare,
} from 'lucide-react';

import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import type { Topic } from '@/types';

export default function SubjectDetailPage() {
  const params = useParams();

  const { data, addTopic, updateTopic, deleteTopic } = useData();
  const { toast } = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTopicId, setDeleteTopicId] = useState<string | null>(null);

  const subjectId = params.id as string;

  const subject = data.subjects.find(
    (s) => s.id === subjectId
  );

  const topics = useMemo(
    () =>
      data.topics
        .filter((t) => t.subjectId === subjectId)
        .sort((a, b) => a.order - b.order),
    [data.topics, subjectId]
  );

  const progress = getSubjectProgress(
    data.tasks,
    subjectId
  );

  /*
   * IMPORTANT:
   * Lucide icons are ForwardRefExoticComponents.
   * Do NOT cast Icons directly to:
   * Record<string, React.ComponentType<...>>
   *
   * The unknown intermediate cast avoids the Vercel
   * TypeScript error.
   */
  const IconComp = subject
    ? (
        (Icons as unknown as Record<string, LucideIcon>)[
          subject.icon
        ] || Icons.BookOpen
      )
    : Icons.BookOpen;

  if (!subject) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">
          Subject not found.
        </p>

        <Link
          href="/subjects"
          className="text-sm text-primary hover:underline mt-2 inline-block"
        >
          Back to subjects
        </Link>
      </div>
    );
  }

  const handleEditTopic = (topic: Topic) => {
    setEditTopic(topic);
    setEditOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Back */}
      <Link
        href="/subjects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Subjects
      </Link>

      {/* Subject Header */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start gap-4">

          {/* Subject Icon */}
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0"
            style={{
              backgroundColor: `${subject.color}20`,
            }}
          >
            <IconComp
              className="h-6 w-6"
              style={{ color: subject.color }}
            />
          </div>

          {/* Subject Information */}
          <div className="flex-1 min-w-0">

            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              {subject.name}
            </h1>

            {subject.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {subject.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3">

              <span className="text-xs text-muted-foreground">
                {topics.length} Topics
              </span>

              <span className="text-xs text-muted-foreground">
                {progress.total} Tasks
              </span>

              <span className="text-xs text-muted-foreground">
                {subject.lastStudiedAt
                  ? `Last studied ${formatRelativeTime(
                      subject.lastStudiedAt
                    )}`
                  : 'Not started yet'}
              </span>

            </div>

            {/* Subject Progress */}
            <div className="mt-4 max-w-xs">

              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Progress
                </span>

                <span className="text-xs font-medium">
                  {progress.pct}%
                </span>
              </div>

              <Progress
                value={progress.pct}
                className="h-2"
              />

            </div>
          </div>
        </div>
      </div>

      {/* Topics */}
      <div>

        <div className="flex items-center justify-between mb-4">

          <h2 className="font-display text-lg font-semibold">
            Topics
          </h2>

          <Button
            onClick={() => setAddOpen(true)}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Topic
          </Button>

        </div>

        {topics.length === 0 ? (

          /* Empty State */
          <div className="rounded-xl border border-dashed bg-card p-10 text-center">

            <p className="text-muted-foreground">
              No topics yet.
            </p>

            <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
              Add your first topic to start studying.
            </p>

            <Button
              onClick={() => setAddOpen(true)}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Topic
            </Button>

          </div>

        ) : (

          /* Topic List */
          <div className="space-y-2">

            {topics.map((topic, idx) => {

              const tp = getTopicProgress(
                data.tasks,
                topic.id
              );

              const noteCount = data.notes.filter(
                (n) => n.topicId === topic.id
              ).length;

              const taskCount = data.tasks.filter(
                (t) => t.topicId === topic.id
              ).length;

              return (
                <div
                  key={topic.id}
                  className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-sm"
                >

                  {/* Topic Number */}
                  <span className="font-display text-sm font-bold text-muted-foreground/50 w-6 text-right">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Topic Information */}
                  <Link
                    href={`/subjects/${subjectId}?topic=${topic.id}`}
                    className="flex-1 min-w-0"
                  >

                    <p className="font-medium text-sm">
                      {topic.name}
                    </p>

                    <div className="flex items-center gap-3 mt-1">

                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckSquare className="h-3 w-3" />
                        {taskCount}
                      </span>

                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {noteCount}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        Updated {formatRelativeTime(topic.updatedAt)}
                      </span>

                    </div>

                  </Link>

                  {/* Topic Actions */}
                  <div className="flex items-center gap-3">

                    {/* Progress */}
                    <div className="w-24 hidden sm:block">
                      <Progress
                        value={tp.pct}
                        className="h-1.5"
                      />
                    </div>

                    <span className="text-xs font-medium w-9 text-right">
                      {tp.pct}%
                    </span>

                    {/* Completed */}
                    {tp.pct === 100 && tp.total > 0 && (
                      <Check className="h-4 w-4 text-success" />
                    )}

                    {/* Menu */}
                    <DropdownMenu>

                      <DropdownMenuTrigger asChild>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Actions for ${topic.name}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">

                        <DropdownMenuItem
                          onSelect={() =>
                            handleEditTopic(topic)
                          }
                        >
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onSelect={() =>
                            setDeleteTopicId(topic.id)
                          }
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>

                      </DropdownMenuContent>

                    </DropdownMenu>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* Add Topic Dialog */}
      <Dialog
        open={addOpen}
        onOpenChange={setAddOpen}
      >
        <DialogContent>

          <DialogHeader>
            <DialogTitle>
              Add Topic to {subject.name}
            </DialogTitle>
          </DialogHeader>

          <TopicForm
            initial={{ subjectId }}
            onSaved={() => {
              setAddOpen(false);
              toast({
                title: 'Topic added',
              });
            }}
            onCancel={() => setAddOpen(false)}
          />

        </DialogContent>
      </Dialog>

      {/* Edit Topic Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={setEditOpen}
      >
        <DialogContent>

          <DialogHeader>
            <DialogTitle>
              Edit Topic
            </DialogTitle>
          </DialogHeader>

          {editTopic && (
            <TopicForm
              initial={editTopic}
              submitLabel="Save Changes"
              onSaved={() => {
                setEditOpen(false);
                toast({
                  title: 'Topic updated',
                });
              }}
              onCancel={() => setEditOpen(false)}
            />
          )}

        </DialogContent>
      </Dialog>

      {/* Delete Topic Confirmation */}
      <AlertDialog
        open={!!deleteTopicId}
        onOpenChange={(value) => {
          if (!value) {
            setDeleteTopicId(null);
          }
        }}
      >
        <AlertDialogContent>

          <AlertDialogHeader>

            <AlertDialogTitle>
              Delete this topic?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete the topic, its tasks,
              and its notes. This cannot be undone.
            </AlertDialogDescription>

          </AlertDialogHeader>

          <AlertDialogFooter>

            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() => {
                if (deleteTopicId) {
                  deleteTopic(deleteTopicId);

                  toast({
                    title: 'Topic deleted',
                  });
                }

                setDeleteTopicId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}