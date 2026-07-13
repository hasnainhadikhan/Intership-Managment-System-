import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LogIn, LogOut } from 'lucide-react';
import api from '../../api/axios';
import { cn } from '../../utils/utils';

// ─── helpers ────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, '0');

const fmt12 = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${pad(h % 12 || 12)}:${pad(m)} ${ampm}`;
};

const fmtDate = (d) =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const isoDate = (d) => d.toISOString().split('T')[0];

// Get Mon–Fri of the current week
const getWeekDays = () => {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const WEEK_DAYS = getWeekDays();
const TODAY_ISO = isoDate(new Date());

// ─── Live Clock ──────────────────────────────────────────────────────────────

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="text-center">
      <p className="text-7xl font-bold tracking-tight text-slate-900 tabular-nums">
        {pad(time.getHours())} : {pad(time.getMinutes())} : {pad(time.getSeconds())}
      </p>
      <p className="text-sm text-slate-400 font-medium mt-3">{fmtDate(time)}</p>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const InternCheckInPage = () => {
  const queryClient = useQueryClient();

  // Fetch today's attendance record + all records
  const { data: todayRecord, isLoading: loadingToday } = useQuery({
    queryKey: ['attendance-today'],
    queryFn: async () => {
      const res = await api.get('/attendance/today');
      return res.data.data;
    },
  });

  const { data: allRecords = [] } = useQuery({
    queryKey: ['attendance-records'],
    queryFn: async () => {
      const res = await api.get('/attendance');
      return res.data.data;
    },
  });

  const { data: monthlyStats } = useQuery({
    queryKey: ['attendance-stats'],
    queryFn: async () => {
      const res = await api.get('/attendance/stats');
      return res.data.data;
    },
  });

  const checkInMutation = useMutation({
    mutationFn: () => api.post('/attendance/check-in'),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance-today']);
      queryClient.invalidateQueries(['attendance-records']);
      queryClient.invalidateQueries(['attendance-stats']);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: () => api.post('/attendance/check-out'),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance-today']);
      queryClient.invalidateQueries(['attendance-records']);
      queryClient.invalidateQueries(['attendance-stats']);
    },
  });

  const isCheckedIn  = !!todayRecord?.check_in;
  const isCheckedOut = !!todayRecord?.check_out;
  const isLoading    = checkInMutation.isPending || checkOutMutation.isPending || loadingToday;

  // Build week attendance map: date -> record
  const weekMap = allRecords.reduce((acc, r) => { acc[r.date] = r; return acc; }, {});

  // Recent records — sorted descending
  const recentRecords = [...allRecords]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  // Monthly stats fallback from allRecords
  const present = monthlyStats?.present ?? allRecords.filter(r => r.status === 'present').length;
  const late    = monthlyStats?.late    ?? allRecords.filter(r => r.status === 'late').length;
  const absent  = monthlyStats?.absent  ?? allRecords.filter(r => r.status === 'absent').length;
  const total   = present + late + absent || 1;
  const rate    = Math.round(((present + late) / total) * 100);

  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Breadcrumb + header */}
        <div className="mb-8">
          <p className="text-xs text-slate-400 font-medium mb-2">
            Intern <span className="mx-1">/</span> Check In/Out
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Check In / Out</h1>
          <p className="text-sm text-slate-400 mt-0.5">Track your daily attendance</p>
        </div>

        <div className="flex gap-6">

          {/* LEFT COLUMN */}
          <div className="flex-1 space-y-4">

            {/* Clock + CTA card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 flex flex-col items-center gap-8">
              <LiveClock />

              {/* Check In / Out Button */}
              {!isCheckedIn ? (
                <button
                  disabled={isLoading}
                  onClick={() => checkInMutation.mutate()}
                  className="flex items-center gap-3 px-10 py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold text-base rounded-2xl transition-colors shadow-lg shadow-green-200 disabled:opacity-60"
                >
                  <LogIn className="w-5 h-5" />
                  {isLoading ? 'Processing…' : 'Check In'}
                </button>
              ) : !isCheckedOut ? (
                <button
                  disabled={isLoading}
                  onClick={() => checkOutMutation.mutate()}
                  className="flex items-center gap-3 px-10 py-4 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold text-base rounded-2xl transition-colors shadow-lg shadow-rose-200 disabled:opacity-60"
                >
                  <LogOut className="w-5 h-5" />
                  {isLoading ? 'Processing…' : 'Check Out'}
                </button>
              ) : (
                <div className="px-8 py-3 bg-slate-100 text-slate-500 font-semibold rounded-2xl text-sm">
                  ✓ Done for today — {fmt12(todayRecord.check_in)} → {fmt12(todayRecord.check_out)}
                </div>
              )}
            </div>

            {/* This week card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <p className="font-semibold text-slate-700 text-sm mb-5">This week</p>
              <div className="grid grid-cols-5 gap-3">
                {WEEK_DAYS.map((d) => {
                  const iso     = isoDate(d);
                  const record  = weekMap[iso];
                  const isToday = iso === TODAY_ISO;
                  const checked = record?.check_in;
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum  = d.getDate();

                  return (
                    <div
                      key={iso}
                      className={cn(
                        'flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all',
                        isToday
                          ? 'border-indigo-200 bg-indigo-50/60'
                          : 'border-slate-100 bg-slate-50/60',
                      )}
                    >
                      <span className="text-xs text-slate-400 font-medium">{dayName}</span>
                      <span className={cn(
                        'text-base font-bold',
                        isToday ? 'text-indigo-600' : 'text-slate-700',
                      )}>
                        {dayNum}
                      </span>
                      {/* Status icon */}
                      {checked ? (
                        <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="w-80 space-y-4">

            {/* Monthly stats */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="font-bold text-slate-800 text-sm mb-4">Monthly stats</p>

              {/* Attendance rate */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500">Attendance rate</span>
                  <span className="text-xs font-bold text-green-600">{rate}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rate}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-green-500 rounded-full"
                  />
                </div>
              </div>

              {/* P / L / A boxes */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-green-600">{present}</p>
                  <p className="text-[10px] text-green-500 font-medium mt-0.5">Present</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-orange-500">{late}</p>
                  <p className="text-[10px] text-orange-400 font-medium mt-0.5">Late</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-red-500">{absent}</p>
                  <p className="text-[10px] text-red-400 font-medium mt-0.5">Absent</p>
                </div>
              </div>
            </div>

            {/* Recent records */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="font-bold text-slate-800 text-sm mb-4">Recent records</p>
              <div className="space-y-0 divide-y divide-slate-50">
                {recentRecords.map((r) => {
                  const d = new Date(r.date);
                  const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                  const timeRange = r.check_in
                    ? `${r.check_in}  →  ${r.check_out || '—'}`
                    : '—';

                  return (
                    <div key={r.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{timeRange}</p>
                      </div>
                      <span className={cn(
                        'text-xs font-semibold',
                        r.status === 'present' ? 'text-green-600' :
                        r.status === 'late'    ? 'text-orange-500' : 'text-red-500',
                      )}>
                        {r.status}
                      </span>
                    </div>
                  );
                })}
                {recentRecords.length === 0 && (
                  <p className="text-xs text-slate-400 py-4 text-center">No records yet</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InternCheckInPage;