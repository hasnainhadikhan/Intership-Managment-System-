import React from 'react';
import { motion } from 'framer-motion';
import { Layers, SearchX } from 'lucide-react';
import { Button } from '../ui/button';

const EmptyState = ({ 
  icon: Icon = Layers, 
  title = "No data found", 
  description = "There are no records to display at the moment.",
  actionText,
  onAction,
  className
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center py-32 px-6 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 ${className}`}
    >
      <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm">
        <Icon className="w-12 h-12 text-slate-300" />
      </div>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button 
          onClick={onAction}
          className="h-14 px-10 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-100 dark:shadow-none text-base active:scale-95 transition-all"
        >
          {actionText}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
