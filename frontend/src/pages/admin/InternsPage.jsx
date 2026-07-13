import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List as ListIcon, 
  MoreVertical, 
  Mail, 
  Phone, 
  University,
  ExternalLink,
  Trash2,
  Edit,
  X,
  Upload,
  ChevronRight,
  GraduationCap,
  MapPin,
  Calendar,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import Avatar from '../../components/shared/Avatar';
import { Button } from '../../components/ui/button';
import { Input, Label, Textarea } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { cn } from '../../utils/utils';

const InternsPage = () => {
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingIntern, setEditingIntern] = useState(null);
  const queryClient = useQueryClient();

  const { data: internsData, isLoading } = useQuery({
    queryKey: ['interns'],
    queryFn: async () => {
      const response = await api.get('/interns');
      return response.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/interns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['interns']);
      toast.success('Intern record removed');
    }
  });

  const columns = [
    { 
      header: 'Intern', 
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar alt={row.name} size="sm" />
          <div>
            <p className="font-bold text-slate-900 dark:text-white leading-none mb-1">{row.name}</p>
            <p className="text-[10px] font-medium text-slate-500">{row.email}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'University', 
      accessor: 'university',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm font-medium">{row.university}</span>
        </div>
      )
    },
    { 
      header: 'Department', 
      accessor: 'department',
      cell: (row) => <span className="text-sm text-slate-600 dark:text-slate-400">{row.department}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />
    },
    { 
      header: 'Joined', 
      accessor: 'joined_date',
      cell: (row) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-sm">{new Date(row.joined_date).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      header: '',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
            onClick={() => {
              setEditingIntern(row);
              setIsPanelOpen(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            onClick={() => {
              if (window.confirm('Delete this intern record?')) {
                deleteMutation.mutate(row.id);
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const filteredInterns = internsData?.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.email.toLowerCase().includes(search.toLowerCase()) ||
    i.university.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleAddIntern = (e) => {
    e.preventDefault();
    toast.success(editingIntern ? 'Intern updated successfully' : 'New intern added successfully');
    setIsPanelOpen(false);
    setEditingIntern(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Interns Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage your current internship cohort.</p>
        </div>
        <Button 
          onClick={() => {
            setEditingIntern(null);
            setIsPanelOpen(true);
          }}
          className="gap-2 h-11 px-6 shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <UserPlus className="w-5 h-5" />
          Add New Intern
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 p-2">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search by name, email or university..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-11 bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-1"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="h-11 gap-2 font-bold border-slate-200 dark:border-slate-800 flex-1 md:flex-none">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            
            <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 hidden md:block"></div>
            
            <div className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl flex gap-1">
              <button 
                onClick={() => setView('grid')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  view === 'grid' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView('table')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  view === 'table' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-64 border-none shadow-sm animate-pulse bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
            ))}
          </motion.div>
        ) : view === 'grid' ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredInterns.map((intern) => (
              <Card key={intern.id} className="group border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 dark:hover:shadow-none transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                      <Avatar alt={intern.name} size="xl" className="border-4 border-slate-50 dark:border-slate-800 shadow-sm" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          intern.status === 'active' ? "bg-emerald-500" : "bg-slate-300"
                        )}></div>
                      </div>
                    </div>
                    <StatusBadge status={intern.status} />
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-indigo-600 transition-colors">
                    {intern.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-tighter mb-4">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {intern.university}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{intern.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <span>{intern.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {(intern.skills || []).slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-tight">
                        {skill}
                      </span>
                    ))}
                    {(intern.skills || []).length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-[10px] font-bold">
                        +{(intern.skills || []).length - 3}
                      </span>
                    )}
                  </div>

                  <Button variant="outline" className="w-full rounded-xl border-slate-100 dark:border-slate-800 font-bold text-xs gap-2 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                    View Profile
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="table"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <DataTable columns={columns} data={filteredInterns} loading={isLoading} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-over Add/Edit Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 z-[70] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold">{editingIntern ? 'Edit Intern' : 'Add New Intern'}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Fill in the details below</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsPanelOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="intern-form" onSubmit={handleAddIntern} className="space-y-6">
                  {/* Avatar Upload Placeholder */}
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/50 group cursor-pointer hover:border-indigo-500/50 transition-all">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Upload Profile Photo</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">PNG, JPG up to 5MB</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" defaultValue={editingIntern?.name} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" defaultValue={editingIntern?.email} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="+1 (555) 000-0000" defaultValue={editingIntern?.phone} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university">University</Label>
                    <Input id="university" placeholder="Stanford University" defaultValue={editingIntern?.university} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" placeholder="Computer Science" defaultValue={editingIntern?.department} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma separated)</Label>
                    <Input id="skills" placeholder="React, Node.js, Python" defaultValue={editingIntern?.skills?.join(', ')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="join_date">Joined Date</Label>
                    <Input id="join_date" type="date" defaultValue={editingIntern?.joined_date} required />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl font-bold h-12" onClick={() => setIsPanelOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" form="intern-form" className="flex-1 rounded-xl font-bold h-12 shadow-lg shadow-indigo-200 dark:shadow-none">
                  {editingIntern ? 'Save Changes' : 'Create Intern'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InternsPage;
