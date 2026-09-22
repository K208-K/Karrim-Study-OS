'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Task, Topic } from '@/types';

interface TaskDetailDialogProps {
  task: Task;
  topic?: Topic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ task, topic, open, onOpenChange }: TaskDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">Topic</h3>
            <p className="text-sm">{topic?.name || 'No topic assigned.'}</p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {task.description || 'No description available.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}