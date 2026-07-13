import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Calendar, 
  FileText, 
  BarChart3, 
  User, 
  LogOut,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/utils';

const MobileSidebar = ({ open, setOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Interns', icon: Users, path: '/admin/interns' },
    { name: 'Tasks', icon: CheckSquare, path: '/admin/tasks' },
    { name: 'Attendance', icon: Calendar, path: '/admin/attendance' },
    { name: 'Submissions', icon: FileText, path: '/admin/submissions' },
    { name: 'Reports', icon: BarChart3, path: '/admin/reports' },
  ];

  const internLinks = [
    { name: 'My Dashboard', icon: LayoutDashboard, path: '/intern/dashboard' },
    { name: 'My Tasks', icon: CheckSquare, path: '/intern/tasks' },
    { name: 'Attendance', icon: Calendar, path: '/intern/attendance' },
    { name: 'Submit Work', icon: FileText, path: '/intern/submit' },
    { name: 'Profile', icon: User, path: '/intern/profile' },
  ];

  const links = user?.role === 'admin' || user?.role === 'lead' ? adminLinks : internLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-50 lg:hidden flex flex-col shadow-2xl"
          >
            <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">IMS</span>
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-1">
                {links.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                      isActive 
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
                  {user?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs font-medium text-slate-500 truncate capitalize">{user?.role}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all duration-200 font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
