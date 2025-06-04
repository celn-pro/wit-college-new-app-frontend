import io, { Socket } from 'socket.io-client';
import { BASE_URL } from '../utils';
import { Notification } from './notificationService';
import { useAppStore } from '../store';
import { notificationService } from './notificationService';
import { AppState } from 'react-native';

export const socketService = {
  socket: null as Socket | null,

  /**
   * Initialize socket connection
   * @param userId User ID for joining
   * @param token Auth token
   */
  initialize(userId: string, token: string): void {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(BASE_URL , {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      this.socket?.emit('join', userId);
    });

    this.socket.on('notification', (notification: Notification) => {
        if (notification.userId === userId) {
            // Ensure the notification has a 'read' property
            const notificationWithRead = { ...notification, read: false };
            useAppStore.getState().addNotification(notificationWithRead);
            if (AppState.currentState === 'active') {
            notificationService.displayNotification(notificationWithRead);
            }
        }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  },

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },
};