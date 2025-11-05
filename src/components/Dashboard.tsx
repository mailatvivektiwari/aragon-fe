import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoards } from '../hooks/useBoards';
import { useAuth } from '../contexts/AuthContext';
import BoardModal from './BoardModal';
import ThemeToggle from './ThemeToggle';
import { Board } from '../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { boards, loading, error, createBoard, updateBoard } = useBoards();
  const { user, logout } = useAuth();
  const [showBoardModal, setShowBoardModal] = useState<boolean>(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateBoard = () => {
    setEditingBoard(null);
    setShowBoardModal(true);
  };

  const handleBoardClick = (board: Board) => {
    navigate(`/board/${board.id}`);
  };

  const handleBoardModalSubmit = async (boardData: any) => {
    try {
      if (editingBoard) {
        await updateBoard(editingBoard.id, boardData);
      } else {
        const newBoard = await createBoard(boardData);
        // Navigate to the new board after creation
        navigate(`/board/${newBoard.id}`);
      }
      setShowBoardModal(false);
      setEditingBoard(null);
    } catch (error) {
      console.error('Failed to save board:', error);
    }
  };

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <h1>kanban</h1>
        </div>

        <div className="boards-section">
          <h2>All Boards ({boards.length})</h2>

          <div className="boards-list">
            {loading && <div className="loading">Loading boards...</div>}

            {error && <div className="error">Error: {error}</div>}

            {!loading && !error && boards.length > 0 && boards.map((board: Board) => (
              <button
                key={board.id}
                className="board-item"
                onClick={() => handleBoardClick(board)}
              >
                <span className="board-icon">📋</span>
                {board.name}
              </button>
            ))}

            <button className="board-item create-board" onClick={handleCreateBoard}>
              <span className="board-icon">+</span>
              + Create New Board
            </button>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-email">{user?.email || user?.name || 'User'}</div>
          </div>
          <div className="footer-actions">
            <ThemeToggle />
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <span className="logout-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <h2>Welcome to Kanban</h2>
            <p>Select a board from the sidebar to get started, or create a new one.</p>
            
            {boards.length === 0 && !loading && (
              <div className="empty-state">
                <h3>No boards yet</h3>
                <p>Create your first board to start organizing your tasks!</p>
                <button className="btn-primary" onClick={handleCreateBoard}>
                  Create Your First Board
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {showBoardModal && (
        <BoardModal
          board={editingBoard}
          onSubmit={handleBoardModalSubmit}
          onClose={() => {
            setShowBoardModal(false);
            setEditingBoard(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
