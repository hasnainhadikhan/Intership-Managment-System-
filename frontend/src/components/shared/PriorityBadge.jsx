import React from 'react';
import { cn } from '../../utils/utils';

const PriorityBadge = ({ priority }) => {
  const variants = {
    low: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800",
    medium: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10",
    high: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10",
    urgent: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/10",
  };

  const dots = {
    low: "bg-slate-400",
    medium: "bg-amber-400",
    high: "bg-orange-400",
    urgent: "bg-rose-400",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium capitalize",
      variants[priority] || variants.medium
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dots[priority] || dots.medium)}></span>
      {priority}
    </span>
  );
};

export default PriorityBadge;
