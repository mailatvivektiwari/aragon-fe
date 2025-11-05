import React, { useState, useEffect } from 'react';
import { Column } from '../types';
import { columnsApi } from '../services/api';
import './ColumnModal.css';

interface ColumnModalProps {
  column?: Column | null;
  boardId: string;
  onSubmit: () => void;
  onClose: () => void;
}

const ColumnModal: React.FC<ColumnModalProps> = ({ column, boardId, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (column) {
      setFormData({
        name: column.name,
      });
    } else {
      setFormData({
        name: '',
      });
    }
  }, [column]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Column name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Column name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Column name must be less than 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const columnData = {
        name: formData.name.trim(),
        boardId: boardId,
      };

      if (column) {
        await columnsApi.update(column.id, { name: columnData.name });
      } else {
        await columnsApi.create(columnData);
      }
      
      onSubmit();
    } catch (error) {
      console.error('Failed to save column:', error);
      setErrors({ submit: 'Failed to save column. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDelete = async () => {
    if (!column) return;
    
    if (window.confirm(`Are you sure you want to delete "${column.name}"? This will also delete all tasks in this column.`)) {
      try {
        setLoading(true);
        await columnsApi.delete(column.id);
        onSubmit();
      } catch (error: any) {
        console.error('Failed to delete column:', error);
        if (error.response?.data?.message) {
          setErrors({ submit: error.response.data.message });
        } else {
          setErrors({ submit: 'Failed to delete column. Please try again.' });
        }
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
              {column ? '✏️' : '➕'}
            </div>
            <h2>{column ? 'Edit Column' : 'Add New Column'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="column-form">
          <div className="form-group">
            <label htmlFor="column-name">Column Name *</label>
            <div className="input-wrapper">
              <input
                id="column-name"
                type="text"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                className={errors.name ? 'error' : ''}
                placeholder="e.g. To Do, In Progress, Done"
                maxLength={100}
                disabled={loading}
                autoFocus
              />
              <div className="input-icon">📋</div>
            </div>
            <div className="input-footer">
              {errors.name && <span className="error-message">{errors.name}</span>}
              <span className="character-count">{formData.name.length}/100</span>
            </div>
          </div>
          
          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}
          
          <div className="form-actions">
            {column && (
              <button 
                type="button" 
                className="btn-danger" 
                onClick={handleDelete}
                disabled={loading}
              >
                Delete Column
              </button>
            )}
            <div className="form-actions-right">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading && <span className="loading-spinner">⏳</span>}
                {loading ? 'Saving...' : column ? 'Update Column' : 'Create Column'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ColumnModal;
