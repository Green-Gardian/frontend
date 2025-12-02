# Alerts Frontend Implementation

This document describes the frontend implementation of the Alert Broadcasting System for the Green Guardian project.

## Overview

The alerts frontend provides a comprehensive interface for managing system alerts, including:
- Creating and editing alerts
- Viewing alert history and statistics
- Real-time notifications via WebSocket
- User notification preferences management
- Responsive design matching the existing UI system

## Components

### 1. Alerts Page (`/src/Pages/Alerts/Alerts.jsx`)
Main alerts management interface with:
- **Info Cards**: Display total, pending, sent, and failed alert counts
- **Search & Filtering**: Search alerts by title, message, priority, or status
- **Data Table**: Paginated table showing all alerts with actions
- **Create/Edit Modal**: Form for creating and editing alerts
- **Real-time Updates**: WebSocket integration for live notifications

### 2. Alert Form (`/src/components/forms/alertForm.jsx`)
Form component for creating and editing alerts:
- **Title & Message**: Text inputs for alert content
- **Alert Type**: Dropdown selection from available alert types
- **Priority**: Selection from low, medium, high, critical
- **Scheduling**: Optional scheduling for future delivery
- **Validation**: Form validation with error handling

### 3. Alert Notification (`/src/components/AlertNotification.jsx`)
Real-time notification component:
- **Toast Notifications**: Auto-dismissing alert notifications
- **Priority Styling**: Color-coded by priority level
- **Action Buttons**: View details and dismiss options
- **Auto-hide**: Configurable auto-dismiss timing

### 4. Notification Preferences (`/src/components/NotificationPreferences.jsx`)
User preference management:
- **Channel Toggles**: Enable/disable email, SMS, and push notifications
- **Alert Type Groups**: Preferences organized by alert type
- **Real-time Updates**: Immediate preference changes

### 5. WebSocket Hook (`/src/hooks/useWebSocket.js`)
Real-time communication:
- **Connection Management**: Automatic connection and reconnection
- **Message Handling**: Parsing and routing of WebSocket messages
- **Alert Integration**: Real-time alert updates and notifications

## Services

### Alerts Service (`/src/services/alerts.js`)
API integration for all alert operations:
- **CRUD Operations**: Create, read, update, delete alerts
- **Statistics**: Fetch alert counts and metrics
- **Preferences**: Manage user notification settings
- **Communication Logs**: Access delivery and status logs

## Features

### Alert Management
- ✅ Create new alerts with title, message, type, and priority
- ✅ Schedule alerts for future delivery
- ✅ Edit pending alerts before sending
- ✅ Cancel scheduled alerts
- ✅ View detailed alert information

### Real-time Notifications
- ✅ WebSocket connection for live updates
- ✅ Toast notifications for new alerts
- ✅ Automatic reconnection handling
- ✅ Society-based room management

### User Experience
- ✅ Responsive design for all screen sizes
- ✅ Consistent styling with existing components
- ✅ Loading states and error handling
- ✅ Search and pagination
- ✅ Priority-based color coding

### Notification Preferences
- ✅ Per-alert-type preference settings
- ✅ Email, SMS, and push notification toggles
- ✅ Real-time preference updates
- ✅ User-friendly interface

## Styling

The alerts frontend follows the existing design system:
- **Colors**: Uses the established color palette and primary colors
- **Typography**: Consistent with Inter font family
- **Components**: Leverages existing UI components (Button, Badge, Table, etc.)
- **Layout**: Responsive grid system with proper spacing
- **Icons**: Lucide React icons for consistency

## Integration

### Backend API
- **Endpoints**: All CRUD operations via REST API
- **Authentication**: JWT token-based authentication
- **Real-time**: WebSocket connection for live updates

### Existing System
- **Routing**: Integrated with React Router
- **Navigation**: Added to admin sidebar
- **State Management**: Uses React hooks for local state
- **Error Handling**: Consistent error handling patterns

## Usage

### For Administrators
1. Navigate to `/admin/alerts` in the sidebar
2. View alert statistics and history
3. Create new alerts using the "Create Alert" button
4. Edit or cancel pending alerts as needed
5. Monitor real-time alert delivery

### For Users
1. Access notification preferences
2. Configure preferred notification channels
3. Receive real-time alert notifications
4. View alert details and history

## Technical Details

### Dependencies
- **React**: Component-based UI framework
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **js-cookie**: Cookie management for authentication

### Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **WebSocket**: Required for real-time features
- **ES6+**: Modern JavaScript features

### Performance
- **Lazy Loading**: Components loaded as needed
- **Pagination**: Efficient data display
- **Debounced Search**: Optimized search performance
- **WebSocket**: Efficient real-time communication

## Future Enhancements

### Planned Features
- **Bulk Operations**: Select and manage multiple alerts
- **Advanced Filtering**: Date range, status, and type filters
- **Export Functionality**: CSV/PDF export of alert data
- **Mobile App**: Native mobile application
- **Push Notifications**: Browser push notification support

### Technical Improvements
- **Offline Support**: Service worker for offline functionality
- **Caching**: Intelligent data caching strategies
- **Performance**: Virtual scrolling for large datasets
- **Accessibility**: Enhanced screen reader support

## Troubleshooting

### Common Issues
1. **WebSocket Connection Failed**
   - Check backend server status
   - Verify authentication token
   - Check network connectivity

2. **Alerts Not Loading**
   - Verify API endpoint configuration
   - Check authentication status
   - Review browser console for errors

3. **Real-time Notifications Not Working**
   - Ensure WebSocket URL is correct
   - Check backend WebSocket service
   - Verify user permissions

### Debug Information
- **Console Logs**: Detailed logging for debugging
- **Network Tab**: API request/response monitoring
- **WebSocket Tab**: Real-time connection status
- **Error Boundaries**: Graceful error handling

## Contributing

When contributing to the alerts frontend:
1. Follow existing code patterns and styling
2. Maintain responsive design principles
3. Add proper error handling and loading states
4. Test with different screen sizes and devices
5. Update documentation for new features

## Support

For technical support or questions:
- Check the backend API documentation
- Review browser console for error messages
- Verify environment variable configuration
- Test with different user roles and permissions
