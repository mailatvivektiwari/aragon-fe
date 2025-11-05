import axios from 'axios';
import { Board, Task, CreateBoardData, CreateTaskData, UpdateTaskData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Authorization header to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Board API
export const boardsApi = {
  getAll: async (): Promise<Board[]> => {
    const response = await api.get('/boards');
    return response.data.data || response.data;
  },

  getById: async (id: string): Promise<Board> => {
    const response = await api.get(`/boards/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: CreateBoardData): Promise<Board> => {
    const response = await api.post('/boards', data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: Partial<CreateBoardData>): Promise<Board> => {
    const response = await api.put(`/boards/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/boards/${id}`);
  },
};

// Task API
export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data.data || response.data;
  },

  getById: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data || response.data;
  },

  getByColumn: async (columnId: string): Promise<Task[]> => {
    const response = await api.get(`/tasks?columnId=${columnId}`);
    return response.data.data || response.data;
  },

  create: async (data: CreateTaskData): Promise<Task> => {
    const response = await api.post('/tasks', data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: UpdateTaskData): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  reorder: async (taskId: string, newColumnId: string, newPosition: number): Promise<Task> => {
    const response = await api.patch(`/tasks/${taskId}/move`, {
      columnId: newColumnId,
      position: newPosition,
    });
    return response.data.data || response.data;
  },

  move: async (taskId: string, newColumnId: string, newPosition: number): Promise<Task> => {
    const response = await api.patch(`/tasks/${taskId}/move`, {
      columnId: newColumnId,
      position: newPosition,
    });
    return response.data.data || response.data;
  },
};

// Column API
export const columnsApi = {
  create: async (data: { name: string; boardId: string; position?: number }): Promise<any> => {
    const response = await api.post('/columns', data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: { name?: string; position?: number }): Promise<any> => {
    const response = await api.put(`/columns/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/columns/${id}`);
  },

  reorder: async (id: string, position: number): Promise<any> => {
    const response = await api.patch(`/columns/${id}/reorder`, { position });
    return response.data.data || response.data;
  },
};

// Helper function to check if board can be deleted
export const canDeleteBoard = (board: Board): { canDelete: boolean; reason?: string } => {
  if (!board.columns) {
    return { canDelete: true };
  }

  const allTasks = board.columns.flatMap(col => col.tasks || []);
  const inProgressTasks = allTasks.filter(task => task.status === 'IN_PROGRESS');
  
  if (inProgressTasks.length > 0) {
    return { 
      canDelete: false, 
      reason: `Cannot delete board. There ${inProgressTasks.length === 1 ? 'is' : 'are'} ${inProgressTasks.length} task${inProgressTasks.length === 1 ? '' : 's'} in progress.`
    };
  }

  return { canDelete: true };
};

export default api;
