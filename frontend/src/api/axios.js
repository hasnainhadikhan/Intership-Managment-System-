import axios from 'axios';

// Create mock data for testing
const mockData = {
  interns: [
    {
      id: 1,
      name: 'John Intern',
      email: 'intern@ims.com',
      phone: '1234567890',
      university: 'University of Technology',
      department: 'Computer Science',
      skills: ['PHP', 'React', 'Laravel'],
      status: 'active',
      joined_date: '2026-06-01',
      avatar_url: null,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@ims.com',
      phone: '0987654321',
      university: 'State College',
      department: 'Business Administration',
      skills: ['Marketing', 'Python'],
      status: 'active',
      joined_date: '2026-05-15',
      avatar_url: null,
    }
  ],
  tasks: [
    {
      id: 1,
      title: 'Build User Dashboard',
      description: 'Create a responsive dashboard for interns to view tasks',
      assigned_to: 1,
      priority: 'high',
      status: 'in_progress',
      deadline: '2026-06-20',
      progress: 65,
      created_by: 1,
      tags: ['React', 'Tailwind'],
    },
    {
      id: 2,
      title: 'API Documentation',
      description: 'Write comprehensive API documentation',
      assigned_to: 1,
      priority: 'medium',
      status: 'pending',
      deadline: '2026-06-25',
      progress: 0,
      created_by: 1,
      tags: ['Documentation'],
    },
    {
      id: 3,
      title: 'Database Design',
      description: 'Design and implement database schema',
      assigned_to: 2,
      priority: 'urgent',
      status: 'completed',
      deadline: '2026-06-10',
      progress: 100,
      created_by: 1,
      tags: ['Laravel'],
    },
  ],
  attendance: [
    { id: 1, intern_id: 1, date: '2026-06-16', check_in: '09:00:00', check_out: null, duration_minutes: null, status: 'present' },
    { id: 2, intern_id: 2, date: '2026-06-16', check_in: '09:15:00', check_out: '17:30:00', duration_minutes: 495, status: 'late' },
  ],
  submissions: [
    { id: 1, task_id: 3, intern_id: 2, file_path: '/submissions/database-design.zip', file_name: 'database-design.zip', file_size: 102400, mime_type: 'application/zip', remarks: 'Final schema design', feedback: 'Great work!', feedback_by: 1, submitted_at: '2026-06-10' }
  ],
  dashboard: {
    stats: {
      total_interns: 2,
      active_tasks: 3,
      present_today: 2,
      pending_reviews: 1,
    }
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Mock API interceptor for demo purposes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock responses for demo
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Return mock data if API fails
    const url = error.config?.url || '';
    
    if (url.includes('/auth/login')) {
      // Handled in AuthContext
      return Promise.reject(error);
    }
    if (url.includes('/interns')) {
      return Promise.resolve({
        data: { data: mockData.interns, meta: { current_page: 1, last_page: 1, total: 2 } }
      });
    }
    if (url.includes('/tasks')) {
      return Promise.resolve({ data: { data: mockData.tasks } });
    }
    if (url.includes('/dashboard/stats')) {
      return Promise.resolve({ data: mockData.dashboard });
    }
    if (url.includes('/my/tasks')) {
      return Promise.resolve({ data: { data: mockData.tasks.filter(t => t.assigned_to === 1) } });
    }
    if (url.includes('/checkin/status')) {
      return Promise.resolve({ data: { data: mockData.attendance[0] } });
    }
    if (url.includes('/attendance')) {
      return Promise.resolve({ data: { data: mockData.attendance } });
    }
    if (url.includes('/submissions')) {
      return Promise.resolve({ data: { data: mockData.submissions } });
    }
    if (url.includes('/reports')) {
      return Promise.resolve({ data: { data: [] } });
    }
    
    console.warn('Mocking API response for:', url);
    return Promise.resolve({ data: { data: [] } });
  }
);

export default api;
