import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../features/auth/context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export function usePlayerStatsSocket(playerId, enabled = true) {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(() => {
    if (!enabled || !isAuthenticated || !playerId || socketRef.current?.connected) {
      return;
    }

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      setError('No auth token found');
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setIsConnected(true);
      setError(null);
      socket.emit('subscribe:player-stats', { playerId });
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    socket.on('player:stats:update', (data) => {
      console.log('[Socket] Stats update received:', data);
      if (data.playerId === playerId) {
        setStats(data.stats);
      }
    });

    socket.on('player:profile:update', (data) => {
      console.log('[Socket] Profile update received:', data);
      if (data.playerId === playerId) {
        // Could update profile data here if needed
      }
    });

    socketRef.current = socket;
  }, [enabled, isAuthenticated, playerId]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('unsubscribe:player-stats', { playerId });
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, [playerId]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      disconnect();
    }
  }, [enabled, isAuthenticated, disconnect]);

  return { stats, isConnected, error, reconnect: connect };
}