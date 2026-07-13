import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/utils';

const PageHeader = ({ title, description, children, breadcrumbs = [] }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="space-y-1">
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          <Link to="/" className="hover:text-indigo-600 transition-colors">
            <Home className="w-3.5 h-3.5" />
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              <ChevronRight className="w-3 h-3" />
              <Link 
                to={crumb.href} 
                className={cn(
                  "hover:text-indigo-600 transition-colors",
                  i === breadcrumbs.length - 1 ? "text-slate-900 dark:text-white" : ""
                )}
              >
                {crumb.name}
              </Link>
            </React.Fragment>
          ))}
        </nav>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
          {title}
        </h1>
        {description && (
          <p className="text-slate-500 font-medium max-w-2xl">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
