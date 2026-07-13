import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  Lock,
  ChevronRight,
  Shield,
  Briefcase,
  GraduationCap,
  Sparkles,
  Code2,
  AtSign,
  Globe,
  Plus,
  X,
  BadgeCheck,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/utils';
import { Button } from '../../components/ui/button';
import { Input, Label, Textarea } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import Avatar from '../../components/shared/Avatar';

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [skills, setSkills] = useState(user?.intern?.skills || ['React', 'Node.js', 'Tailwind CSS', 'Framer Motion']);
  const [newSkill, setNewSkill] = useState('');

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
      phone: user?.intern?.phone || '',
      university: user?.intern?.university || '',
      department: user?.intern?.department || '',
      bio: user?.intern?.bio || 'Passionate software engineering intern focused on building high-quality web applications.',
    }
  });

  const onSubmit = (data) => {
    toast.success('Profile updated successfully!');
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
      toast.success('Skill added!');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
    toast.success('Skill removed');
  };

  const tabs = [
    { id: 'profile', label: 'Personal Details', icon: User, description: 'Basic information and identity' },
    { id: 'security', label: 'Security & Access', icon: Lock, description: 'Password and authentication' },
    { id: 'notifications', label: 'Notification Settings', icon: Shield, description: 'Alerts and system updates' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Account Settings</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your professional identity and security preferences.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
          <BadgeCheck className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest">Verified Intern Profile</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <div className="h-36 bg-gradient-to-br from-indigo-600 to-purple-700 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            </div>
            <CardContent className="px-10 pb-10 -mt-20 text-center relative z-10">
              <div className="relative inline-block group mb-6">
                <Avatar alt={user?.name} size="xl" className="w-40 h-40 rounded-[2.5rem] border-8 border-white dark:border-slate-900 shadow-2xl" />
                <button className="absolute bottom-2 right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 hover:scale-110 transition-all active:scale-95">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2 mb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{user?.name}</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-indigo-500 fill-current" />
                  {user?.role} Product Engineer
                </p>
              </div>

              <div className="flex justify-center gap-3 mb-10">
                {[Code2, AtSign, Globe, Mail].map((Icon, i) => (
                  <Button key={i} variant="outline" size="icon" className="w-12 h-12 rounded-2xl border-slate-200 dark:border-slate-800 hover:text-indigo-600 hover:border-indigo-100 dark:hover:border-indigo-900/30">
                    <Icon className="w-5 h-5" />
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-50 dark:border-slate-800">
                <div className="text-center p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">June 2026</p>
                </div>
                <div className="text-center p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-sm font-black text-emerald-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] p-3">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-left relative overflow-hidden group",
                    activeTab === tab.id 
                      ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-200 dark:shadow-none" 
                      : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                    activeTab === tab.id ? "bg-white/20" : "bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700"
                  )}>
                    <tab.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black tracking-tight leading-none mb-1">{tab.label}</p>
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-widest opacity-70",
                      activeTab === tab.id ? "text-indigo-100" : "text-slate-400"
                    )}>{tab.description}</p>
                  </div>
                  <ChevronRight className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    activeTab === tab.id ? "translate-x-1" : "group-hover:translate-x-1"
                  )} />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] p-10">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                    <div className="space-y-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-1 h-8 bg-indigo-600 rounded-full"></div>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white">General Information</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Legal Name</Label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <Input {...register('name')} className="h-14 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-black text-lg" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Work Email Address</Label>
                          <div className="relative opacity-60">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                            <Input {...register('email')} readOnly className="h-14 pl-12 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl font-black text-lg cursor-not-allowed" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</Label>
                          <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <Input {...register('phone')} className="h-14 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="university" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Educational Institute</Label>
                          <div className="relative group">
                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <Input {...register('university')} className="h-14 pl-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4">
                        <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Professional Summary</Label>
                        <Textarea {...register('bio')} rows={6} className="bg-slate-50 dark:bg-slate-800/50 border-none rounded-[1.5rem] p-6 font-medium leading-relaxed resize-none" />
                      </div>
                    </div>

                    <div className="space-y-8 pt-8 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-1 h-8 bg-indigo-600 rounded-full"></div>
                          <h4 className="text-2xl font-black text-slate-900 dark:text-white">Skills & Expertise</h4>
                        </div>
                        <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                      </div>

                      <div className="space-y-6">
                        <div className="flex flex-wrap gap-3">
                          {skills.map((skill, idx) => (
                            <motion.div 
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              key={idx} 
                              className="group px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 border border-indigo-100/50 dark:border-indigo-900/30"
                            >
                              {skill}
                              <button 
                                type="button" 
                                onClick={() => handleRemoveSkill(skill)}
                                className="w-5 h-5 rounded-full hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </motion.div>
                          ))}
                          <form onSubmit={handleAddSkill} className="flex">
                            <input 
                              type="text" 
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              placeholder="Add skill..."
                              className="w-32 h-12 px-4 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all"
                            />
                            <Button 
                              type="submit" 
                              variant="ghost" 
                              size="icon" 
                              className="h-12 w-12 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 ml-1"
                              disabled={!newSkill}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>

                    <div className="pt-10 flex justify-end gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="h-14 px-10 rounded-2xl font-black border-slate-200 dark:border-slate-800"
                      >
                        Reset
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={!isDirty}
                        className="h-14 px-10 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-100 dark:shadow-none gap-3 text-base active:scale-95 transition-all"
                      >
                        <Save className="w-5 h-5" />
                        Commit Changes
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] p-10">
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-1 h-8 bg-indigo-600 rounded-full"></div>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white">Authentication Settings</h4>
                    </div>
                    
                    <div className="grid gap-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Secret Key</Label>
                        <Input type="password" placeholder="••••••••••••" className="h-14 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</Label>
                          <Input type="password" placeholder="••••••••••••" className="h-14 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm Rotation</Label>
                          <Input type="password" placeholder="••••••••••••" className="h-14 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 flex justify-end">
                      <Button className="h-14 px-10 rounded-2xl font-black bg-slate-900 dark:bg-slate-700 hover:bg-indigo-600 transition-colors">
                        Rotate Password
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border-2 border-dashed border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/5">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-1 h-8 bg-rose-600 rounded-full"></div>
                      <h4 className="text-2xl font-black text-rose-600">Danger Operations</h4>
                    </div>
                    <p className="text-sm font-medium text-rose-700/70 dark:text-rose-400/70 max-w-2xl leading-relaxed">
                      Once initiated, all your progress, submissions, and attendance logs will be permanently erased from the IMS ecosystem. This action is irreversible.
                    </p>
                    <Button variant="destructive" className="h-14 px-10 rounded-2xl font-black bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-100 dark:shadow-none">
                      Delete Profile Forever
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
