'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/lib/data-context';

interface NoteFormProps {
  initial?: Partial<{ topicId: string; content: string }>;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function NoteForm({ initial, onSaved, onCancel }: NoteFormProps) {
  const { data, upsertNote } = useData();
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState(initial?.topicId || '');
  const [content, setContent] = useState(initial?.content || '');

  const topics = data.topics.filter((t) => t.subjectId === subjectId);

  useEffect(() => {
    if (topicId) {
      const topic = data.topics.find((t) => t.id === topicId);
      if (topic) setSubjectId(topic.subjectId);
    }
  }, [topicId, data.topics]);

  const handleSave = () => {
    if (!topicId || !content.trim()) return;
    upsertNote(topicId, content.trim());
    onSaved?.();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Subject</Label>
          <Select
            value={subjectId}
            onValueChange={(v) => { setSubjectId(v); setTopicId(''); }}
          >
            <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
            <SelectContent>
              {data.subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Topic</Label>
          <Select value={topicId} onValueChange={setTopicId} disabled={!subjectId}>
            <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
            <SelectContent>
              {topics.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note-content">Note Content</Label>
        <Textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your notes here..."
          rows={10}
          className="font-mono text-sm leading-relaxed"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="button" onClick={handleSave} disabled={!topicId || !content.trim()}>
          Save Note
        </Button>
      </div>
    </div>
  );
}
