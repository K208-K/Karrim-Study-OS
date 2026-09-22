'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useData } from '@/lib/data-context';
import type { Priority } from '@/types';
import { todayISO } from '@/lib/date';

interface TaskFormProps {
  initial?: Partial<{
    id: string;
    title: string;
    description: string;
    subjectId: string;
    topicId: string;
    priority: Priority;
    dueDate: string | null;
    dueTime: string | null;
  }>;
  onSaved?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function TaskForm({ initial, onSaved, onCancel, submitLabel = 'Add Task' }: TaskFormProps) {
  const { data, addTask, updateTask } = useData();
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [subjectId, setSubjectId] = useState(initial?.subjectId || data.subjects[0]?.id || '');
  const [topicId, setTopicId] = useState(initial?.topicId || '');
  const [priority, setPriority] = useState<Priority>(initial?.priority || data.settings.defaultPriority);
  const [dueDate, setDueDate] = useState<string>(initial?.dueDate || todayISO());
  const [dueTime, setDueTime] = useState<string>(initial?.dueTime || '');
  const [error, setError] = useState('');

  const topics = data.topics.filter((t) => t.subjectId === subjectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Task title is required'); return; }
    if (!subjectId) { setError('Please select a subject'); return; }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      subjectId,
      topicId,
      priority,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
    };

    if (initial && initial.id) {
      updateTask(initial.id, payload);
    } else {
      addTask(payload);
    }
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task-title">Task Title</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(''); }}
          placeholder="What needs to be done?"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-desc">Description (optional)</Label>
        <Textarea
          id="task-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Subject</Label>
          <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); setTopicId(''); }}>
            <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
            <SelectContent>
              {data.subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Topic (optional)</Label>
          <Select value={topicId} onValueChange={setTopicId} disabled={!subjectId || topics.length === 0}>
            <SelectTrigger><SelectValue placeholder={topics.length === 0 ? 'No topics' : 'Select topic'} /></SelectTrigger>
            <SelectContent>
              {topics.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-date">Due Date</Label>
          <Input
            id="task-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-time">Due Time (optional)</Label>
        <Input
          id="task-time"
          type="time"
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
