'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useData } from '@/lib/data-context';

interface TopicFormProps {
  initial?: Partial<{ id: string; subjectId: string; name: string }>;
  onSaved?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function TopicForm({ initial, onSaved, onCancel, submitLabel = 'Add Topic' }: TopicFormProps) {
  const { data, addTopic, updateTopic } = useData();
  const [name, setName] = useState(initial?.name || '');
  const [subjectId, setSubjectId] = useState(initial?.subjectId || data.subjects[0]?.id || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Topic name is required'); return; }
    if (!subjectId) { setError('Please select a subject'); return; }
    if (initial?.id) {
      updateTopic(initial.id, { name: name.trim() });
    } else {
      addTopic({ subjectId, name: name.trim() });
    }
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Subject</Label>
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
          <SelectContent>
            {data.subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic-name">Topic Name</Label>
        <Input
          id="topic-name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          placeholder="e.g. Linear Regression"
          autoFocus
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
