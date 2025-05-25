import React, { createContext, useContext, useState, useCallback } from 'react';
import { database, ref, push, get, onValue } from '../firebase';
import { useAuth } from './AuthContext';

const HistoryContext = createContext();

export function useHistory() {
  return useContext(HistoryContext);
}

export function HistoryProvider({ children }) {
  const [historyEntries, setHistoryEntries] = useState({});
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const recordHistory = useCallback(async (projectId, bookingId, action, changes, metadata = {}) => {
    if (!currentUser) return;

    const historyRef = ref(database, `history/${projectId}`);
    const historyEntry = {
      timestamp: new Date().toISOString(),
      userId: currentUser.uid,
      userEmail: currentUser.email,
      bookingId,
      action,
      changes,
      metadata,
      projectId
    };

    try {
      await push(historyRef, historyEntry);
    } catch (error) {
      console.error('Failed to record history:', error);
    }
  }, [currentUser]);

  const fetchHistory = useCallback(async (projectId, options = {}) => {
    setLoading(true);
    try {
      const historyRef = ref(database, `history/${projectId}`);
      const snapshot = await get(historyRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const entries = Object.entries(data).map(([id, entry]) => ({
          id,
          ...entry
        }));
        
        // Sort by timestamp (newest first)
        entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Apply limit if specified
        const limitedEntries = options.limit ? entries.slice(0, options.limit) : entries;
        
        setHistoryEntries(prev => ({
          ...prev,
          [projectId]: limitedEntries
        }));
      } else {
        setHistoryEntries(prev => ({
          ...prev,
          [projectId]: []
        }));
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribeToHistory = useCallback((projectId, limit = 20) => {
    const historyRef = ref(database, `history/${projectId}`);
    
    const unsubscribe = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const entries = Object.entries(data).map(([id, entry]) => ({
          id,
          ...entry
        }));
        
        // Sort by timestamp (newest first)
        entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Apply limit
        const limitedEntries = entries.slice(0, limit);
        
        setHistoryEntries(prev => ({
          ...prev,
          [projectId]: limitedEntries
        }));
      } else {
        setHistoryEntries(prev => ({
          ...prev,
          [projectId]: []
        }));
      }
    });

    return unsubscribe;
  }, []);

  const getProjectHistory = useCallback((projectId) => {
    return historyEntries[projectId] || [];
  }, [historyEntries]);

  const value = {
    historyEntries,
    loading,
    recordHistory,
    fetchHistory,
    subscribeToHistory,
    getProjectHistory
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}