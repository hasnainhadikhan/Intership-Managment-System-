import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  MessageSquare, 
  Calendar,
  ExternalLink,
  CheckCircle2,
  Clock,
  User,
  MoreVertical,
  ChevronRight,
  FileCode,
  FileArchive,
  File as FileIcon,
  Send,
  X,
  ShieldCheck,
  CheckCircle,
  Clock3
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';
import StatusBadge from '../../components/shared/StatusBadge';
import Avatar from '../../components/shared/Avatar';
import { Button } from '../../components/ui/button';
import { Input, Label, Textarea } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { cn } from '../../utils/utils';

const SubmissionsPage = () => {
  const [search, setSearch] = useState('');
  const [activeFeedbackId, setActiveFeedbackId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const queryClient = useQueryClient();

  const { data: submissionsData, isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const response = await api.get('/submissions');
      return response.data.data;
    }
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ id, feedback }) => api.put(`/submissions/${id}/feedback`, { feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries(['submissions']);
      toast.success('Feedback published successfully');
      setActiveFeedbackId(null);
      setFeedbackText('');
    }
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mime) => {
    if (mime?.includes('zip') || mime?.includes('rar')) return <FileArchive className="w-6 h-6" />;
    if (mime?.includes('javascript') || mime?.includes('php') || mime?.includes('html')) return <FileCode className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  };

  const filteredSubmissions = (submissionsData || []).filter(s => 
    s.task?.title.toLowerCase().includes(search.toLowerCase()) ||
    s.intern?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Submissions Review</h1>
          <p className="text-slate-500 font-medium mt-1">Audit intern deliverables and provide professional feedback.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search by task or intern..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 h-11 pl-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus-visible:ring-1"
            />
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-slate-200 dark:border-slate-800">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Summary - Optional Mini Row */}
      <div className="flex flex-wrap gap-4">
        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-indigo-100 dark:border-indigo-900/30">
          <Clock3 className="w-4 h-4" />
          {filteredSubmissions.filter(s => !s.feedback).length} Pending Review
        </div>
        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100 dark:border-emerald-900/30">
          <CheckCircle className="w-4 h-4" />
          {filteredSubmissions.filter(s => s.feedback).length} Completed
        </div>
      </div>

      {/* Grid of Submissions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem]" />
          ))
        ) : filteredSubmissions.map((sub) => (
          <motion.div layout key={sub.id}>
            <Card className="group border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                    {getFileIcon(sub.mime_type)}
                  </div>
                  <StatusBadge status={sub.feedback ? 'reviewed' : 'pending'} />
                </div>

                <div className="space-y-1 mb-6">
                  <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight line-clamp-1">{sub.task?.title}</h3>
                  <div className="flex items-center gap-2">
                    <Avatar alt={sub.intern?.name} size="sm" className="w-5 h-5" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{sub.intern?.name}</span>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deliverable</p>
                    <button className="text-indigo-600 hover:text-indigo-700 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300 truncate mb-1">{sub.file_name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{formatFileSize(sub.file_size)} • {sub.mime_type?.split('/')[1]}</p>
                </div>

                {sub.remarks && (
                  <div className="mb-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Intern's Context</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed italic">"{sub.remarks}"</p>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                  <AnimatePresence mode="wait">
                    {activeFeedbackId === sub.id ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <Textarea 
                          placeholder="Write constructive feedback..." 
                          className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-medium min-h-[100px] resize-none"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 gap-2"
                            onClick={() => feedbackMutation.mutate({ id: sub.id, feedback: feedbackText })}
                            disabled={!feedbackText || feedbackMutation.isPending}
                          >
                            <Send className="w-4 h-4" />
                            Publish
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="rounded-xl font-bold text-slate-400"
                            onClick={() => {
                              setActiveFeedbackId(null);
                              setFeedbackText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    ) : sub.feedback ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Supervisor Feedback
                          </p>
                          <span className="text-[10px] font-bold text-slate-400">{new Date(sub.updated_at || sub.submitted_at).toLocaleDateString()}</span>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-[1.5rem] border border-emerald-100 dark:border-emerald-900/20 relative">
                          <div className="absolute -top-2 left-6 w-4 h-4 bg-emerald-50 dark:bg-emerald-900/10 border-t border-l border-emerald-100 dark:border-emerald-900/20 rotate-45"></div>
                          <p className="text-sm text-emerald-900 dark:text-emerald-300 font-medium leading-relaxed italic">"{sub.feedback}"</p>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => setActiveFeedbackId(sub.id)}
                        className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Evaluate Submission
                      </Button>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredSubmissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
            <Layers className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">No submissions found</h3>
          <p className="text-slate-500 font-medium mt-2 max-w-sm">Try adjusting your filters or search terms to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;
