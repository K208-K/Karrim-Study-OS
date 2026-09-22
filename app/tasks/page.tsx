'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { useQuickAdd } from '@/components/layout/quick-add-provider';
import { TaskItem } from '@/components/tasks/task-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { todayISO, isOverdue, isUpcoming } from '@/lib/date';
import { Search, Plus, CheckSquare } from 'lucide-react';
import type { Priority } from '@/types';

type FilterTab = 'all' | 'today' | 'upcoming' | 'completed' | 'overdue' | 'high';

export default function TasksPage() {
  const { data } = useData();
  const { openQuickAdd } = useQuickAdd();
  const [tab, setTab] = useState<FilterTab>('today');
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filtered = useMemo(() => {
    let tasks = data.tasks;

    switch (tab) {
      case 'today':
        tasks = tasks.filter((t) => t.dueDate === todayISO());
        break;
      case 'upcoming':
        tasks = tasks.filter(isUpcoming);
        break;
      case 'completed':
        tasks = tasks.filter((t) => t.completed);
        break;
      case 'overdue':
        tasks = tasks.filter(isOverdue);
        break;
      case 'high':
        tasks = tasks.filter((t) => t.priority === 'high' && !t.completed);
        break;
      default:
        break;
    }

    if (subjectFilter !== 'all') {
      tasks = tasks.filter((t) => t.subjectId === subjectFilter);
    }
    if (priorityFilter !== 'all') {
      tasks = tasks.filter((t) => t.priority === priorityFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(q));
    }

    return tasks.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const pri: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
      return pri[a.priority] - pri[b.priority];
    });
  }, [data.tasks, tab, subjectFilter, priorityFilter, search]);

  const counts = useMemo(() => ({
    all: data.tasks.length,
    today: data.tasks.filter((t) => t.dueDate === todayISO()).length,
    upcoming: data.tasks.filter(isUpcoming).length,
    completed: data.tasks.filter((t) => t.completed).length,
    overdue: data.tasks.filter(isOverdue).length,
    high: data.tasks.filter((t) => t.priority === 'high' && !t.completed).length,
  }), [data.tasks]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your study tasks and deadlines.</p>
        </div>
        <Button onClick={openQuickAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
        <TabsList className="flex h-auto flex-wrap gap-1 bg-muted p-1">
          <TabsTrigger value="today" className="text-xs">Today ({counts.today})</TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs">Upcoming ({counts.upcoming})</TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs">Overdue ({counts.overdue})</TabsTrigger>
          <TabsTrigger value="high" className="text-xs">High Priority ({counts.high})</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">Completed ({counts.completed})</TabsTrigger>
          <TabsTrigger value="all" className="text-xs">All ({counts.all})</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {data.subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card p-10 text-center">
              <CheckSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No tasks here.</p>
              <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Time to add something new.</p>
              <Button onClick={openQuickAdd} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
