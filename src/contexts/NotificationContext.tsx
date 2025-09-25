import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'sport_enrollment' | 'payment' | 'sponsorship' | 'system';
  timestamp: string;
  status: string;
  read: boolean;
  metadata?: {
    sport?: string;
    subCategory?: string;
    amount?: number;
    [key: string]: any;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  getNotifications: () => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const getNotifications = useCallback(() => notifications, [notifications]);

  const contextValue = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    getNotifications
  }), [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, getNotifications]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};