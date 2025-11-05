import React from 'react';
import { Task, TaskPriority } from '../types';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onMoveTask?: (taskId: string, targetColumnId: string) => void;
  onMoveUp?: (taskId: string) => void;
  onMoveDown?: (taskId: string) => void;
  onMoveToFirst?: (taskId: string) => void;
  onMoveToLast?: (taskId: string) => void;
  availableColumns?: Array<{ id: string; name: string }>;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  showReorderButtons?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onMoveTask,
  onMoveUp,
  onMoveDown,
  availableColumns = [],
  draggable = true, 
  onDragStart, 
  onDragEnd,
  showReorderButtons = true
}) => {
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return '#d73a49';
      case TaskPriority.HIGH:
        return '#f66a0a';
      case TaskPriority.MEDIUM:
        return '#0366d6';
      case TaskPriority.LOW:
        return '#28a745';
      default:
        return '#6f42c1';
    }
  };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString();
  // };

  // const isOverdue = (dueDate: string) => {
  //   return new Date(dueDate) < new Date() && task.status !== 'DONE';
  // };

  const handleDragStart = (e: React.DragEvent) => {
    console.log('Drag started for task:', task.title);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    if (onDragStart) {
      onDragStart(e, task);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    console.log('Drag ended for task:', task.title);
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  return (
    <div 
      className={`task-card ${draggable ? 'draggable' : ''}`}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="task-card-header">
        <div 
          className="task-priority-indicator"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
          title={`Priority: ${task.priority}`}
        />
        <div className="task-card-actions">
          {showReorderButtons && onMoveUp && (
            <button 
              className="task-card-action-btn move-up-btn" 
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(task.id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              title="Move up"
            >
              ⬆️
            </button>
          )}
          {showReorderButtons && onMoveDown && (
            <button 
              className="task-card-action-btn move-down-btn" 
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown(task.id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              title="Move down"
            >
              ⬇️
            </button>
          )}
          <button 
            className="task-card-action-btn edit-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Edit task"
          >
            ✏️
          </button>
          <button 
            className="task-card-action-btn delete-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <h4 className="task-card-title">{task.title}</h4>
      
      {task.description && (
        <p className="task-card-description">{task.description}</p>
      )}
      
      <div className="task-card-footer">
        <span className="task-subtasks">
          0 of 3 subtasks
        </span>
        
        {onMoveTask && availableColumns.length > 0 && (
          <div className="task-move-buttons">
            {availableColumns
              .filter(col => col.id !== task.columnId)
              .map(column => (
                <button
                  key={column.id}
                  className="task-move-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveTask(task.id, column.id);
                  }}
                  title={`Move to ${column.name}`}
                >
                  → {column.name}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
