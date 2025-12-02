import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  });
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
      const apiBase = 'http://localhost:3001';

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
