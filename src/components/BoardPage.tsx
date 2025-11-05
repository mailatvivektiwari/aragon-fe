import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBoards } from '../hooks/useBoards';
import { useAuth } from '../contexts/AuthContext';
import { boardsApi } from '../services/api';
import BoardView from './BoardView';
import BoardModal from './BoardModal';
import ThemeToggle from './ThemeToggle';
import { Board } from '../types';
import './BoardPage.css';

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { boards, loading: boardsLoading, createBoard, updateBoard } = useBoards();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBoardModal, setShowBoardModal] = useState<boolean>(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);

  // Load the specific board
  useEffect(() => {
    const loadBoard = async () => {
      if (!boardId) {
        setError('Board ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const board = await boardsApi.getById(boardId);
        setCurrentBoard(board);
      } catch (err: any) {
        console.error('Failed to load board:', err);
        setError('Board not found');
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [boardId]);

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
        navigate(`/board/${newBoard.id}`);
      }
      setShowBoardModal(false);
      setEditingBoard(null);
    } catch (error) {
      console.error('Failed to save board:', error);
    }
  };

  if (loading) {
    return (
      <div className="board-page">
        <aside className="board-page-sidebar">
          <div className="board-page-logo">
            <Link to="/">
              <h1>kanban</h1>
            </Link>
          </div>
          <div className="loading">Loading...</div>
        </aside>
        <main className="board-page-main">
          <div className="loading-main">Loading board...</div>
        </main>
      </div>
    );
  }

  if (error || !currentBoard) {
    return (
      <div className="board-page">
        <aside className="board-page-sidebar">
          <div className="board-page-logo">
            <Link to="/">
              <h1>kanban</h1>
            </Link>
          </div>
          <div className="error">Board not found</div>
        </aside>
        <main className="board-page-main">
          <div className="error-main">
            <h2>Board Not Found</h2>
            <p>The board you're looking for doesn't exist or has been deleted.</p>
            <Link to="/" className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="board-page">
      <aside className="board-page-sidebar">
        <div className="board-page-logo">
          <Link to="/">
            <h1>kanban</h1>
          </Link>
        </div>

        <div className="boards-section">
          <h2>All Boards ({boards.length})</h2>

          <div className="boards-list">
            {boardsLoading && <div className="loading">Loading boards...</div>}

            {!boardsLoading && boards.length > 0 && boards.map((board: Board) => (
              <button
                key={board.id}
                className={`board-item ${currentBoard?.id === board.id ? 'active' : ''}`}
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

      <main className="board-page-main">
        <BoardView board={currentBoard} />
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

export default BoardPage;
