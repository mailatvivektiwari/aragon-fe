import React from 'react';
import { Board } from '../types';
import './BoardCard.css';

interface BoardCardProps {
  board: Board;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, onClick, onEdit, onDelete }) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="board-card" onClick={onClick} style={{ borderLeftColor: board.color }}>
      <div className="board-card-header">
        <h3 className="board-card-title">{board.name}</h3>
        <div className="board-card-actions">
          <button 
            className="board-card-action-btn edit-btn" 
            onClick={handleEditClick}
            title="Edit board"
          >
            ✏️
          </button>
          <button 
            className="board-card-action-btn delete-btn" 
            onClick={handleDeleteClick}
            title="Delete board"
          >
            🗑️
          </button>
        </div>
      </div>
      {board.description && (
        <p className="board-card-description">{board.description}</p>
      )}
      <div className="board-card-meta">
        <span className="board-card-columns">
          {board.columns?.length || 0} columns
        </span>
        <span className="board-card-tasks">
          {board.columns?.reduce((total, col) => total + (col.tasks?.length || 0), 0) || 0} tasks
        </span>
      </div>
    </div>
  );
};

export default BoardCard;
