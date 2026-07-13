import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ChevronRight,
  Upload,
  AlertCircle,
} from 'lucide-react';
import api from '../../api/axios';
import { cn } from '../../utils/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

// ─── helpers ────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', dot: 'bg-red-500',    text: 'text-red-500',    badge: 'text-red-500'    },
  high:   { label: 'High',   dot: 'bg-orange-400', text: 'text-orange-500', badge: 'text-orange-500' },
  medium: { label: 'Medium', dot: 'bg-yellow-400', text: 'text-yellow-600', badge: 'text-yellow-600' },
  low:    { label: 'Low',    dot: 'bg-slate-400',  text: 'text-slate-500',  badge: 'text-slate-500'  },
};

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     dot: 'bg-slate-400',  bg: 'bg-slate-100',   text: 'text-slate-500'  },
  in_progress: { label: 'In Progress', dot: 'bg-indigo-500', bg: 'bg-indigo-50',   text: 'text-indigo-600' },
  completed:   { label: 'Completed',   dot: 'bg-green-500',  bg: 'bg-green-50',    text: 'text-green-600'  },
  reviewed:    { label: 'Reviewed',    dot: 'bg-purple-500', bg: 'bg-purple-50',   text: 'text-purple-600' },
};

const PriorityDot = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  return (
    <span className={cn('flex items-center gap-1.5 text-xs font-semibold', cfg.badge)}>
      <span className={cn('w-2 h-2 rounded-full inline-block', cfg.dot)} />
      {cfg.label}
    </span>
  );
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={cn(
      'flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full',
      cfg.bg, cfg.text
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full inline-block', cfg.dot)} />
      {cfg.label}
    </span>
  );
};

const PRIORITY_BORDER = {
  urgent: 'border-l-red-500',
  high:   'border-l-orange-400',
  medium: 'border-l-yellow-400',
  low:    'border-l-slate-300',
};

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── Draggable Progress Slider ───────────────────────────────────────────────

const ProgressSlider = ({ value, onChange }) => {
  const trackRef = useRef(null);
  const dragging = useRef(false);

  const calcValue = useCallback((clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round(pct * 100);
  }, []);

  const onMouseDown = (e) => {
    dragging.current = true;
    onChange(calcValue(e.clientX));

    const onMove = (ev) => { if (dragging.current) onChange(calcValue(ev.clientX)); };
    const onUp   = ()   => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp,   { once: true });
    window.addEventListener('mouseup',   () => window.removeEventListener('mousemove', onMove), { once: true });
  };

  const onTouchStart = (e) => {
    const onMove = (ev) => onChange(calcValue(ev.touches[0].clientX));
    const onEnd  = ()   => { window.removeEventListener('touchmove', onMove); };
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend',  onEnd, { once: true });
    onChange(calcValue(e.touches[0].clientX));
  };

  return (
    <div className="space-y-1 select-none">
      {/* Thumb track */}
      <div
        ref={trackRef}
        className="relative h-2 bg-slate-200 rounded-full cursor-pointer"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div
          className="absolute left-0 top-0 h-full bg-indigo-600 rounded-full pointer-events-none"
          style={{ width: `${value}%` }}
        />
        {/* Thumb circle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-600 rounded-full shadow border-2 border-white pointer-events-none"
          style={{ left: `${value}%` }}
        />
      </div>
      {/* Second thin decorative track below (matches screenshot) */}
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-300 rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

// ─── Task Detail Panel ───────────────────────────────────────────────────────

const TaskDetailPanel = ({ task, progress, onProgressChange, onClose, onSubmit }) => {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        key="panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5">
          <h2 className="text-lg font-bold text-slate-900">Task details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 mx-6" />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityDot priority={task.priority} />
            <StatusPill status={task.status} />
          </div>

          {/* Title + description */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-snug">{task.title}</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{task.description}</p>
          </div>

          {/* Deadline / Created */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-medium mb-1">Deadline</p>
              <p className="text-sm font-semibold text-slate-800">{fmt(task.deadline)}</p>
            </div>
            {task.created_at && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-medium mb-1">Created</p>
                <p className="text-sm font-semibold text-slate-800">{fmt(task.created_at)}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700">Progress</p>
              <p className="text-sm font-bold text-indigo-600">{progress}%</p>
            </div>
            <ProgressSlider value={progress} onChange={onProgressChange} />
          </div>
        </div>

        {/* Submit button */}
        {(task.status === 'in_progress' || task.status === 'pending') && (
          <div className="px-6 pb-6 pt-2">
            <button
              onClick={onSubmit}
              className="w-full h-12 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Submit work
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
};

// ─── Task Card ───────────────────────────────────────────────────────────────

const TaskCard = ({ task, progress, onClick }) => {
  const border = PRIORITY_BORDER[task.priority] || 'border-l-slate-300';

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-slate-100 border-l-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-5 flex flex-col gap-3',
        border,
      )}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900 text-[15px] leading-snug line-clamp-2 flex-1">
          {task.title}
        </h3>
        <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{task.description}</p>

      {/* Badges + deadline */}
      <div className="flex items-center gap-2 flex-wrap">
        <PriorityDot priority={task.priority} />
        <StatusPill status={task.status} />
        <span className="text-xs text-slate-400 font-medium ml-auto">
          Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400 font-medium">Progress</span>
          <span className="text-xs font-bold text-slate-700">{progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Filter Tabs ─────────────────────────────────────────────────────────────

const TABS = [
  { id: 'all',         label: 'All'         },
  { id: 'pending',     label: 'Pending'     },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed',   label: 'Completed'   },
  { id: 'reviewed',    label: 'Reviewed'    },
];

// ─── MyTasksPage ─────────────────────────────────────────────────────────────

const MyTasksPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter]           = useState('all');
  const [search, setSearch]           = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  // local progress overrides: { [taskId]: number }
  const [progressMap, setProgressMap] = useState({});

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: async () => {
      const response = await api.get('/my/tasks');
      return response.data.data;
    },
  });

  const tasks = tasksData || [];

  const getProgress = (task) =>
    progressMap[task.id] !== undefined ? progressMap[task.id] : task.progress;

  const counts = TABS.reduce((acc, tab) => {
    acc[tab.id] = tab.id === 'all'
      ? tasks.length
      : tasks.filter((t) => t.status === tab.id).length;
    return acc;
  }, {});

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || task.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleProgressChange = (taskId, val) => {
    setProgressMap((prev) => ({ ...prev, [taskId]: val }));
    // If you want to persist: api.patch(`/tasks/${taskId}`, { progress: val })
  };

  return (
    <div className="min-h-screen bg-slate-50/70">
      <div className="max-w-5xl mx-auto px-8 py-8 space-y-6">

        {/* Breadcrumb + header */}
        <div>
          <p className="text-xs text-slate-400 font-medium mb-2">
            Intern&nbsp;<span className="mx-1">/</span>&nbsp;My Tasks
          </p>
          <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
          <p className="text-sm text-slate-400 mt-0.5">{tasks.length} tasks assigned to you</p>
        </div>

        {/* Filter tabs row */}
        <div className="flex items-center gap-2 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150',
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200',
              )}
            >
              {tab.label}
              <span className={cn(
                'text-xs font-bold',
                filter === tab.id ? 'text-indigo-200' : 'text-slate-300',
              )}>
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* 2-column task grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-2xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mb-4" />
            <h3 className="font-bold text-slate-800">No tasks found</h3>
            <p className="text-slate-400 text-sm mt-1">Try clearing your filters or search.</p>
            <button
              className="mt-6 px-6 py-2 rounded-full border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              onClick={() => { setFilter('all'); setSearch(''); }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <TaskCard
                  task={task}
                  progress={getProgress(task)}
                  onClick={() => setSelectedTask(task)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailPanel
            key={selectedTask.id}
            task={selectedTask}
            progress={getProgress(selectedTask)}
            onProgressChange={(val) => handleProgressChange(selectedTask.id, val)}
            onClose={() => setSelectedTask(null)}
            onSubmit={() => {
              setSelectedTask(null);
              navigate('/intern/submit');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyTasksPage;