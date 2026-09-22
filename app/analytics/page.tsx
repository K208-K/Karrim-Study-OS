'use client';

import { useMemo } from 'react';
import { useData } from '@/lib/data-context';
import {
  getStreak,
  getWeeklyActivity,
  getWeeklyStudyTime,
  getStudyTimeBySubject,
  getMostStudiedSubject,
} from '@/lib/analytics';
import { formatDuration, getDayLabel } from '@/lib/date';
import { Flame, Clock, TrendingUp, BookOpen } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export default function AnalyticsPage() {
  const { data } = useData();

  const streak = getStreak(data.tasks);
  const weeklyActivity = useMemo(() => getWeeklyActivity(data.tasks), [data.tasks]);
  const weeklyMinutes = getWeeklyStudyTime(data.studySessions);
  const studyBySubject = useMemo(() => getStudyTimeBySubject(data.studySessions), [data.studySessions]);
  const mostStudied = getMostStudiedSubject(data);

  const chartData = weeklyActivity.map((a) => ({
    name: getDayLabel(a.day),
    Completed: a.completed,
    Created: a.created,
  }));

  const pieData = studyBySubject
    .filter((s) => s.minutes > 0)
    .map((s) => {
      const subject = data.subjects.find((sub) => sub.id === s.subjectId);
      return { name: subject?.name || 'Unknown', value: s.minutes };
    });

  const totalCompleted = data.tasks.filter((t) => t.completed).length;
  const totalCreated = data.tasks.length;
  const completionRate = totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0;

  const mostStudiedSubject = mostStudied ? data.subjects.find((s) => s.id === mostStudied.subjectId) : null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Your study patterns and productivity trends.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-medium text-muted-foreground">Current Streak</span>
          </div>
          <p className="font-display text-2xl font-bold">{streak} <span className="text-sm font-normal text-muted-foreground">days</span></p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-chart-2" />
            <span className="text-xs font-medium text-muted-foreground">Weekly Study Time</span>
          </div>
          <p className="font-display text-2xl font-bold">{formatDuration(weeklyMinutes)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-chart-1" />
            <span className="text-xs font-medium text-muted-foreground">Completion Rate</span>
          </div>
          <p className="font-display text-2xl font-bold">{completionRate}%</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-chart-3" />
            <span className="text-xs font-medium text-muted-foreground">Most Studied</span>
          </div>
          <p className="font-display text-lg font-bold truncate">{mostStudiedSubject?.name || '—'}</p>
        </div>
      </div>

      {/* Weekly activity chart */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-display text-base font-semibold mb-4">Weekly Activity</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="Completed" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Created" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} maxBarSize={32} opacity={0.5} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-chart-1" /> Completed</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-chart-2 opacity-50" /> Created</span>
        </div>
      </div>

      {/* Study time by subject */}
      {pieData.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-base font-semibold mb-4">Study Time by Subject</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => formatDuration(value)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {item.name}
                  </span>
                  <span className="text-muted-foreground">{formatDuration(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {data.tasks.length === 0 && data.studySessions.length === 0 && (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center">
          <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No analytics data yet.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Complete tasks and log study time to see your stats.</p>
        </div>
      )}
    </div>
  );
}
