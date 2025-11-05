import { useState, useEffect } from 'react';
import { Task, CreateTaskData, UpdateTaskData } from '../types';
import { tasksApi } from '../services/api';

export const useTasks = (columnId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = columnId 
        ? await tasksApi.getByColumn(columnId)
        : await tasksApi.getAll();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: CreateTaskData) => {
    try {
      setError(null);
      const newTask = await tasksApi.create(taskData);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: string, taskData: UpdateTaskData) => {
    try {
      setError(null);
      const updatedTask = await tasksApi.update(id, taskData);
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setError(null);
      await tasksApi.delete(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  };

  const reorderTask = async (taskId: string, newColumnId: string, newPosition: number) => {
    try {
      setError(null);
      const updatedTask = await tasksApi.reorder(taskId, newColumnId, newPosition);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder task');
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [columnId]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    reorderTask,
    refetch: fetchTasks,
  };
};
