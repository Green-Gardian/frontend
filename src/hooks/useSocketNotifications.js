import { useEffect } from 'react';
import socketService from '../services/socketService';

/**
 * Show browser notification
 */
const showNotification = (title, options = {}) => {
  if (!('Notification' in window)) {
    console.log('📢', title, options.body);
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: options.tag || 'notification',
      ...options
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, {
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: options.tag || 'notification',
          ...options
        });
      }
    });
  }
};

/**
 * Show in-app notification using a custom event system
 */
const showInAppNotification = (notification) => {
  // Dispatch custom event that can be caught by a notification component
  const event = new CustomEvent('appNotification', { detail: notification });
  window.dispatchEvent(event);
};

export const useSocketNotifications = () => {
  useEffect(() => {
    if (!socketService.isSocketConnected()) {
      console.log('⚠️ Socket not connected, notification listeners not ready');
      return;
    }

    // ============ TASK ASSIGNMENT NOTIFICATIONS ============

    /**
     * Driver receives task assignment
     */
    const handleTaskAssigned = (data) => {
      console.log('🚛 Task assigned to driver:', data);
      const title = '🚛 New Task Assigned!';
      const message = `Task for ${data.bin_name} - Priority: ${data.priority}`;
      
      showNotification(title, {
        body: message,
        tag: `task-${data.id}`,
        requireInteraction: data.priority === 'critical'
      });

      showInAppNotification({
        type: 'task_assigned',
        title,
        message,
        data,
        action: 'VIEW_TASK'
      });
    };

    /**
     * Resident receives driver assignment confirmation
     */
    const handleTaskDriverAssigned = (data) => {
      console.log('✅ Driver assigned to task:', data);
      const title = '✅ Driver Assigned!';
      const message = `${data.driver_name} will handle your task. Call: ${data.driver_phone}`;
      
      showNotification(title, {
        body: message,
        tag: `task-driver-${data.id}`
      });

      showInAppNotification({
        type: 'task_driver_assigned',
        title,
        message,
        data,
        action: 'VIEW_TASK'
      });
    };

    // ============ SERVICE REQUEST ASSIGNMENT NOTIFICATIONS ============

    /**
     * Driver receives service request assignment
     */
    const handleServiceRequestAssigned = (data) => {
      console.log('🔧 Service request assigned to driver:', data);
      const title = '🔧 New Service Request!';
      const message = `${data.title} - ${data.preferred_date} ${data.preferred_time_slot || ''}`;
      
      showNotification(title, {
        body: message,
        tag: `service-request-${data.id}`,
        requireInteraction: true
      });

      showInAppNotification({
        type: 'service_request_assigned',
        title,
        message,
        data,
        action: 'VIEW_REQUEST'
      });
    };

    /**
     * Resident receives driver acceptance of service request
     */
    const handleServiceRequestDriverAssigned = (data) => {
      console.log('✅ Driver assigned to service request:', data);
      const title = '✅ Request Accepted!';
      const message = `${data.driver_name} accepted your request. Call: ${data.driver_phone}`;
      
      showNotification(title, {
        body: message,
        tag: `service-request-driver-${data.id}`
      });

      showInAppNotification({
        type: 'service_request_driver_assigned',
        title,
        message,
        data,
        action: 'VIEW_REQUEST'
      });
    };

    // ============ BIN ALERT NOTIFICATIONS ============

    const BIN_NOTIFICATION_ICONS = {
      warning:  '⚠️',
      critical: '🔴',
      full:     '🚫',
    };

    const handleBinAlert = (data) => {
      console.log('🗑️ Bin alert received:', data);
      const icon = BIN_NOTIFICATION_ICONS[data.type] || '🗑️';
      const title = `${icon} ${data.title}`;

      showNotification(title, {
        body: data.message,
        tag: `bin-alert-${data.binId}-${data.type}`,
        requireInteraction: data.type === 'critical' || data.type === 'full',
      });

      showInAppNotification({
        type: `bin_${data.type}`,
        title,
        message: data.message,
        data,
        action: 'VIEW_BIN',
      });
    };

    const handleBinSimulationComplete = (data) => {
      showInAppNotification({
        type: 'bin_simulation_complete',
        title: '✅ Simulation Complete',
        message: data.message,
        data,
      });
    };

    // Register listeners
    socketService.on('task:assigned', handleTaskAssigned);
    socketService.on('task:driver-assigned', handleTaskDriverAssigned);
    socketService.on('service-request:assigned', handleServiceRequestAssigned);
    socketService.on('service-request:driver-assigned', handleServiceRequestDriverAssigned);
    socketService.on('bin:alert', handleBinAlert);
    socketService.on('bin:simulation:complete', handleBinSimulationComplete);

    console.log('✅ Socket notification listeners registered');

    return () => {
      socketService.off('task:assigned', handleTaskAssigned);
      socketService.off('task:driver-assigned', handleTaskDriverAssigned);
      socketService.off('service-request:assigned', handleServiceRequestAssigned);
      socketService.off('service-request:driver-assigned', handleServiceRequestDriverAssigned);
      socketService.off('bin:alert', handleBinAlert);
      socketService.off('bin:simulation:complete', handleBinSimulationComplete);
    };
  }, []);
};

/**
 * Hook to initialize socket and trigger notifications
 * Usage: useSocketNotifications(); in your main App.jsx component
 */
export const initializeSocketNotifications = () => {
  return useSocketNotifications;
};

