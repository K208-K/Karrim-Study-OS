'use client';

import { useState } from 'react';
import { Check, Clock, MoreVertical, Trash2, Pencil, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/lib/data-context';
import { useToast } from '@/hooks/use-toast';
import { isOverdue, formatRelativeTime } from '@/lib/date';
import type { Task } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskEditDialog } from '@/components/tasks/task-edit-dialog';
import { TaskDetailDialog } from '@/components/tasks/task-detail-dialog';

const priorityStyles: Record<string, { dot: string; label: string }> = {
  high: { dot: 'bg-red-500', label: 'High' },
  medium: { dot: 'bg-yellow-500', label: 'Medium' },
  low: { dot: 'bg-blue-500', label: 'Low' },
};

export function TaskItem({ task }: { task: Task }) {
  const { data, toggleTask, deleteTask } = useData();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [animating, setAnimating] = useState(false);

  const subject = data.subjects.find((s) => s.id === task.subjectId);
  const topic = data.topics.find((t) => t.id === task.topicId);
  const overdue = isOverdue(task);
  const pri = priorityStyles[task.priority];

  const handleToggle = () => {
    setAnimating(true);
    toggleTask(task.id);
    setTimeout(() => setAnimating(false), 300);
    if (!task.completed) {
      toast({ title: 'Task completed', description: task.title });
    }
  };

  const handleDelete = () => {
    deleteTask(task.id);
    toast({ title: 'Task deleted', description: task.title });
  };

  const handleContentKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setDetailOpen(true);
    }
  };

  return (
    <>
      <div
        className={cn(
          'group flex items-start gap-3 rounded-lg border bg-card p-3.5 transition-all hover:shadow-sm',
          task.completed && 'opacity-60',
          overdue && !task.completed && 'border-red-500/30',
          animating && 'animate-task-complete'
        )}
      >
        <button
          onClick={handleToggle}
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
            task.completed
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-muted-foreground hover:border-primary'
          )}
          aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
        >
          {task.completed && <Check className="h-3 w-3" strokeWidth={3} />}
        </button>

        <div
          className="flex-1 min-w-0"
          role="button"
          tabIndex={0}
          aria-label={`View details for ${task.title}`}
          onClick={() => setDetailOpen(true)}
          onKeyDown={handleContentKeyDown}
        >
          <p
            className={cn(
              'text-sm font-medium leading-snug',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            {subject && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
                {subject.name}
              </span>
            )}
            {topic && (
              <>
                <span className="text-xs text-muted-foreground/50">·</span>
                <span className="text-xs text-muted-foreground">{topic.name}</span>
              </>
            )}
            <span className="text-xs text-muted-foreground/50">·</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={cn('h-2 w-2 rounded-full', pri.dot)} />
              {pri.label}
            </span>
            {task.dueTime && !task.completed && (
              <>
                <span className="text-xs text-muted-foreground/50">·</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.dueTime}
                </span>
              </>
            )}
            {overdue && !task.completed && (
              <>
                <span className="text-xs text-muted-foreground/50">·</span>
                <span className="text-xs text-red-500 font-medium">Overdue</span>
              </>
            )}
            {task.completed && task.completedAt && (
              <>
                <span className="text-xs text-muted-foreground/50">·</span>
                <span className="text-xs text-muted-foreground">{formatRelativeTime(task.completedAt)}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TaskEditDialog task={task} open={editOpen} onOpenChange={setEditOpen} />
      <TaskDetailDialog
        task={task}
        topic={topic}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
