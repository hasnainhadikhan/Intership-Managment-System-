import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Calendar, 
  FileText, 
  BarChart3, 
  LogOut,
  User,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  LogIn,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/utils';

// ─── nav config ──────────────────────────────────────────────────────────────

const adminLinks = [
  { name: 'Dashboard',   icon: LayoutDashboard, path: '/admin/dashboard'   },
  { name: 'Interns',     icon: Users,           path: '/admin/interns'     },
  { name: 'Tasks',       icon: CheckSquare,     path: '/admin/tasks'       },
  { name: 'Attendance',  icon: Calendar,        path: '/admin/attendance'  },
  { name: 'Submissions', icon: FileText,        path: '/admin/submissions' },
  { name: 'Reports',     icon: BarChart3,       path: '/admin/reports'     },
];

const internLinks = [
  { name: 'My Dashboard', icon: LayoutDashboard, path: '/intern/dashboard' },
  { name: 'My Tasks',     icon: CheckSquare,     path: '/intern/tasks'     },
  {
    name: 'Attendance',
    icon: Calendar,
    // no path — it's a group
    children: [
      { name: 'Attendance',   icon: Calendar, path: '/intern/attendance'  },
      { name: 'Check In/Out', icon: LogIn,    path: '/intern/checkinout'  },
    ],
  },
  { name: 'Submit Work', icon: FileText, path: '/intern/submit'   },
  { name: 'Profile',     icon: User,     path: '/intern/profile'  },
];

// ─── NavItem ─────────────────────────────────────────────────────────────────

const NavItem = ({ link, collapsed }) => {
  const location = useLocation();

  // Group item with children
  if (link.children) {
    const isGroupActive = link.children.some((c) => location.pathname === c.path);
    const [open, setOpen] = useState(isGroupActive);

    return (
      <div>
        <button
          onClick={() => !collapsed && setOpen((o) => !o)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium group relative',
            isGroupActive
              ? 'bg-indigo-50 text-indigo-700 font-bold'
              : 'text-slate-600 hover:bg-slate-50',
          )}
        >
          {/* Active indicator */}
          {isGroupActive && (
            <div className="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full" />
          )}

          <link.icon className={cn(
            'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
            collapsed ? 'mx-auto' : '',
          )} />

          {!collapsed && (
            <>
              <span className="truncate flex-1 text-left">{link.name}</span>
              <ChevronDown className={cn(
                'w-4 h-4 text-slate-400 transition-transform duration-200',
                open ? 'rotate-180' : '',
              )} />
            </>
          )}
        </button>

        {/* Sub-items */}
        {!collapsed && open && (
          <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-slate-100 pl-3">
            {link.children.map((child) => {
              const isActive = location.pathname === child.path;
              return (
                <NavLink
                  key={child.path}
                  to={child.path}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 text-sm',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-500 hover:bg-slate-50 font-medium',
                  )}
                >
                  <child.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{child.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Regular link
  return (
    <NavLink
      to={link.path}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
        isActive
          ? 'bg-indigo-50 text-indigo-700 font-bold'
          : 'text-slate-600 hover:bg-slate-50 font-medium',
      )}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full" />
          )}
          <link.icon className={cn(
            'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
            collapsed ? 'mx-auto' : '',
          )} />
          {!collapsed && <span className="truncate flex-1">{link.name}</span>}
        </>
      )}
    </NavLink>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin  = user?.role === 'admin' || user?.role === 'lead';
  const links    = isAdmin ? adminLinks : internLinks;

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-100 transition-all duration-300 hidden lg:flex flex-col',
      collapsed ? 'w-20' : 'w-64',
    )}>

      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-100 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none">InternTrack</p>
              <p className="text-[10px] text-slate-400 font-medium">Management System</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm z-50 transition-colors"
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft  className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* Section labels + nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-6">

        {/* OVERVIEW */}
        <div>
          {!collapsed && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2">
              Overview
            </p>
          )}
          <nav className="space-y-0.5">
            {links.filter(l => ['My Dashboard', 'Dashboard'].includes(l.name)).map((link) => (
              <NavItem key={link.name} link={link} collapsed={collapsed} />
            ))}
          </nav>
        </div>

        {/* WORK */}
        <div>
          {!collapsed && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2">
              Work
            </p>
          )}
          <nav className="space-y-0.5">
            {links
              .filter(l => ['My Tasks', 'Tasks', 'Submit Work', 'Interns', 'Submissions', 'Reports'].includes(l.name))
              .map((link) => (
                <NavItem key={link.name} link={link} collapsed={collapsed} />
              ))}
          </nav>
        </div>

        {/* ATTENDANCE */}
        <div>
          {!collapsed && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2">
              Attendance
            </p>
          )}
          <nav className="space-y-0.5">
            {links
              .filter(l => l.name === 'Attendance')
              .map((link) => (
                <NavItem key={link.name} link={link} collapsed={collapsed} />
              ))}
          </nav>
        </div>

        {/* ACCOUNT */}
        <div>
          {!collapsed && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2">
              Account
            </p>
          )}
          <nav className="space-y-0.5">
            {links.filter(l => l.name === 'Profile').map((link) => (
              <NavItem key={link.name} link={link} collapsed={collapsed} />
            ))}
          </nav>
        </div>

      </div>

      {/* User footer */}
      <div className="p-4 border-t border-slate-100">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-50 rounded-2xl">
            <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate leading-none mb-0.5">{user?.name}</p>
              <p className="text-[10px] font-medium text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)}
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 w-full text-left text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200 font-medium text-sm',
            collapsed ? 'justify-center' : '',
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;