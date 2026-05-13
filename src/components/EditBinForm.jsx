import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_BASE_URL } from "@/config/api";

const CITIES = {
  karachi: { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
  rawalpindi: { name: 'Rawalpindi', lat: 33.5651, lng: 74.3350 },
  islamabad: { name: 'Islamabad', lat: 33.7294, lng: 73.1883 },
  lahore: { name: 'Lahore', lat: 31.5204, lng: 74.3587 },
  multan: { name: 'Multan', lat: 30.1575, lng: 71.4454 },
  faisalabad: { name: 'Faisalabad', lat: 31.4181, lng: 72.3757 },
  peshawar: { name: 'Peshawar', lat: 34.0151, lng: 71.5786 },
  quetta: { name: 'Quetta', lat: 30.1798, lng: 66.9750 },
  hyderabad: { name: 'Hyderabad', lat: 25.2768, lng: 68.2241 },
  gujranwala: { name: 'Gujranwala', lat: 32.1814, lng: 74.1855 },
};

const EditBinForm = ({ bin, onBinUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    name: bin.name || '',
    address: bin.address || '',
    latitude: bin.latitude || 0,
    longitude: bin.longitude || 0,
    thingspeak_channel_id: bin.thingspeak_channel_id || '',
    thingspeak_api_key: bin.thingspeak_api_key || '',
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = Cookies.get('access_token');
      const apiBase = API_BASE_URL;

      const response = await axios.put(
        `${apiBase}/bins/${bin.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Bin updated successfully!');
        setTimeout(() => {
          if (onBinUpdated) onBinUpdated(response.data.data);
        }, 500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update bin');
      console.error('Error updating bin:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
      <h3 className="text-lg font-semibold mb-4">Edit Bin #{bin.id}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Bin Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="e.g., Bin Alpha"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            type="text"
            placeholder="e.g., Block A, Street 1"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="0.0001"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="e.g., 33.5651"
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="0.0001"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="e.g., 74.3350"
            />
          </div>
        </div>

        {/* ThingSpeak IoT Configuration */}
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            IoT Configuration
          </h4>

          {/* Current IoT Status */}
          {bin.thingspeak_channel_id && (
            <div className="mb-3 p-2 bg-gray-50 rounded-md text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-gray-600">Channel: {bin.thingspeak_channel_id}</span>
              </div>
              {bin.iot_last_update && (
                <div className="text-gray-500 mt-1">
                  Last IoT Update: {new Date(bin.iot_last_update).toLocaleString()}
                </div>
              )}
              {bin.raw_distance !== null && bin.raw_distance !== undefined && (
                <div className="text-gray-500">
                  Raw Distance: {bin.raw_distance} cm
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <Label htmlFor="thingspeak_channel_id">ThingSpeak Channel ID</Label>
              <Input
                id="thingspeak_channel_id"
                name="thingspeak_channel_id"
                type="text"
                placeholder="e.g., 2812345"
                value={formData.thingspeak_channel_id}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="thingspeak_api_key">ThingSpeak Read API Key</Label>
              <Input
                id="thingspeak_api_key"
                name="thingspeak_api_key"
                type="text"
                placeholder="e.g., ABCDEFGHIJKLMNOP"
                value={formData.thingspeak_api_key}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to use default API key from server</p>
            </div>
          </div>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Updating...' : 'Update Bin'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditBinForm;
