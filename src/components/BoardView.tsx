import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Board, Column, Task } from '../types';
import { boardsApi, tasksApi, canDeleteBoard, columnsApi } from '../services/api';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import ConfirmationModal from './ConfirmationModal';
import ColumnModal from './ColumnModal';
import './BoardView.css';

interface BoardViewProps {
  board: Board;
  onBoardDeleted?: () => void;
}

const BoardView: React.FC<BoardViewProps> = ({ board: initialBoard, onBoardDeleted }) => {
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board>(initialBoard);
  // const [loading, setLoading] = useState(false); // Removed for now
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<Column | null>(null);
  const [dragOverColumnPosition, setDragOverColumnPosition] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);

  const refreshBoard = async () => {
    try {
      const updatedBoard = await boardsApi.getById(board.id);
      setBoard(updatedBoard);
    } catch (error) {
      console.error('Failed to refresh board:', error);
    }
  };

  // Create default columns if they don't exist
  const ensureColumnsExist = async () => {
    if (!board.columns || board.columns.length === 0) {
      try {
        console.log('No columns found, creating default columns...');
        
        // Create default columns
        const defaultColumns = [
          { name: 'To Do', position: 0 },
          { name: 'In Progress', position: 1 },
          { name: 'Done', position: 2 }
        ];
        
        for (const col of defaultColumns) {
          await columnsApi.create({
            name: col.name,
            boardId: board.id,
            position: col.position
          });
        }
        
        console.log('Default columns created successfully');
        await refreshBoard();
      } catch (error) {
        console.error('Failed to create default columns:', error);
        alert('Failed to create columns. Please try again.');
      }
    }
  };

  useEffect(() => {
    refreshBoard().then(() => {
      // After refreshing, check if we need to create columns
      if (!board.columns || board.columns.length === 0) {
        ensureColumnsExist();
      }
    });
  }, [board.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateTask = async (columnId: string) => {
    // Check if we're using a temporary column ID
    if (columnId.startsWith('temp-')) {
      console.log('Cannot create task with temporary column, creating real columns first...');
      await ensureColumnsExist();
      // After columns are created, use the first real column
      if (board.columns && board.columns.length > 0) {
        setSelectedColumn(board.columns[0].id);
      } else {
        alert('Failed to create columns. Please refresh the page and try again.');
        return;
      }
    } else {
      setSelectedColumn(columnId);
    }
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedColumn(task.columnId);
    setShowTaskModal(true);
  };

  const handleTaskModalClose = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    setSelectedColumn('');
  };

  const handleTaskModalSubmit = async () => {
    setShowTaskModal(false);
    setEditingTask(null);
    setSelectedColumn('');
    await refreshBoard();
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    console.log('BoardView: Drag started for task:', task.title);
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    // Add visual feedback
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.classList.add('dragging');
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    console.log('BoardView: Drag ended');
    setDraggedTask(null);
    setDragOverColumn(null);
    setDragOverPosition(null);
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('dragging');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    console.log('BoardView: Drag enter column:', columnId);
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if we're leaving the column entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string, dropPosition?: number) => {
    e.preventDefault();
    console.log('BoardView: Drop in column:', targetColumnId, 'at position:', dropPosition);
    setDragOverColumn(null);
    setDragOverPosition(null);

    if (!draggedTask) {
      console.log('No dragged task found');
      return;
    }

    // Calculate the target position
    const targetColumn = columns.find(col => col.id === targetColumnId);
    const targetTasks = targetColumn?.tasks || [];
    
    let newPosition: number;
    
    if (dropPosition !== undefined) {
      // Dropped at a specific position
      newPosition = dropPosition;
    } else {
      // Dropped at the end of the column
      newPosition = targetTasks.length;
    }

    // If moving within the same column and to a position after the current position,
    // adjust for the fact that the dragged task will be removed first
    if (draggedTask.columnId === targetColumnId && newPosition > draggedTask.position) {
      newPosition--;
    }

    await moveTaskToPosition(draggedTask.id, targetColumnId, newPosition);
  };

  const moveTaskToPosition = async (taskId: string, targetColumnId: string, newPosition: number) => {
    try {
      console.log('=== MOVE TASK TO POSITION ===');
      console.log('Task ID:', taskId);
      console.log('Target Column ID:', targetColumnId);
      console.log('New Position:', newPosition);
      
      // Check if the column ID is valid (not a temp ID)
      if (targetColumnId.startsWith('temp-')) {
        console.error('Cannot move task to temporary column ID:', targetColumnId);
        alert('Cannot move task: Invalid column. Please refresh the page and try again.');
        return;
      }
      
      // Use the backend move endpoint for proper position handling
      const result = await tasksApi.move(taskId, targetColumnId, newPosition);
      console.log('Move API result:', result);
      
      // Refresh the board to get updated data
      await refreshBoard();
      
      console.log('Task moved successfully and board refreshed');
    } catch (error: any) {
      console.error('Failed to move task:', error);
      console.error('Error response:', error.response?.data);
      
      // Show more detailed error information
      if (error.response?.data?.message) {
        alert(`Failed to move task: ${error.response.data.message}`);
      } else if (error instanceof Error) {
        alert(`Failed to move task: ${error.message}`);
      } else {
        alert('Failed to move task. Please try again.');
      }
    }
  };

  const moveTask = async (taskId: string, targetColumnId: string) => {
    try {
      console.log('Moving task', taskId, 'to column', targetColumnId);
      
      // Map frontend column IDs to task status
      let status;
      switch (targetColumnId) {
        case 'todo':
          status = 'TODO';
          break;
        case 'in-progress':
          status = 'IN_PROGRESS';
          break;
        case 'done':
          status = 'DONE';
          break;
        default:
          status = 'TODO';
      }

      // Update the task status
      await tasksApi.update(taskId, { 
        status: status as any
      });
      
      // Refresh the board to get updated data
      await refreshBoard();
      
      console.log('Task moved successfully');
    } catch (error) {
      console.error('Failed to move task:', error);
      console.error('Error details:', error);
      alert('Failed to move task. Please try again.');
    }
  };

  const moveTaskUp = async (taskId: string) => {
    const task = columns.flatMap(col => col.tasks || []).find(t => t.id === taskId);
    if (!task) {
      console.log('Task not found:', taskId);
      return;
    }

    const currentColumn = columns.find(col => col.id === task.columnId);
    if (!currentColumn?.tasks) {
      console.log('Column not found or has no tasks:', task.columnId);
      return;
    }

    console.log('Current task position:', task.position);
    console.log('Column tasks:', currentColumn.tasks.map(t => ({ id: t.id, title: t.title, position: t.position })));

    if (task.position === 0) {
      console.log('Task is already at the top');
      return;
    }

    const newPosition = task.position - 1;
    console.log('Moving task up from position', task.position, 'to', newPosition);
    await moveTaskToPosition(taskId, task.columnId, newPosition);
  };

  const moveTaskDown = async (taskId: string) => {
    const task = columns.flatMap(col => col.tasks || []).find(t => t.id === taskId);
    if (!task) {
      console.log('Task not found:', taskId);
      return;
    }

    const currentColumn = columns.find(col => col.id === task.columnId);
    if (!currentColumn?.tasks) {
      console.log('Column not found or has no tasks:', task.columnId);
      return;
    }

    const maxPosition = currentColumn.tasks.length - 1;
    console.log('Current task position:', task.position, 'Max position:', maxPosition);

    if (task.position >= maxPosition) {
      console.log('Task is already at the bottom');
      return;
    }

    const newPosition = task.position + 1;
    console.log('Moving task down from position', task.position, 'to', newPosition);
    await moveTaskToPosition(taskId, task.columnId, newPosition);
  };

  // Removed unused functions moveTaskToFirst and moveTaskToLast

  const handleDeleteBoard = () => {
    const deleteCheck = canDeleteBoard(board);
    
    if (!deleteCheck.canDelete) {
      alert(deleteCheck.reason);
      return;
    }

    setShowDeleteConfirmation(true);
  };

  const confirmDeleteBoard = async () => {
    try {
      await boardsApi.delete(board.id);
      
      // Navigate back to dashboard
      navigate('/');
      
      // Call callback if provided
      if (onBoardDeleted) {
        onBoardDeleted();
      }
    } catch (error) {
      console.error('Failed to delete board:', error);
      alert('Failed to delete board. Please try again.');
    } finally {
      setShowDeleteConfirmation(false);
    }
  };

  const handleCreateColumn = () => {
    setEditingColumn(null);
    setShowColumnModal(true);
  };

  const handleEditColumn = (column: Column) => {
    setEditingColumn(column);
    setShowColumnModal(true);
  };

  const handleColumnModalClose = () => {
    setShowColumnModal(false);
    setEditingColumn(null);
  };

  const handleColumnModalSubmit = async () => {
    setShowColumnModal(false);
    setEditingColumn(null);
    await refreshBoard();
  };

  // Column drag and drop handlers
  const handleColumnDragStart = (e: React.DragEvent, column: Column) => {
    console.log('Column drag started:', column.name);
    
    // Prevent task dragging when column is being dragged
    e.stopPropagation();
    
    setDraggedColumn(column);
    setDraggedTask(null); // Clear any task drag state
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `column-${column.id}`);
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'column', data: column }));
    
    // Add visual feedback to the entire column and container
    setTimeout(() => {
      const columnElement = document.querySelector(`[data-column-id="${column.id}"]`);
      const containerElement = document.querySelector('.columns-container');
      if (columnElement) {
        columnElement.classList.add('dragging-column');
      }
      if (containerElement) {
        containerElement.classList.add('column-dragging');
      }
    }, 0);
  };

  const handleColumnDragEnd = (e: React.DragEvent) => {
    console.log('Column drag ended');
    
    // Remove visual feedback from all columns and container
    document.querySelectorAll('.dragging-column').forEach(el => {
      el.classList.remove('dragging-column');
    });
    document.querySelectorAll('.column-dragging').forEach(el => {
      el.classList.remove('column-dragging');
    });
    
    setDraggedColumn(null);
    setDragOverColumnPosition(null);
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDragEnter = (e: React.DragEvent, targetPosition: number) => {
    e.preventDefault();
    
    // Only handle column drag events
    const dragData = e.dataTransfer.getData('text/plain');
    if (dragData.startsWith('column-') && draggedColumn) {
      console.log('Column drag enter position:', targetPosition);
      setDragOverColumnPosition(targetPosition);
    }
  };

  const handleColumnDrop = async (e: React.DragEvent, targetPosition: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Column drop at position:', targetPosition);
    setDragOverColumnPosition(null);

    // Only handle column drops
    const dragData = e.dataTransfer.getData('text/plain');
    if (!dragData.startsWith('column-') || !draggedColumn) {
      console.log('Not a column drop or no dragged column found');
      return;
    }

    // Don't do anything if dropping at the same position
    if (draggedColumn.position === targetPosition) {
      console.log('Column dropped at same position, no change needed');
      return;
    }

    await moveColumnToPosition(draggedColumn.id, targetPosition);
  };

  const moveColumnToPosition = async (columnId: string, newPosition: number) => {
    try {
      console.log('=== MOVE COLUMN TO POSITION ===');
      console.log('Column ID:', columnId);
      console.log('New Position:', newPosition);
      
      // Use the backend reorder endpoint
      await columnsApi.reorder(columnId, newPosition);
      
      // Refresh the board to get updated data
      await refreshBoard();
      
      console.log('Column moved successfully and board refreshed');
    } catch (error: any) {
      console.error('Failed to move column:', error);
      console.error('Error response:', error.response?.data);
      
      // Show more detailed error information
      if (error.response?.data?.message) {
        alert(`Failed to move column: ${error.response.data.message}`);
      } else if (error instanceof Error) {
        alert(`Failed to move column: ${error.message}`);
      } else {
        alert('Failed to move column. Please try again.');
      }
    }
  };

  // Use actual columns from the board, or create default ones if none exist
  const columns: Column[] = board.columns && board.columns.length > 0 
    ? board.columns
        .sort((a, b) => a.position - b.position)
        .map(column => ({
          ...column,
          tasks: column.tasks ? column.tasks.sort((a, b) => a.position - b.position) : []
        }))
    : [
        {
          id: 'temp-todo',
          name: 'To Do',
          position: 0,
          boardId: board.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tasks: []
        },
        {
          id: 'temp-in-progress',
          name: 'In Progress',
          position: 1,
          boardId: board.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tasks: []
        },
        {
          id: 'temp-done',
          name: 'Done',
          position: 2,
          boardId: board.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tasks: []
        }
      ];

  // Debug: Log column information
  console.log('=== BOARD COLUMNS DEBUG ===');
  console.log('Board has columns:', board.columns?.length || 0);
  console.log('Using columns:', columns.map(col => ({ 
    id: col.id, 
    name: col.name, 
    taskCount: col.tasks?.length || 0,
    isTemp: col.id.startsWith('temp-')
  })));

  return (
    <div className="board-view">
      <header className="board-header">
        <h1 className="board-title">
          {board.name}
        </h1>
        <div className="board-header-actions">
          <button 
            className="share-board-btn" 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Board link copied to clipboard!');
            }}
            title="Share board"
          >
            🔗 Share
          </button>
          <button 
            className="delete-board-btn" 
            onClick={handleDeleteBoard}
            title="Delete board"
          >
            🗑️ Delete
          </button>
          <button className="add-task-btn" onClick={() => handleCreateTask(columns[0]?.id || '')}>
            <span>+</span>
            Add New Task
          </button>
        </div>
      </header>


            <div className="columns-container">
              {/* Column drop zones */}
              <div 
                className={`column-drop-zone ${dragOverColumnPosition === 0 ? 'drag-over' : ''}`}
                onDragOver={handleColumnDragOver}
                onDragEnter={(e) => handleColumnDragEnter(e, 0)}
                onDrop={(e) => handleColumnDrop(e, 0)}
              />
              
              {columns.map((column, index) => (
                <React.Fragment key={column.id}>
                  <div 
                    className={`column ${dragOverColumn === column.id ? 'drag-over' : ''} ${draggedColumn?.id === column.id ? 'dragging-column' : ''}`}
                    data-column-id={column.id}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                   <div 
                     className="column-header"
                     draggable={true}
                     onDragStart={(e) => handleColumnDragStart(e, column)}
                     onDragEnd={handleColumnDragEnd}
                   >
                     <div className="column-drag-handle" title="Drag to reorder column">
                       ⋮⋮
                     </div>
                     <div className="column-indicator"></div>
                     <h3 className="column-title">
                       {column.name} ({column.tasks?.length || 0})
                     </h3>
                     <div className="column-actions">
                       <button 
                         className="column-action-btn" 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleEditColumn(column);
                         }}
                         onMouseDown={(e) => e.stopPropagation()}
                         title="Edit column"
                       >
                         ⚙️
                       </button>
                     </div>
                   </div>
            
            <div className="tasks-list">
              {/* Drop zone at the top */}
              <div 
                className={`task-drop-zone ${dragOverPosition === 0 ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOverColumn(column.id);
                  setDragOverPosition(0);
                }}
                onDrop={(e) => handleDrop(e, column.id, 0)}
              />
              
              {column.tasks?.map((task, index) => (
                <React.Fragment key={task.id}>
                  <TaskCard
                    task={task}
                    onEdit={() => handleEditTask(task)}
                    onDelete={async () => {
                      if (window.confirm('Are you sure you want to delete this task?')) {
                        try {
                          await tasksApi.delete(task.id);
                          await refreshBoard();
                        } catch (error) {
                          console.error('Failed to delete task:', error);
                          alert('Failed to delete task. Please try again.');
                        }
                      }
                    }}
                    onMoveTask={moveTask}
                    onMoveUp={moveTaskUp}
                    onMoveDown={moveTaskDown}
                    availableColumns={columns.map(col => ({ id: col.id, name: col.name }))}
                    draggable={true}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    showReorderButtons={true}
                  />
                  
                  {/* Drop zone after each task */}
                  <div 
                    className={`task-drop-zone ${dragOverPosition === index + 1 ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setDragOverColumn(column.id);
                      setDragOverPosition(index + 1);
                    }}
                    onDrop={(e) => handleDrop(e, column.id, index + 1)}
                  />
                </React.Fragment>
              ))}
              
              {(!column.tasks || column.tasks.length === 0) && (
                <div className="empty-column">
                  <p>No tasks yet</p>
                  <button 
                    className="create-first-task-btn"
                    onClick={() => handleCreateTask(column.id)}
                  >
                    Create your first task
                  </button>
                </div>
                     )}
                   </div>
                 </div>
                 
                 {/* Drop zone after each column */}
                 <div 
                   className={`column-drop-zone ${dragOverColumnPosition === index + 1 ? 'drag-over' : ''}`}
                   onDragOver={handleColumnDragOver}
                   onDragEnter={(e) => handleColumnDragEnter(e, index + 1)}
                   onDrop={(e) => handleColumnDrop(e, index + 1)}
                 />
               </React.Fragment>
               ))}

               <div className="new-column">
                 <button className="new-column-btn" onClick={handleCreateColumn}>
                   + New Column
                 </button>
               </div>
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          columnId={selectedColumn}
          columns={columns.map(col => ({ id: col.id, name: col.name, tasks: col.tasks }))}
          onSubmit={handleTaskModalSubmit}
          onClose={handleTaskModalClose}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Delete Board"
        message={`Are you sure you want to delete "${board.name}"? This action cannot be undone and will permanently delete the board and all its tasks.`}
        confirmText="Delete Board"
        cancelText="Cancel"
        onConfirm={confirmDeleteBoard}
        onCancel={() => setShowDeleteConfirmation(false)}
        type="danger"
      />

      {showColumnModal && (
        <ColumnModal
          column={editingColumn}
          boardId={board.id}
          onSubmit={handleColumnModalSubmit}
          onClose={handleColumnModalClose}
        />
      )}
    </div>
  );
};

export default BoardView;
