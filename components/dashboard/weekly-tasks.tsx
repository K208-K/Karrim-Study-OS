'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CalendarDays, Plus } from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useQuickAdd } from '@/components/layout/quick-add-provider';
import { TaskItem } from '@/components/tasks/task-item';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Task } from '@/types';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function mondayOf(date: Date): Date {
  const monday = new Date(date);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(12, 0, 0, 0);
  return monday;
}

function formatDate(date: Date, options: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString('en-US', options);
}

function sortTasks(tasks: Task[]): Task[] {
  const priority = { high: 0, medium: 1, low: 2 };
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return priority[a.priority] - priority[b.priority];
  });
}

export function WeeklyTasks() {
  const { data } = useData();
  const { openQuickAdd } = useQuickAdd();
  const todayKey = localDateKey(new Date());
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const days = useMemo(() => DAY_NAMES.map((name, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const dateKey = localDateKey(date);
    const tasks = data.tasks.filter((task) => task.dueDate === dateKey);
    return {
      name,
      shortName: name.slice(0, 3),
      date,
      dateKey,
      tasks,
      completed: tasks.filter((task) => task.completed).length,
    };
  }), [data.tasks, weekStart]);

  const selectedDay = days.find((day) => day.dateKey === selectedDate) || days[0];
  const isCurrentWeek = localDateKey(weekStart) === localDateKey(mondayOf(new Date()));

  const changeWeek = (amount: number) => {
    const nextWeek = new Date(weekStart);
    nextWeek.setDate(nextWeek.getDate() + amount * 7);
    setWeekStart(nextWeek);
    setSelectedDate(amount === 0 ? todayKey : localDateKey(nextWeek));
  };

  return (
    <Card className="overflow-hidden border-border/80 bg-card/60 backdrop-blur-md">
      <div className="border-b border-border/70 p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Plan your week</p>
            <h2 className="font-display text-xl font-bold tracking-tight">Weekly Tasks</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(weekStart, { month: 'long', day: 'numeric' })} - {formatDate(days[6].date, { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-1 self-start rounded-lg border border-border/70 p-1 sm:self-auto">
            <Button variant="ghost" size="icon" onClick={() => changeWeek(-1)} aria-label="Previous week">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant={isCurrentWeek ? 'secondary' : 'ghost'} size="sm" onClick={() => changeWeek(0)}>
              This week
            </Button>
            <Button variant="ghost" size="icon" onClick={() => changeWeek(1)} aria-label="Next week">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 snap-x">
          {days.map((day) => {
            const isSelected = day.dateKey === selectedDate;
            const isToday = day.dateKey === todayKey;
            const percentage = day.tasks.length ? (day.completed / day.tasks.length) * 100 : 0;
            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => setSelectedDate(day.dateKey)}
                aria-pressed={isSelected}
                className={`min-w-[104px] flex-1 snap-start rounded-xl border p-3 text-left transition-all sm:min-w-0 ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'border-border/70 bg-background/40 hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{day.shortName}</span>
                  {isToday && <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-primary-foreground' : 'text-primary'}`}>Today</span>}
                </div>
                <p className="mt-1 text-2xl font-bold">{day.date.getDate()}</p>
                <p className={`mt-2 text-xs font-semibold ${isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>{day.completed} / {day.tasks.length} complete</p>
                <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${isSelected ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                  <div className={`h-full rounded-full transition-all ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} style={{ width: `${percentage}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 md:p-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={selectedDay.dateKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-lg font-bold">{selectedDay.name}, {formatDate(selectedDay.date, { month: 'long', day: 'numeric' })}</p>
                <p className="text-sm text-muted-foreground">One focused task list for the selected day</p>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">{selectedDay.completed} / {selectedDay.tasks.length} complete</span>
            </div>

            {selectedDay.tasks.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-primary/70" />
                <p className="mt-3 font-semibold">No tasks scheduled</p>
                <p className="mt-1 text-sm text-muted-foreground">You don&apos;t have any tasks planned for this day.</p>
                <Button className="mt-4" size="sm" onClick={openQuickAdd}><Plus className="mr-1.5 h-4 w-4" /> Add task</Button>
              </div>
            ) : (
              <div className="mt-5 space-y-2">
                {sortTasks(selectedDay.tasks).map((task) => <TaskItem key={task.id} task={task} />)}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
}