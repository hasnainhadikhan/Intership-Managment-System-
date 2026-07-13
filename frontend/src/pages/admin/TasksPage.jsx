import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List as ListIcon, 
  Calendar as CalendarIcon,
  Clock,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  X,
  User,
  Tag,
  Flag,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import api from '../../api/axios';
import StatusBadge from '../../components/shared/StatusBadge';
import PriorityBadge from '../../components/shared/PriorityBadge';
import Avatar from '../../components/shared/Avatar';
import { Button } from '../../components/ui/button';
import { Input, Label, Textarea } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { cn } from '../../utils/utils';

// --- Sortable Item Component ---
const SortableTaskCard = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onClick={() => onClick(task)}
      className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all cursor-grab active:cursor-grabbing group"
    >
      <div className="flex justify-between items-start mb-3">
        <PriorityBadge priority={task.priority} />
        <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 border-slate-100 dark:border-slate-700 text-slate-400">
          #{task.id}
        </Badge>
      </div>
      
      <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
        {task.description}
      </p>
      
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <Avatar alt={task.intern?.name} size="sm" className="w-6 h-6 border-2 border-white dark:border-slate-800" />
          <span className="text-[10px] font-bold text-slate-500 truncate max-w-[80px]">{task.intern?.name}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg text-[10px] font-bold text-slate-400">
          <Calendar className="w-3 h-3" />
          {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
        </div>
      </div>

      {task.progress > 0 && (
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold text-slate-400">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${task.progress}%` }}
              className="h-full bg-indigo-500 rounded-full" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

// --- Column Component ---
const KanbanColumn = ({ id, title, tasks, color, onTaskClick }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 min-w-[280px]">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full shadow-sm", color)}></div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">{title}</h3>
          <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg text-[10px] font-black text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm">
            {tasks.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:text-indigo-600">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-1">
            <Layers className="w-5 h-5 opacity-20" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Empty Column</span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Page Component ---
const TasksPage = () => {
  const [view, setView] = useState('kanban');
  const [search, setSearch] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await api.get('/tasks');
      return response.data.data;
    }
  });

  const { data: internsData } = useQuery({
    queryKey: ['interns'],
    queryFn: async () => {
      const response = await api.get('/interns');
      return response.data.data;
    }
  });

  const columns = [
    { id: 'pending', title: 'Pending', color: 'bg-slate-400' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-indigo-500' },
    { id: 'completed', title: 'Completed', color: 'bg-emerald-500' },
    { id: 'reviewed', title: 'Reviewed', color: 'bg-purple-500' },
  ];

  const filteredTasks = useMemo(() => {
    return (tasksData || []).filter(task => 
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase()) ||
      task.intern?.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [tasksData, search]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      toast.info("Updating task status...");
      // In a real app, you'd call a mutation here to update the status in DB
    }
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    toast.success('Task created successfully');
    setIsPanelOpen(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Task Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Organize, track and review intern progress.</p>
        </div>
        <Button 
          onClick={() => {
            setActiveTask(null);
            setIsPanelOpen(true);
          }}
          className="gap-2 h-11 px-6 shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          Create New Task
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 p-2 shrink-0">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search tasks, interns or tags..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-11 bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-1"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl flex gap-1">
              <button 
                onClick={() => setView('kanban')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider",
                  view === 'kanban' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                Kanban
              </button>
              <button 
                onClick={() => setView('list')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider",
                  view === 'list' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <ListIcon className="w-4 h-4" />
                List
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Kanban Board */}
      <div className="flex-1 min-h-0 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse h-full"></div>
            ))}
          </div>
        ) : view === 'kanban' ? (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCorners} 
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 h-full min-w-max pb-2">
              {columns.map((col) => (
                <KanbanColumn 
                  key={col.id} 
                  id={col.id} 
                  title={col.title} 
                  color={col.color}
                  tasks={filteredTasks.filter(t => t.status === col.id)}
                  onTaskClick={(task) => {
                    setActiveTask(task);
                    setIsPanelOpen(true);
                  }}
                />
              ))}
            </div>
          </DndContext>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <DataTable 
              columns={[
                { 
                  header: 'Task Name', 
                  accessor: 'title',
                  cell: (row) => (
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white leading-none mb-1">{row.title}</p>
                      <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{row.description}</p>
                    </div>
                  )
                },
                { 
                  header: 'Assigned To', 
                  accessor: 'intern',
                  cell: (row) => (
                    <div className="flex items-center gap-2">
                      <Avatar alt={row.intern?.name} size="sm" />
                      <span className="text-sm font-medium">{row.intern?.name}</span>
                    </div>
                  )
                },
                { 
                  header: 'Priority', 
                  accessor: 'priority',
                  cell: (row) => <PriorityBadge priority={row.priority} />
                },
                { 
                  header: 'Status', 
                  accessor: 'status',
                  cell: (row) => <StatusBadge status={row.status} />
                },
                { 
                  header: 'Deadline', 
                  accessor: 'deadline',
                  cell: (row) => (
                    <span className="text-sm font-medium text-slate-500">
                      {row.deadline ? new Date(row.deadline).toLocaleDateString() : 'N/A'}
                    </span>
                  )
                },
                {
                  header: '',
                  accessor: 'id',
                  cell: (row) => (
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-indigo-600">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )
                }
              ]} 
              data={filteredTasks} 
            />
          </div>
        )}
      </div>

      {/* Slide-over Panel */}
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
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white dark:bg-slate-900 z-[70] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold">{activeTask ? 'Task Details' : 'Create New Task'}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Define task scope and assign intern</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsPanelOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <form id="task-form" onSubmit={handleCreateTask} className="space-y-8">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-slate-400">Task Title</Label>
                    <Input id="title" placeholder="e.g. Implement Dashboard Analytics" defaultValue={activeTask?.title} className="h-12 text-lg font-bold border-none bg-slate-50 dark:bg-slate-800/50" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-slate-400">Description</Label>
                    <Textarea id="description" placeholder="Provide detailed instructions..." className="min-h-[120px] bg-slate-50 dark:bg-slate-800/50 border-none resize-none" defaultValue={activeTask?.description} required />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <User className="w-3 h-3" /> Assign To
                      </Label>
                      <select className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none text-sm font-medium focus:ring-1 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                        <option value="">Select Intern</option>
                        {internsData?.map(intern => (
                          <option key={intern.id} value={intern.id} selected={activeTask?.assigned_to === intern.id}>
                            {intern.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Flag className="w-3 h-3" /> Priority
                      </Label>
                      <select className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none text-sm font-medium focus:ring-1 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high" selected={activeTask?.priority === 'high'}>High</option>
                        <option value="urgent" selected={activeTask?.priority === 'urgent'}>Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <CalendarIcon className="w-3 h-3" /> Deadline
                      </Label>
                      <Input type="date" className="h-11 bg-slate-50 dark:bg-slate-800/50 border-none" defaultValue={activeTask?.deadline} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Tag className="w-3 h-3" /> Tags
                      </Label>
                      <Input placeholder="e.g. Frontend, API" className="h-11 bg-slate-50 dark:bg-slate-800/50 border-none" defaultValue={activeTask?.tags?.join(', ')} />
                    </div>
                  </div>

                  {activeTask && (
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Current Progress</Label>
                      <div className="flex items-center gap-4">
                        <input type="range" className="flex-1 accent-indigo-600" min="0" max="100" defaultValue={activeTask.progress} />
                        <span className="text-lg font-black text-indigo-600">{activeTask.progress}%</span>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl font-bold h-12" onClick={() => setIsPanelOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" form="task-form" className="flex-1 rounded-xl font-bold h-12 shadow-lg shadow-indigo-200 dark:shadow-none">
                  {activeTask ? 'Update Task' : 'Create Task'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksPage;
