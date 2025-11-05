import React, { useState, useEffect } from 'react';
import { Board, CreateBoardData } from '../types';
import './BoardModal.css';

interface BoardModalProps {
  board?: Board | null;
  onSubmit: (data: CreateBoardData) => void;
  onClose: () => void;
}

const BoardModal: React.FC<BoardModalProps> = ({ board, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<CreateBoardData>({
    name: '',
    description: '',
    color: '#0079bf',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (board) {
      setFormData({
        name: board.name,
        description: board.description || '',
        color: board.color,
      });
    }
  }, [board]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Board name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Board name must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        color: formData.color,
      });
    }
  };

  const handleInputChange = (field: keyof CreateBoardData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const colorOptions = [
    '#0079bf', '#d29034', '#519839', '#b04632', '#89609e',
    '#cd5a91', '#4bbf6b', '#00aecc', '#838c91'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{board ? 'Edit Board' : 'Create New Board'}</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="board-form">
          <div className="form-group">
            <label htmlFor="board-name">Board Name *</label>
            <input
              id="board-name"
              type="text"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              className={errors.name ? 'error' : ''}
              placeholder="Enter board name"
              maxLength={50}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="board-description">Description</label>
            <textarea
              id="board-description"
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder="Enter board description (optional)"
              rows={3}
              maxLength={200}
            />
          </div>
          
          <div className="form-group">
            <label>Board Color</label>
            <div className="color-picker">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleInputChange('color', color)}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {board ? 'Update Board' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoardModal;
