import React from 'react';
import { cn } from '../../utils/utils';

const StatusBadge = ({ status }) => {
  const variants = {
    pending: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    reviewed: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    inactive: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    late: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    absent: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    present: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };

  const labels = {
    in_progress: "In Progress",
    read_all: "Read All",
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
      variants[status] || variants.pending
    )}>
      {labels[status] || status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
