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

const AddBinForm = ({ onBinAdded }) => {
  const [selectedCity, setSelectedCity] = useState('rawalpindi');
  const [societies, setSocieties] = useState([]);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    society: '',
    latitude: CITIES.rawalpindi.lat,
    longitude: CITIES.rawalpindi.lng,
    status: 'idle',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch societies on component mount
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const token = Cookies.get('access_token');
        const apiBase = 'http://localhost:3001';

        const response = await axios.get(
          `${apiBase}/society/get-societies`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.societies && Array.isArray(response.data.societies)) {
          setSocieties(response.data.societies);
          // Set first society as default
          if (response.data.societies.length > 0) {
            setFormData((prev) => ({
              ...prev,
              society: response.data.societies[0].society_name,
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching societies:', err);
        setError('Failed to load societies');
      } finally {
        setLoadingSocieties(false);
      }
    };

    fetchSocieties();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) : value,
    }));
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    const cityData = CITIES[city];
    setFormData((prev) => ({
      ...prev,
      latitude: cityData.lat,
      longitude: cityData.lng,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = Cookies.get('access_token');
      const apiBase =  'http://localhost:3001';

      const response = await axios.post(
        `${apiBase}/bins`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(`Bin "${formData.name}" created successfully!`);
        setFormData({
          name: '',
          address: '',
          society: societies.length > 0 ? societies[0].society_name : '',
          latitude: 24.8607,
          longitude: 67.0011,
          status: 'idle',
        });
        if (onBinAdded) onBinAdded(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create bin');
      console.error('Error creating bin:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
      <h3 className="text-lg font-semibold mb-4">Add New Bin</h3>

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

        <div>
          <Label htmlFor="society">Society</Label>
          <select
            id="society"
            name="society"
            value={formData.society}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loadingSocieties}
            required
          >
            <option value="">
              {loadingSocieties ? 'Loading societies...' : 'Select a Society'}
            </option>
            {societies.map((soc) => (
              <option key={soc.id} value={soc.society_name}>
                {soc.society_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="city">City</Label>
          <select
            id="city"
            value={selectedCity}
            onChange={handleCityChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rawalpindi">Rawalpindi</option>
            <option value="islamabad">Islamabad</option>
            <option value="lahore">Lahore</option>
            <option value="karachi">Karachi</option>
            <option value="multan">Multan</option>
            <option value="faisalabad">Faisalabad</option>
            <option value="peshawar">Peshawar</option>
            <option value="quetta">Quetta</option>
            <option value="hyderabad">Hyderabad</option>
            <option value="gujranwala">Gujranwala</option>
          </select>
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

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating...' : 'Add Bin'}
        </Button>
      </form>
    </div>
  );
};

export default AddBinForm;
