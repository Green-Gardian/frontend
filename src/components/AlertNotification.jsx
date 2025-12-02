import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Bell, AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";

const AlertNotification = ({ alert, onClose, onView }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Early return if alert is not valid
  if (!alert || typeof alert !== 'object') {
    console.warn('AlertNotification: Invalid alert prop received:', alert);
    return null;
  }

  useEffect(() => {
    // Auto-hide after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300); // Wait for animation to complete
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getPriorityIcon = (priority) => {
    if (!priority) return <Bell className="h-5 w-5 text-gray-600" />;
    
    switch (priority) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "low":
        return <AlertTriangle className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    if (!priority) return "border-gray-200 bg-gray-50";
    
    switch (priority) {
      case "critical":
        return "border-red-200 bg-red-50";
      case "high":
        return "border-orange-200 bg-orange-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      border rounded-lg shadow-lg p-4
      ${getPriorityColor(alert.priority)}
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getPriorityIcon(alert.priority)}
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">
              {alert.title || 'Alert'}
            </h4>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                alert.priority === 'critical' ? 'border-red-300 text-red-700' :
                alert.priority === 'high' ? 'border-orange-300 text-orange-700' :
                alert.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                'border-green-300 text-green-700'
              }`}
            >
              {alert.priority || 'unknown'}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
          }}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Message */}
      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
        {alert.message || 'No message provided'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          {alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : 'Unknown time'}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onView(alert);
              setIsVisible(false);
              setTimeout(() => onClose(), 300);
            }}
            className="h-7 px-2 text-xs"
          >
            View Details
          </Button>
        </div>
      </div>

      {/* Progress bar for auto-hide */}
      <div className="absolute bottom-0 left-0 h-1 bg-gray-200 rounded-b-lg">
        <div 
          className="h-full bg-primary transition-all duration-10000 ease-linear"
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

// Alert Notification Container to manage multiple notifications
export const AlertNotificationContainer = ({ alerts = [], onClose, onView }) => {
  // Filter out invalid alerts
  const validAlerts = alerts.filter(alert => 
    alert && 
    typeof alert === 'object' && 
    alert.id && 
    alert.title && 
    alert.priority
  );

  if (validAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {validAlerts.map((alert) => (
        <AlertNotification
          key={alert.id}
          alert={alert}
          onClose={() => onClose(alert.id)}
          onView={onView}
        />
      ))}
    </div>
  );
};

export default AlertNotification;
