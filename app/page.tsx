'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useData } from '@/lib/data-context';
import { useQuickAdd } from '@/components/layout/quick-add-provider';

import {
  getGreeting,
  formatFullDate,
  formatDuration,
  getDayLabel,
} from '@/lib/date';

import {
  getTodayProgress,
  getStreak,
  getWeeklyStudyTime,
  getStreakDays,
} from '@/lib/analytics';

import { Progress } from '@/components/ui/progress';
import { TaskItem } from '@/components/tasks/task-item';

import {
  Flame,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Sparkles,
  Plus,
  Zap,
} from 'lucide-react';

const QUOTES = [
  'Consistency compounds.',
  'Build knowledge. One concept at a time.',
  'Every expert was once a beginner.',
  'Progress over perfection.',
  'The best time to start was yesterday.',
  'Small steps, big distance.',
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

export default function DashboardPage() {
  const { data } = useData();
  const { openQuickAdd } = useQuickAdd();
  const [activeStat, setActiveStat] = useState<string | null>(null);

  // ==========================================
  // HEADER
  // ==========================================
  const greeting = getGreeting();
  const date = formatFullDate();

  const quote = useMemo(
    () => QUOTES[new Date().getDate() % QUOTES.length],
    []
  );

  // ==========================================
  // ANALYTICS DATA
  // ==========================================
  const todayProgress = getTodayProgress(data.tasks);
  const streak = getStreak(data.tasks);
  const weeklyMinutes = getWeeklyStudyTime(data.studySessions);
  const streakDays = getStreakDays(data.tasks);

  // ==========================================
  // TODAY'S TASKS
  // ==========================================
  const todayTasks = useMemo(() => {
    return data.tasks
      .filter(
        (task) =>
          task.dueDate === new Date().toISOString().slice(0, 10)
      )
      .sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        const priority = { high: 0, medium: 1, low: 2 };
        return priority[a.priority] - priority[b.priority];
      });
  }, [data.tasks]);

  // ==========================================
  // TASK COUNTS
  // ==========================================
  const pendingCount = data.tasks.filter((task) => !task.completed).length;
  const completedCount = data.tasks.filter((task) => task.completed).length;

  // ==========================================
  // STATISTICS CONFIG
  // ==========================================
  const stats = [
    {
      id: 'today',
      label: "Today's Tasks",
      value: todayProgress.total,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'hover:border-blue-500/50',
      glowColor: 'rgba(59, 130, 246, 0.15)',
    },
    {
      id: 'completed',
      label: 'Completed',
      value: completedCount,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'hover:border-emerald-500/50',
      glowColor: 'rgba(16, 185, 129, 0.15)',
    },
    {
      id: 'pending',
      label: 'Pending',
      value: pendingCount,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'hover:border-amber-500/50',
      glowColor: 'rgba(245, 158, 11, 0.15)',
    },
    {
      id: 'streak',
      label: 'Streak',
      value: `${streak}d`,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'hover:border-orange-500/50',
      glowColor: 'rgba(249, 115, 22, 0.15)',
    },
    {
      id: 'weekly',
      label: 'Weekly Time',
      value: formatDuration(weeklyMinutes),
      icon: TrendingUp,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'hover:border-indigo-500/50',
      glowColor: 'rgba(99, 102, 241, 0.15)',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-1"
    >
      {/* ==================================================
          1. HEADER WITH INTERACTIVE HOVER & GRADIENT TEXT
      ================================================== */}
      <motion.div variants={itemVariants} className="relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            <Zap className="h-5 w-5 text-amber-500 fill-amber-500/20" />
          </motion.div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {date}
          </span>
        </div>

        <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
          {greeting}, {data.settings.userName}
        </h1>

        <motion.p
          whileHover={{ x: 5 }}
          className="font-display text-sm text-muted-foreground italic mt-2 flex items-center gap-2 cursor-pointer select-none"
        >
          <Sparkles className="h-4 w-4 text-amber-400 inline" />
          &ldquo;{quote}&rdquo;
        </motion.p>
      </motion.div>

      {/* ==================================================
          2. ANIMATED CARDS STATISTICS GRID
      ================================================== */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-5 gap-3"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isSelected = activeStat === stat.id;

          return (
            <motion.div
              key={stat.id}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveStat(isSelected ? null : stat.id)}
              className={`
                relative cursor-pointer overflow-hidden rounded-2xl border p-4
                transition-colors duration-300 bg-card/60 backdrop-blur-md
                ${stat.borderColor}
                ${isSelected ? 'ring-2 ring-primary border-transparent' : 'border-border'}
              `}
              style={{
                boxShadow: isSelected ? `0 10px 25px -5px ${stat.glowColor}` : undefined,
              }}
            >
              {/* Animated Background Glow on Active/Hover */}
              <div
                className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none ${stat.bgColor}`}
              />

              <div className="relative z-10 flex items-center gap-2.5 mb-3">
                <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {stat.label}
                </span>
              </div>

              <div className="relative z-10 flex items-baseline justify-between">
                <motion.p
                  key={stat.value}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-2xl font-bold tracking-tight"
                >
                  {stat.value}
                </motion.p>

                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-2 w-2 rounded-full bg-primary"
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ==================================================
          3. TODAY'S FOCUS TASK SECTION
      ================================================== */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-bold tracking-tight">
              Today&apos;s Focus
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {todayTasks.length}
            </span>
          </div>

          <motion.button
            type="button"
            onClick={openQuickAdd}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
              bg-primary text-primary-foreground text-xs font-semibold
              shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30
              transition-all duration-200
            "
          >
            <Plus className="h-3.5 w-3.5" />
            Add task
          </motion.button>
        </div>

        {/* Dynamic Task List or Empty State */}
        <AnimatePresence mode="wait">
          {todayTasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="
                rounded-2xl border-2 border-dashed border-border/60
                bg-card/40 backdrop-blur-sm p-10 text-center
                flex flex-col items-center justify-center space-y-3
              "
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="p-3 rounded-2xl bg-amber-500/10 text-amber-500"
              >
                <Sparkles className="h-8 w-8" />
              </motion.div>

              <div>
                <p className="font-semibold text-foreground text-base">
                  All caught up! No tasks for today.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Take a break or add a new goal to keep your streak going.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="list" className="space-y-2.5">
              {todayTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 2 }}
                  className="transition-all duration-200"
                >
                  <TaskItem task={task} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ==================================================
          4. TODAY'S PROGRESS BAR
      ================================================== */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -2 }}
        className="
          rounded-2xl border border-border bg-card/60 backdrop-blur-md p-6
          shadow-sm transition-all duration-300 relative overflow-hidden
        "
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Today&apos;s Progress
            </h2>
          </div>

          <span className="text-sm font-semibold">
            {todayProgress.completed} / {todayProgress.total} completed
          </span>
        </div>

        <div className="relative">
          <Progress value={todayProgress.pct} className="h-3 rounded-full" />
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>{todayProgress.pct}% complete</span>
          {todayProgress.pct === 100 && (
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              🎉 Perfect Score!
            </span>
          )}
        </div>
      </motion.div>

      {/* ==================================================
          5. STREAK TRACKER
      ================================================== */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -2 }}
        className="
          rounded-2xl border border-border bg-card/60 backdrop-blur-md p-6
          shadow-sm transition-all duration-300
        "
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="p-2 rounded-xl bg-orange-500/10 text-orange-500"
            >
              <Flame className="h-5 w-5 fill-orange-500" />
            </motion.div>
            <div>
              <h2 className="font-display text-lg font-bold">
                {streak} Day Streak
              </h2>
              <p className="text-xs text-muted-foreground">
                Keep active daily to build your learning habit
              </p>
            </div>
          </div>
        </div>

        {/* Streak Days Bar */}
        <div className="flex gap-2">
          {streakDays.map((day, idx) => (
            <motion.div
              key={day.date}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.08 }}
              className="flex flex-col items-center gap-2 flex-1 cursor-pointer"
            >
              <div
                className={`
                  h-12 w-full rounded-xl transition-all duration-300 relative overflow-hidden
                  ${
                    day.active
                      ? 'bg-gradient-to-t from-orange-600 to-amber-400 shadow-md shadow-orange-500/20'
                      : 'bg-muted/60 hover:bg-muted'
                  }
                `}
              >
                {day.active && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </div>

              <span className="text-[11px] font-medium text-muted-foreground">
                {getDayLabel(day.date)}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}