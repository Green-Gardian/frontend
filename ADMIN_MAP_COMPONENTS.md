// Admin Map Components for Driver Tracking

## SuperAdmin Driver Map (`frontend/src/Pages/SuperAdmin/DriverMapView.jsx`)

```jsx
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import socketService from '../../services/socketService';
import axios from 'axios';

const DriverMapView = () => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchAllDrivers();
    initializeSocket();

    return () => {
      if (socketService.socket) {
        socketService.socket.off('driver-location-update');
      }
    };
  }, []);

  const fetchAllDrivers = async () => {
    try {
      const response = await axios.get('/tasks/admin/drivers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setDrivers(response.data.drivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const initializeSocket = () => {
    if (!socketService.socket?.connected) {
      socketService.connect();
    }

    socketService.socket?.on('driver-location-update', (locationData) => {
      setDrivers((prev) =>
        prev.map((driver) =>
          driver.id === locationData.driverId
            ? {
                ...driver,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                heading: locationData.heading,
                speed: locationData.speed,
                recorded_at: locationData.recordedAt,
              }
            : driver
        )
      );
    });
  };

  const getTruckIcon = (heading = 0) => {
    return L.divIcon({
      html: `
        <div style="
          background-color: #4CAF50;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          transform: rotate(${heading}deg);
          cursor: pointer;
        ">
          <span style="color: white; font-size: 18px;">🚚</span>
        </div>
      `,
      iconSize: [32, 32],
      className: 'driver-marker',
    });
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={[33.9124, 67.1910]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {drivers.map((driver) => (
          driver.latitude && driver.longitude && (
            <Marker
              key={driver.id}
              position={[driver.latitude, driver.longitude]}
              icon={getTruckIcon(driver.heading || 0)}
              eventHandlers={{
                click: () => setSelectedDriver(driver),
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h4>{driver.first_name} {driver.last_name}</h4>
                  <p><strong>Society:</strong> {driver.society_name}</p>
                  <p><strong>Phone:</strong> <a href={`tel:${driver.phone_number}`}>{driver.phone_number}</a></p>
                  <p><strong>Active Tasks:</strong> {driver.active_tasks || 0}</p>
                  <p><strong>Speed:</strong> {driver.speed?.toFixed(1) || 0} km/h</p>
                  <p><strong>Last Update:</strong> {new Date(driver.recorded_at).toLocaleTimeString()}</p>
                  <button onClick={() => setSelectedDriver(driver)}>View Details</button>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {selectedDriver && (
        <DriverDetailPanel driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
      )}
    </div>
  );
};

export default DriverMapView;
```

---

## Society Admin Driver Map (`frontend/src/Pages/Admin/SocietyDriverMapView.jsx`)

```jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import socketService from '../../services/socketService';

const SocietyDriverMapView = ({ societyId }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocietyDrivers();
    initializeSocket();
  }, [societyId]);

  const fetchSocietyDrivers = async () => {
    try {
      const response = await axios.get(
        `/tasks/admin/societies/${societyId}/drivers/locations`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setDrivers(response.data.drivers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    if (!socketService.socket?.connected) {
      socketService.connect();
    }

    socketService.socket?.on('driver-location-update', (locationData) => {
      setDrivers((prev) =>
        prev.map((driver) =>
          driver.id === locationData.driverId
            ? { ...driver, latitude: locationData.latitude, longitude: locationData.longitude }
            : driver
        )
      );
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <MapContainer
        center={[33.9124, 67.1910]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {drivers.map(
          (driver) =>
            driver.latitude && (
              <Marker key={driver.id} position={[driver.latitude, driver.longitude]}>
                <Popup>
                  <div>
                    <h4>{driver.first_name} {driver.last_name}</h4>
                    <p>Tasks: {driver.active_tasks}</p>
                    <p><a href={`tel:${driver.phone_number}`}>Call</a></p>
                  </div>
                </Popup>
              </Marker>
            )
        )}
      </MapContainer>
    </div>
  );
};

export default SocietyDriverMapView;
```

---

## Driver Detail Panel

```jsx
// `frontend/src/components/DriverDetailPanel.jsx`

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DriverDetailPanel.css';

const DriverDetailPanel = ({ driver, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverTasks();
  }, [driver.id]);

  const fetchDriverTasks = async () => {
    try {
      const response = await axios.get(`/tasks/driver/${driver.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching driver tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      assigned: '#FFC107',
      accepted: '#2196F3',
      enroute: '#00BCD4',
      arrived: '#009688',
      completed: '#4CAF50',
      failed: '#F44336',
    };
    return colors[status] || '#9E9E9E';
  };

  return (
    <div className="driver-detail-panel">
      <button className="close-btn" onClick={onClose}>✕</button>

      <div className="driver-header">
        <h2>{driver.first_name} {driver.last_name}</h2>
        <p className="phone"><a href={`tel:${driver.phone_number}`}>📞 {driver.phone_number}</a></p>
      </div>

      <div className="driver-stats">
        <div className="stat">
          <label>Active Tasks</label>
          <span>{driver.active_tasks || 0}</span>
        </div>
        <div className="stat">
          <label>Speed</label>
          <span>{driver.speed?.toFixed(1) || 0} km/h</span>
        </div>
        <div className="stat">
          <label>Last Update</label>
          <span>{new Date(driver.recorded_at).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="tasks-section">
        <h3>Assigned Tasks ({tasks.length})</h3>
        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length > 0 ? (
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-header">
                  <h4>{task.name}</h4>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="task-address">{task.address}</p>
                <div className="task-meta">
                  <span>Fill: {task.fill_level}%</span>
                  <span>Priority: {task.priority}</span>
                  <span>Assigned: {new Date(task.assigned_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No assigned tasks</p>
        )}
      </div>
    </div>
  );
};

export default DriverDetailPanel;
```

---

## Styling (`frontend/src/components/DriverDetailPanel.css`)

```css
.driver-detail-panel {
  position: fixed;
  right: 20px;
  top: 20px;
  width: 380px;
  max-height: 90vh;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  z-index: 1000;
  animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.driver-detail-panel .close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  z-index: 1;
}

.driver-detail-panel .driver-header {
  background: #2196F3;
  color: white;
  padding: 20px;
  border-radius: 8px 8px 0 0;
}

.driver-detail-panel .driver-header h2 {
  margin: 0 0 10px 0;
  font-size: 20px;
}

.driver-detail-panel .driver-header .phone {
  margin: 0;
  font-size: 14px;
}

.driver-detail-panel .phone a {
  color: white;
  text-decoration: none;
}

.driver-detail-panel .driver-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.driver-detail-panel .stat {
  text-align: center;
}

.driver-detail-panel .stat label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.driver-detail-panel .stat span {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.driver-detail-panel .tasks-section {
  padding: 15px;
}

.driver-detail-panel .tasks-section h3 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #333;
}

.driver-detail-panel .task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.driver-detail-panel .task-item {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #f9f9f9;
}

.driver-detail-panel .task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.driver-detail-panel .task-header h4 {
  margin: 0;
  font-size: 13px;
  color: #333;
}

.driver-detail-panel .status-badge {
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  text-transform: capitalize;
}

.driver-detail-panel .task-address {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
}

.driver-detail-panel .task-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 11px;
  color: #999;
}

.driver-detail-panel .task-meta span {
  display: inline-block;
  padding: 2px 6px;
  background: white;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .driver-detail-panel {
    width: 90%;
    right: 5%;
    max-height: 80vh;
  }
}
```

---

## Integration with Existing Admin Pages

Add to `frontend/src/Pages/SuperAdmin/Dashboard.jsx`:

```jsx
import DriverMapView from './DriverMapView';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('bins');

  return (
    <div className="dashboard">
      <div className="tabs">
        <button onClick={() => setActiveTab('bins')}>Bins</button>
        <button onClick={() => setActiveTab('drivers')}>Driver Map</button>
        <button onClick={() => setActiveTab('analytics')}>Analytics</button>
      </div>

      {activeTab === 'drivers' && <DriverMapView />}
      {/* ... other tabs ... */}
    </div>
  );
}
```

---

## Features

✅ **Real-time Driver Tracking** - Live location updates via Socket.IO  
✅ **Multiple Drivers** - All society drivers visible on map  
✅ **Click to View** - Popup with driver info and contact  
✅ **Active Task Count** - Shows how many tasks each driver has  
✅ **Speed Display** - Current speed of driver  
✅ **Last Update Time** - Timestamp of last location update  
✅ **Task Details Panel** - View all assigned tasks with status  
✅ **Society Filtering** - Admins see only their society drivers  
✅ **Mobile Responsive** - Works on tablet and mobile  

---

## Performance Tips

1. **Limit marker updates** - Only update visible drivers
2. **Cluster markers** - Use MarkerCluster for many drivers
3. **Throttle socket updates** - Update UI max every 2 seconds
4. **Cache task data** - Don't refetch on every panel open
5. **Pagination** - Load driver tasks with pagination
