import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Play, 
  ArrowRight,
  Calendar,
  Timer,
  ExternalLink,
  ChevronRight,
  Zap,
  Coffee,
  Sun,
  Moon,
  CloudSun
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import PriorityBadge from '../../components/shared/PriorityBadge';
import Avatar from '../../components/shared/Avatar';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { cn } from '../../utils/utils';

const InternDashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionTime, setSessionTime] = useState('00:00:00');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: async () => {
      const response = await api.get('/my/tasks');
      return response.data.data;
    }
  });

  const { data: attendanceStatus, isLoading: attLoading } = useQuery({
    queryKey: ['checkin-status'],
    queryFn: async () => {
      const response = await api.get('/checkin/status');
      return response.data.data;
    }
  });

  useEffect(() => {
    if (attendanceStatus?.check_in && !attendanceStatus?.check_out) {
      const interval = setInterval(() => {
        const start = new Date(`${new Date().toDateString()} ${attendanceStatus.check_in}`);
        const now = new Date();
        const diff = now - start;
        
        const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        
        setSessionTime(`${hours}:${minutes}:${seconds}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [attendanceStatus]);

  const checkInMutation = useMutation({
    mutationFn: () => api.post('/checkin'),
    onSuccess: () => {
      queryClient.invalidateQueries(['checkin-status']);
      toast.success('Shift started! Have a productive day.');
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: () => api.post('/checkout'),
    onSuccess: () => {
      queryClient.invalidateQueries(['checkin-status']);
      toast.success('Shift ended. Rest well!');
    }
  });

  const stats = [
    { title: 'To Do', value: (tasksData || []).filter(t => t.status === 'pending').length, icon: Clock, color: 'blue' },
    { title: 'In Progress', value: (tasksData || []).filter(t => t.status === 'in_progress').length, icon: Play, color: 'indigo' },
    { title: 'Completed', value: (tasksData || []).filter(t => t.status === 'completed' || t.status === 'reviewed').length, icon: CheckCircle2, color: 'emerald' },
  ];

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: 'Good Morning', icon: CloudSun, color: 'text-amber-500' };
    if (hour < 18) return { text: 'Good Afternoon', icon: Sun, color: 'text-orange-500' };
    return { text: 'Good Evening', icon: Moon, color: 'text-indigo-500' };
  };

  const { text: greetingText, icon: GreetingIcon, color: greetingColor } = greeting();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Greeting Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit backdrop-blur-sm border border-white/10">
              <GreetingIcon className={cn("w-4 h-4", greetingColor)} />
              <span className="text-xs font-bold uppercase tracking-wider">{greetingText}</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">Welcome back, {user?.name.split(' ')[0]}!</h1>
            <p className="text-indigo-100/80 font-medium max-w-md">
              You have <span className="text-white font-bold">{stats[0].value} tasks</span> waiting for you. 
              Let's make today productive!
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-indigo-100">{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</p>
              <p className="text-2xl font-black">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-[-30%] right-[-10%] w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-40%] left-[10%] w-64 h-64 bg-indigo-400 rounded-full opacity-10 blur-3xl"></div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Card */}
        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden group">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Timer className="w-5 h-5 text-indigo-600" />
              Daily Attendance
            </CardTitle>
            <CardDescription>Track your work hours</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-8 pt-2">
            <div className={cn(
              "w-28 h-28 rounded-[2rem] flex flex-col items-center justify-center mb-6 transition-all duration-500 relative",
              attendanceStatus?.check_in && !attendanceStatus?.check_out 
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" 
                : "bg-slate-50 text-slate-400 dark:bg-slate-800/50"
            )}>
              <div className="absolute inset-0 rounded-[2rem] border-2 border-dashed border-current opacity-20 animate-[spin_10s_linear_infinite]"></div>
              <Zap className={cn("w-10 h-10 mb-1", attendanceStatus?.check_in && !attendanceStatus?.check_out ? "fill-current" : "")} />
              {attendanceStatus?.check_in && !attendanceStatus?.check_out && (
                <span className="text-[10px] font-black uppercase tracking-tighter animate-pulse">Live</span>
              )}
            </div>
            
            <div className="text-center space-y-1 mb-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {attendanceStatus?.check_in && !attendanceStatus?.check_out ? sessionTime : "Shift Offline"}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {attendanceStatus?.check_in && !attendanceStatus?.check_out 
                  ? `Started at ${attendanceStatus.check_in}` 
                  : "Start your session now"}
              </p>
            </div>

            {!attendanceStatus?.check_in ? (
              <Button 
                onClick={() => checkInMutation.mutate()}
                disabled={checkInMutation.isPending}
                className="w-full h-14 rounded-2xl text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Working
              </Button>
            ) : !attendanceStatus?.check_out ? (
              <Button 
                onClick={() => checkOutMutation.mutate()}
                disabled={checkOutMutation.isPending}
                className="w-full h-14 rounded-2xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 dark:shadow-none gap-2"
              >
                <Coffee className="w-5 h-5" />
                End Session
              </Button>
            ) : (
              <div className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center gap-2 text-slate-500 font-bold border border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-5 h-5" />
                Shift Completed
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats and Tasks Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <div>
                <CardTitle className="text-lg font-bold">Priority Tasks</CardTitle>
                <CardDescription>Items requiring your immediate attention</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="font-bold text-indigo-600 gap-1">
                All Tasks <ChevronRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasksData?.length > 0 ? tasksData.slice(0, 4).map((task) => (
                  <motion.div 
                    whileHover={{ x: 4 }}
                    key={task.id} 
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <StatusBadge status={task.status} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <PriorityBadge priority={task.priority} />
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.progress}%</span>
                        <div className="w-20 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600" style={{ width: `${task.progress}%` }}></div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-20" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">No active tasks found.</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Enjoy your free time!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InternDashboardPage;
