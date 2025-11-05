import React, { useState, useEffect } from 'react';
import { Task, CreateTaskData, TaskPriority, TaskStatus } from '../types';
import { tasksApi } from '../services/api';
import './TaskModal.css';

interface TaskModalProps {
  task?: Task | null;
  columnId: string;
  columns?: Array<{ id: string; name: string; tasks?: Task[] }>;
  onSubmit: () => void;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, columnId, columns = [], onSubmit, onClose }) => {
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    position: 0,
    columnId: columnId,
    dueDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        position: task.position,
        columnId: task.columnId,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    } else {
      setFormData(prev => ({ ...prev, columnId }));
    }
  }, [task, columnId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Task title must be at least 2 characters';
    }
    
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      // Calculate position for new tasks (add to end of column)
      const targetColumn = columns.find(col => col.id === formData.columnId);
      const position = task ? formData.position : (targetColumn?.tasks?.length || 0);

      const taskData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        columnId: formData.columnId,
        dueDate: formData.dueDate || undefined,
        position: position,
      };

      if (task) {
        await tasksApi.update(task.id, taskData);
      } else {
        await tasksApi.create(taskData);
      }
      
      onSubmit();
    } catch (error) {
      console.error('Failed to save task:', error);
      setErrors({ submit: 'Failed to save task. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateTaskData, value: string | TaskPriority) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setLoading(true);
        await tasksApi.delete(task.id);
        onSubmit();
      } catch (error) {
        console.error('Failed to delete task:', error);
        setErrors({ submit: 'Failed to delete task. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <div className="modal-icon">
              {task ? '✏️' : '➕'}
            </div>
            <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="task-title">Task Title *</label>
            <div className="input-wrapper">
              <input
                id="task-title"
                type="text"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                className={errors.title ? 'error' : ''}
                placeholder="e.g. Design new homepage"
                maxLength={100}
                disabled={loading}
                autoFocus
                style={{ paddingLeft: '48px' }}
              />
              <div className="input-icon">📝</div>
            </div>
            <div className="input-footer">
              {errors.title && <span className="error-message">{errors.title}</span>}
              <span className="character-count">{formData.title.length}/100</span>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <div className="input-wrapper">
              <textarea
                id="task-description"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="e.g. Research user needs and create wireframes..."
                rows={4}
                maxLength={1000}
                disabled={loading}
                style={{ paddingLeft: '48px', paddingTop: '16px' }}
              />
              <div className="input-icon textarea-icon">📄</div>
            </div>
            <div className="input-footer">
              <span className="character-count">{(formData.description || '').length}/1000</span>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={formData.priority}
                onChange={e => handleInputChange('priority', e.target.value as TaskPriority)}
                disabled={loading}
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.URGENT}>Urgent</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                value={formData.status || 'TODO'}
                onChange={e => handleInputChange('status', e.target.value as any)}
                disabled={loading}
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="task-due-date">Due Date</label>
            <input
              id="task-due-date"
              type="date"
              value={formData.dueDate}
              onChange={e => handleInputChange('dueDate', e.target.value)}
              className={errors.dueDate ? 'error' : ''}
              disabled={loading}
            />
            {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
          </div>
          
          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}
          
          <div className="form-actions">
            {task && (
              <button 
                type="button" 
                className="btn-danger" 
                onClick={handleDelete}
                disabled={loading}
              >
                Delete Task
              </button>
            )}
            <div className="form-actions-right">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
                     <button type="submit" className="btn-primary" disabled={loading}>
                       {loading && <span className="loading-spinner">⏳</span>}
                       {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                     </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
