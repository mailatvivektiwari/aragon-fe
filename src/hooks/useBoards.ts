import { useState, useEffect } from 'react';
import { Board, CreateBoardData } from '../types';
import { boardsApi } from '../services/api';

export const useBoards = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await boardsApi.getAll();
      setBoards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch boards');
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (boardData: CreateBoardData) => {
    try {
      setError(null);
      const newBoard = await boardsApi.create(boardData);
      setBoards(prev => [...prev, newBoard]);
      return newBoard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
      throw err;
    }
  };

  const updateBoard = async (id: string, boardData: Partial<CreateBoardData>) => {
    try {
      setError(null);
      const updatedBoard = await boardsApi.update(id, boardData);
      setBoards(prev => prev.map(board => 
        board.id === id ? updatedBoard : board
      ));
      return updatedBoard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update board');
      throw err;
    }
  };

  const deleteBoard = async (id: string) => {
    try {
      setError(null);
      await boardsApi.delete(id);
      setBoards(prev => prev.filter(board => board.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete board');
      throw err;
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  return {
    boards,
    loading,
    error,
    createBoard,
    updateBoard,
    deleteBoard,
    refetch: fetchBoards,
  };
};
