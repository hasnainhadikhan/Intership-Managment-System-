import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileUp, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  X,
  FileText,
  Loader2,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';
import { cn } from '../../utils/utils';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Label } from '../../components/ui/input';

const SubmitWorkPage = () => {
  const [step, setStep] = useState(1);
  const [selectedTask, setSelectedTask] = useState(null);
  const [file, setFile] = useState(null);
  const [remarks, setRemarks] = useState('');
  const navigate = useNavigate();

  const { data: tasksData } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: async () => {
      const response = await api.get('/my/tasks');
      // Only show tasks that can be submitted
      return response.data.data.filter(t => t.status === 'in_progress' || t.status === 'pending');
    }
  });

  const submitMutation = useMutation({
    mutationFn: (formData) => api.post(`/submit/${selectedTask.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      toast.success('Work submitted successfully!');
      navigate('/intern/tasks');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!selectedTask || !file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('remarks', remarks);
    submitMutation.mutate(formData);
  };

  const steps = [
    { id: 1, name: 'Select Task', icon: Layers },
    { id: 2, name: 'Upload Assets', icon: Upload },
    { id: 3, name: 'Review & Send', icon: Sparkles },
  ];

  const variants = {
    initial: { opacity: 0, x: 20 },
    enter: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Submit Work</h1>
            <p className="text-slate-500 font-medium">Step {step} of 3: {steps[step-1].name}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
          <Info className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Submission Guide</span>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="px-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-10 -translate-y-1/2 rounded-full"></div>
          <motion.div 
            className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
            animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          ></motion.div>
          
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 border-4",
                step === s.id ? "bg-indigo-600 text-white border-white dark:border-slate-900 shadow-xl shadow-indigo-200 dark:shadow-none scale-110" : 
                step > s.id ? "bg-emerald-500 text-white border-white dark:border-slate-900" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300"
              )}>
                {step > s.id ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                step >= s.id ? "text-slate-900 dark:text-slate-100" : "text-slate-400"
              )}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Container */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-10 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={variants}
              initial="initial"
              animate="enter"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              {step === 1 && (
                <div className="space-y-8 flex-1">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Which task are you completing?</h3>
                    <p className="text-slate-500 font-medium">Select one of your active assignments to begin the submission.</p>
                  </div>
                  
                  <div className="grid gap-4 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-100">
                    {tasksData?.length > 0 ? tasksData.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={cn(
                          "w-full p-6 rounded-3xl border-2 text-left transition-all flex items-center justify-between group relative overflow-hidden",
                          selectedTask?.id === task.id 
                            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10" 
                            : "border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/30"
                        )}
                      >
                        <div className="flex items-center gap-4 relative z-10">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                            selectedTask?.id === task.id ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 shadow-sm"
                          )}>
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white">{task.title}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: #{task.id}</span>
                              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Due {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {selectedTask?.id === task.id && (
                          <motion.div layoutId="check" className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center relative z-10">
                            <CheckCircle2 className="w-4 h-4" />
                          </motion.div>
                        )}
                      </button>
                    )) : (
                      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Layers className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="font-bold text-slate-500">No tasks available for submission.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 flex-1">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Upload your deliverables</h3>
                    <p className="text-slate-500 font-medium">Upload a PDF, ZIP or DOCX file containing your completed work.</p>
                  </div>

                  <div 
                    className={cn(
                      "flex-1 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center transition-all duration-300 group relative overflow-hidden",
                      file 
                        ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-900/10" 
                        : "border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/5"
                    )}
                  >
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                      onChange={handleFileChange} 
                      accept=".pdf,.zip,.docx,.rar"
                    />
                    
                    {file ? (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center z-10">
                        <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-200 dark:shadow-none">
                          <FileUp className="w-10 h-10" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">{file.name}</h4>
                        <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
                        
                        <Button 
                          variant="ghost" 
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="text-rose-600 font-bold gap-2 hover:bg-rose-50 rounded-xl relative z-30"
                        >
                          <X className="w-4 h-4" />
                          Replace File
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center z-10">
                        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Upload className="w-10 h-10" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Drag deliverables here</h4>
                        <p className="text-sm font-medium text-slate-500 mb-8">Maximum size 10MB. Supports ZIP, PDF, DOCX.</p>
                        <Button className="h-12 px-8 rounded-2xl font-black shadow-lg shadow-indigo-100 dark:shadow-none">
                          Browse Local Files
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 flex-1">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Review & Finalize</h3>
                    <p className="text-slate-500 font-medium">Add some context for your reviewer before sending.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Submission Details</p>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                              <Layers className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 font-bold uppercase">Target Task</p>
                              <p className="text-sm font-black truncate">{selectedTask?.title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                              <FileUp className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 font-bold uppercase">Asset File</p>
                              <p className="text-sm font-black truncate">{file?.name}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-400 leading-relaxed">
                          Your submission will be timestamped and locked. Ensure all assets are correct before final sending.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="remarks" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submission Remarks</Label>
                      <textarea 
                        id="remarks"
                        rows={8}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-[2rem] focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all text-sm font-medium"
                        placeholder="Explain what you've implemented or any hurdles you faced..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-50 dark:border-slate-800">
            <Button 
              variant="ghost" 
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
              className="px-8 rounded-2xl font-bold h-12 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-0"
            >
              Go Back
            </Button>
            
            <div className="flex gap-4">
              {step < 3 ? (
                <Button 
                  onClick={() => setStep(s => s + 1)}
                  disabled={(step === 1 && !selectedTask) || (step === 2 && !file)}
                  className="h-14 px-10 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none gap-2 text-base transition-all active:scale-95"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="h-14 px-10 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none gap-2 text-base transition-all active:scale-95"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Final Submission
                      <Sparkles className="w-5 h-5 fill-current" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SubmitWorkPage;
