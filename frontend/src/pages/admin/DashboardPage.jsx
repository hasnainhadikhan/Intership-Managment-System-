import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Users, 
  CheckSquare, 
  Calendar, 
  Clock,
  Activity,
  Award,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../api/axios';
import StatCard from '../../components/shared/StatCard';
import DataTable from '../../components/shared/DataTable';
import Avatar from '../../components/shared/Avatar';
import { Badge } from '../../components/ui/input'; // Using Badge if available, otherwise just use div
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/input'; // Fallback if Skeleton not in components/ui
import { Button } from '../../components/ui/button';
import { cn } from '../../utils/utils';

const AdminDashboardPage = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    }
  });

  const { data: chartsData, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: async () => {
      const response = await api.get('/dashboard/charts');
      return response.data;
    }
  });

  const stats = [
    { 
      title: 'Total Interns', 
      value: statsData?.stats?.total_interns || 0, 
      icon: Users, 
      trend: 'up', 
      trendValue: 12, 
      color: 'indigo' 
    },
    { 
      title: 'Active Tasks', 
      value: statsData?.stats?.active_tasks || 0, 
      icon: Briefcase, 
      trend: 'up', 
      trendValue: 5, 
      color: 'blue' 
    },
    { 
      title: 'Present Today', 
      value: statsData?.stats?.present_today || 0, 
      icon: Calendar, 
      trend: 'up', 
      trendValue: 8, 
      color: 'emerald' 
    },
    { 
      title: 'Pending Reviews', 
      value: statsData?.stats?.pending_reviews || 0, 
      icon: Clock, 
      trend: 'down', 
      trendValue: 2, 
      color: 'amber' 
    },
  ];

  const taskStatusColors = {
    pending: '#94A3B8',
    in_progress: '#6366F1',
    completed: '#10B981',
    reviewed: '#A855F7',
  };

  const performerColumns = [
    { 
      header: 'Intern', 
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar alt={row.name} size="sm" />
          <span className="font-bold text-slate-900 dark:text-white">{row.name}</span>
        </div>
      )
    },
    { 
      header: 'Tasks', 
      accessor: 'tasks_count',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-700 dark:text-slate-300">
            {row.tasks_count}
          </span>
          <span className="text-xs text-slate-500">completed</span>
        </div>
      )
    },
    { 
      header: 'Performance', 
      accessor: 'score',
      cell: (row) => (
        <div className="flex items-center gap-3 w-full max-w-[160px]">
          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((row.tasks_count / 10) * 100, 100)}%` }}
              className="h-full bg-indigo-600 rounded-full" 
            />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {Math.min((row.tasks_count / 10) * 100, 100).toFixed(0)}%
          </span>
        </div>
      )
    }
  ];

  if (statsLoading || chartsLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[400px] bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          <div className="h-[400px] bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor internship performance and operational metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div>
              <CardTitle className="text-lg font-bold">Attendance Trend</CardTitle>
              <CardDescription>Daily attendance over the last 30 days</CardDescription>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-full text-xs font-bold">
              <TrendingUp className="w-3 h-3" />
              +12.5%
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartsData?.attendance_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    minTickGap={30}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: '700', color: '#4F46E5' }}
                    labelStyle={{ fontSize: '11px', fontWeight: '600', color: '#94A3B8', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#6366F1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAttendance)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Task Distribution</CardTitle>
            <CardDescription>Status breakdown of all tasks</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full flex flex-col items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartsData?.task_status || []}
                    innerRadius={75}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="count"
                    nameKey="status"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {(chartsData?.task_status || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={taskStatusColors[entry.status] || '#6366F1'} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {(chartsData?.task_status || []).map((entry, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: taskStatusColors[entry.status] }}></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                    {entry.status.replace('_', ' ')}
                  </span>
                  <span className="ml-auto text-xs font-bold text-slate-900 dark:text-white">{entry.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Top Performers
              </CardTitle>
              <CardDescription>Interns with the highest completion rates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="font-bold text-indigo-600">View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={performerColumns} 
              data={chartsData?.top_performers || []} 
              loading={chartsLoading} 
            />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from the team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: 'Sarah Chen', action: 'assigned a new task to', target: 'Alex Rivera', time: '2 hours ago', icon: Briefcase, color: 'indigo' },
                { name: 'Alex Rivera', action: 'submitted', target: 'API Documentation', time: '4 hours ago', icon: CheckSquare, color: 'emerald' },
                { name: 'John Doe', action: 'marked attendance as', target: 'Present', time: '6 hours ago', icon: Calendar, color: 'blue' },
                { name: 'Emily Blunt', action: 'reviewed submission from', target: 'Sarah Chen', time: 'Yesterday', icon: Clock, color: 'amber' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="relative flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center z-10 relative transition-transform group-hover:scale-110",
                      activity.color === 'indigo' ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" :
                      activity.color === 'emerald' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
                      activity.color === 'blue' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" :
                      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                    )}>
                      <activity.icon className="w-5 h-5" />
                    </div>
                    {i < 3 && <div className="w-[2px] flex-1 bg-slate-100 dark:bg-slate-800 my-1"></div>}
                  </div>
                  <div className="pb-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      <span className="font-bold text-slate-900 dark:text-white">{activity.name}</span>
                      {' '}{activity.action}{' '}
                      <span className="font-bold text-slate-900 dark:text-white">{activity.target}</span>
                    </p>
                    <p className="text-xs font-medium text-slate-400 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 rounded-xl border-slate-200 dark:border-slate-800 font-bold">
              Load More Activity
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
