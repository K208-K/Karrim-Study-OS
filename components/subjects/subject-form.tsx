'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/lib/data-context';

const ICONS = [
  'Brain', 'Code2', 'Database', 'BarChart3', 'Sigma', 'Binary',
  'BookOpen', 'Calculator', 'FlaskConical', 'Globe', 'Atom',
  'LineChart', 'Cpu', 'Layers', 'PenTool', 'FunctionSquare',
];

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16',
  '#f97316', '#6366f1', '#14b8a6', '#a855f7',
];

interface SubjectFormProps {
  initial?: Partial<{ id: string; name: string; description: string; icon: string; color: string }>;
  onSaved?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function SubjectForm({ initial, onSaved, onCancel, submitLabel = 'Add Subject' }: SubjectFormProps) {
  const { addSubject, updateSubject } = useData();
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [icon, setIcon] = useState(initial?.icon || 'BookOpen');
  const [color, setColor] = useState(initial?.color || COLORS[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Subject name is required'); return; }
    if (initial?.id) {
      updateSubject(initial.id, { name: name.trim(), description: description.trim(), icon, color });
    } else {
      addSubject({ name: name.trim(), description: description.trim(), icon, color });
    }
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject-name">Subject Name</Label>
        <Input
          id="subject-name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          placeholder="e.g. Machine Learning"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject-desc">Description (optional)</Label>
        <Textarea
          id="subject-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this subject about?"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="grid grid-cols-8 gap-2">
          {ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                icon === ic
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <span className="text-sm">{getIconEmoji(ic)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Accent Color</Label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full transition-all ${
                color === c ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

function getIconEmoji(icon: string): string {
  const map: Record<string, string> = {
    Brain: '🧠', Code2: '💻', Database: '🗄', BarChart3: '📊',
    Sigma: 'Σ', Binary: '01', BookOpen: '📚', Calculator: '🧮',
    FlaskConical: '⚗', Globe: '🌐', Atom: '⚛', LineChart: '📈',
    Cpu: '🖥', Layers: '🗂', PenTool: '✏', FunctionSquare: 'ƒ',
  };
  return map[icon] || '📚';
}
