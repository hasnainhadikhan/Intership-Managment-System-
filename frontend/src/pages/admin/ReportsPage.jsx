import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  Download, 
  FileText, 
  Calendar,
  Filter,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  FileSpreadsheet,
  File as FileIcon,
  Sparkles,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import api from '../../api/axios';
import DataTable from '../../components/shared/DataTable';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { cn } from '../../utils/utils';
import Avatar from '../../components/shared/Avatar';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [dateRange, setDateRange] = useState({ start: '2026-06-01', end: '2026-06-30' });

  const { data: attendanceReport, isLoading: attLoading } = useQuery({
    queryKey: ['report-attendance', dateRange],
    queryFn: async () => {
      const response = await api.get('/reports/attendance', { params: dateRange });
      return response.data.data;
    },
    enabled: activeTab === 'attendance'
  });

  const { data: tasksReport, isLoading: taskLoading } = useQuery({
    queryKey: ['report-tasks'],
    queryFn: async () => {
      const response = await api.get('/reports/tasks');
      return response.data.data;
    },
    enabled: activeTab === 'tasks'
  });

  const attColumns = [
    { 
      header: 'Intern', 
      accessor: 'intern', 
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar alt={row.intern?.name} size="sm" />
          <span className="font-bold text-slate-900 dark:text-white">{row.intern?.name}</span>
        </div>
      )
    },
    { 
      header: 'Date', 
      accessor: 'date',
      cell: (row) => (
        <span className="text-sm font-medium text-slate-500">
          {new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className={cn(
          "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
          row.status === 'present' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
          row.status === 'late' ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
          "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
        )}>
          {row.status}
        </span>
      )
    },
    { 
      header: 'Duration', 
      accessor: 'duration_minutes', 
      cell: (row) => (
        <span className="text-sm font-black text-slate-700 dark:text-slate-300">
          {row.duration_minutes ? `${Math.floor(row.duration_minutes / 60)}h ${row.duration_minutes % 60}m` : '--'}
        </span>
      )
    },
  ];

  const taskColumns = [
    { 
      header: 'Task Title', 
      accessor: 'title',
      cell: (row) => <span className="font-bold text-slate-900 dark:text-white">{row.title}</span>
    },
    { 
      header: 'Assigned To', 
      accessor: 'intern', 
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Avatar alt={row.intern?.name} size="xs" className="w-6 h-6" />
          <span className="text-sm font-medium">{row.intern?.name}</span>
        </div>
      )
    },
    { 
      header: 'Progress', 
      accessor: 'progress', 
      cell: (row) => (
        <div className="flex items-center gap-3 w-32">
          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${row.progress}%` }}></div>
          </div>
          <span className="text-[10px] font-black text-slate-400">{row.progress}%</span>
        </div>
      )
    },
  ];

  const taskStatusData = [
    { name: 'Completed', value: 45, color: '#10B981' },
    { name: 'Pending', value: 25, color: '#94A3B8' },
    { name: 'In Progress', value: 30, color: '#6366F1' }
  ];

  const tabs = [
    { id: 'attendance', label: 'Attendance Audit', icon: Calendar, description: 'Track presence and work hours' },
    { id: 'tasks', label: 'Performance Analytics', icon: Award, description: 'Evaluate output and efficiency' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Reporting Engine</h1>
          <p className="text-slate-500 font-medium mt-1">Generate and export intelligence for your program.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 gap-2 font-bold border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </Button>
          <Button className="h-11 gap-2 font-bold bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none">
            <Download className="w-4 h-4" />
            Full PDF Report
          </Button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-4 p-5 rounded-3xl border-2 transition-all duration-300 text-left relative overflow-hidden group",
              activeTab === tab.id 
                ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10" 
                : "border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/30 bg-white dark:bg-slate-900"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
              activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:scale-110"
            )}>
              <tab.icon className="w-6 h-6" />
            </div>
            <div>
              <p className={cn(
                "text-sm font-black tracking-tight leading-none mb-1",
                activeTab === tab.id ? "text-indigo-600" : "text-slate-900 dark:text-white"
              )}>{tab.label}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tab.description}</p>
            </div>
            {activeTab === tab.id && (
              <motion.div layoutId="tab-active" className="absolute right-4 w-2 h-2 rounded-full bg-indigo-600" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'attendance' ? (
          <motion.div 
            key="attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-8 p-8">
                  <div>
                    <CardTitle className="text-xl font-black">Hour Distribution</CardTitle>
                    <CardDescription>Daily work hour totals across all interns</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="date" className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold" value={dateRange.start} />
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                    <input type="date" className="h-9 px-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold" value={dateRange.end} />
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={attendanceReport || []}>
                        <defs>
                          <linearGradient id="colorDur" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                          tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="duration_minutes" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorDur)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] p-8">
                <CardHeader className="px-0 pt-0 pb-6">
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Quick Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                  {[
                    { label: 'Avg. Check-in Time', value: '09:12 AM', trend: 'Early', trendColor: 'emerald' },
                    { label: 'Most Productive Day', value: 'Wednesday', trend: '+14%', trendColor: 'indigo' },
                    { label: 'Late Arrival Rate', value: '4.2%', trend: '-2.1%', trendColor: 'emerald' },
                    { label: 'Avg. Session Length', value: '8h 15m', trend: 'Stable', trendColor: 'slate' },
                  ].map((insight, i) => (
                    <div key={i} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{insight.label}</p>
                      <div className="flex items-end justify-between">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">{insight.value}</h4>
                        <span className={cn(
                          "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                          insight.trendColor === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                          insight.trendColor === 'indigo' ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
                        )}>{insight.trend}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
              <DataTable columns={attColumns} data={attendanceReport || []} loading={attLoading} />
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            key="tasks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] p-10">
                <CardHeader className="px-0 pt-0 pb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black">Completion Lifecycle</CardTitle>
                      <CardDescription>Current state of all task assignments</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <div className="h-[300px] flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        innerRadius={80}
                        outerRadius={105}
                        paddingAngle={8}
                        dataKey="value"
                        animationDuration={1500}
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-4 ml-8">
                    {taskStatusData.map((entry, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{entry.name}</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{entry.value}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] p-10">
                <CardHeader className="px-0 pt-0 pb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shadow-sm">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black">Velocity by Intern</CardTitle>
                      <CardDescription>Number of tasks completed per person</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Sarah', tasks: 12 },
                      { name: 'Alex', tasks: 19 },
                      { name: 'John', tasks: 15 },
                      { name: 'Emily', tasks: 8 },
                      { name: 'Michael', tasks: 14 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontStyle: 'bold', fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontStyle: 'bold', fill: '#94a3b8' }} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="tasks" fill="#6366F1" radius={[8, 8, 0, 0]} barSize={40} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
              <DataTable columns={taskColumns} data={tasksReport || []} loading={taskLoading} />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportsPage;
