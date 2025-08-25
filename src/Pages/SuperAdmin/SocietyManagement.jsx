import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Search,
  Loader2
} from "lucide-react";
import { getSocieties, addSociety, updateSociety, deleteSociety } from "@/services/society";
import Modal from "@/components/modal";

const SocietyManagement = () => {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [newSociety, setNewSociety] = useState({
    societyName: '',
    address: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    fetchSocieties();
  }, []);

  const searchLocation = async (query) => {
    if (!query || query.length < 3) return [];
    
    try {
      setSearchLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=pk&limit=5&addressdetails=1`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching location:', error);
      return [];
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLocationSearch = async (searchQuery, isEdit = false) => {
    if (!searchQuery || searchQuery.length < 3) return;
    
    const results = await searchLocation(searchQuery);
    if (results.length > 0) {
      // Show location suggestions
      showLocationSuggestions(results, isEdit);
    }
  };

  const showLocationSuggestions = (locations, isEdit = false) => {
    // Create a simple dropdown for location suggestions
    const searchInput = document.getElementById(isEdit ? 'edit-location-search' : 'location-search');
    if (!searchInput) return;

    // Remove existing suggestions
    const existingSuggestions = document.querySelector('.location-suggestions');
    if (existingSuggestions) {
      existingSuggestions.remove();
    }

    // Create suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'location-suggestions absolute top-full left-0 right-0 bg-zinc-800 border border-zinc-700 rounded-md mt-1 z-50 max-h-48 overflow-y-auto';
    
    if (locations.length === 0) {
      const noResultsItem = document.createElement('div');
      noResultsItem.className = 'px-3 py-2 text-zinc-400 text-sm text-center';
      noResultsItem.textContent = 'No locations found. Try a different search term.';
      suggestionsContainer.appendChild(noResultsItem);
    } else {
      locations.forEach((location, index) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'px-3 py-2 hover:bg-zinc-700 cursor-pointer text-white text-sm border-b border-zinc-700 last:border-b-0';
        suggestionItem.textContent = location.display_name;
        
        suggestionItem.onclick = () => {
          selectLocation(location, isEdit);
          suggestionsContainer.remove();
        };
        
        suggestionsContainer.appendChild(suggestionItem);
      });
    }

    // Position suggestions below search input
    searchInput.parentNode.style.position = 'relative';
    searchInput.parentNode.appendChild(suggestionsContainer);
  };

  const selectLocation = (location, isEdit = false) => {
    // Extract address components from Nominatim response
    const address = location.address;
    
    let city = '';
    let state = '';
    let fullAddress = location.display_name;

    // Extract city and state from address components
    if (address) {
      city = address.city || address.town || address.village || address.county || '';
      state = address.state || address.province || '';
      
      // Build a cleaner full address
      const addressParts = [];
      if (address.house_number) addressParts.push(address.house_number);
      if (address.road) addressParts.push(address.road);
      if (address.suburb) addressParts.push(address.suburb);
      if (city) addressParts.push(city);
      if (state) addressParts.push(state);
      if (address.postcode) addressParts.push(address.postcode);
      
      if (addressParts.length > 0) {
        fullAddress = addressParts.join(', ');
      }
    }

    // Update form fields
    setNewSociety({
      ...newSociety,
      address: fullAddress,
      city: city,
      state: state
    });

    // Clear the search input
    const searchInput = document.getElementById(isEdit ? 'edit-location-search' : 'location-search');
    if (searchInput) {
      searchInput.value = '';
    }
  };

  const handleSearchInputChange = (e, isEdit = false) => {
    const query = e.target.value;
    
    // Clear suggestions if input is too short
    if (query.length < 3) {
      const existingSuggestions = document.querySelector('.location-suggestions');
      if (existingSuggestions) {
        existingSuggestions.remove();
      }
      return;
    }

    // Debounce the search
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      handleLocationSearch(query, isEdit);
    }, 300);
  };

  const handleSearchKeyDown = (e, isEdit = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = e.target.value;
      if (query.length >= 3) {
        handleLocationSearch(query, isEdit);
      }
    }
  };

  // Add search timeout ref
  const searchTimeout = React.useRef(null);

  // Add custom styles for location suggestions
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .location-suggestions {
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        max-height: 200px;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #52525b #27272a;
      }
      
      .location-suggestions::-webkit-scrollbar {
        width: 6px;
      }
      
      .location-suggestions::-webkit-scrollbar-track {
        background: #27272a;
        border-radius: 3px;
      }
      
      .location-suggestions::-webkit-scrollbar-thumb {
        background: #52525b;
        border-radius: 3px;
      }
      
      .location-suggestions::-webkit-scrollbar-thumb:hover {
        background: #71717a;
      }
      
      .location-suggestions > div {
        transition: background-color 0.2s ease;
        border-bottom: 1px solid #3f3f46;
      }
      
      .location-suggestions > div:last-child {
        border-bottom: none;
      }
      
      .location-suggestions > div:hover {
        background-color: #3f3f46 !important;
      }
    `;
    document.head.appendChild(style);

    // Add click outside handler to close suggestions
    const handleClickOutside = (event) => {
      const suggestions = document.querySelector('.location-suggestions');
      const searchInputs = document.querySelectorAll('#location-search, #edit-location-search');
      
      if (suggestions && !suggestions.contains(event.target)) {
        let isSearchInput = false;
        searchInputs.forEach(input => {
          if (input.contains(event.target)) {
            isSearchInput = true;
          }
        });
        
        if (!isSearchInput) {
          suggestions.remove();
        }
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.head.removeChild(style);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const fetchSocieties = async () => {
    try {
      setLoading(true);
      const response = await getSocieties();
      
      if (response.error) {
        setError(response.error);
      } else {
        setSocieties(response.societies);
      }
    } catch (err) {
      setError("Failed to fetch societies");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSociety = async () => {
    try {
      const response = await addSociety(newSociety);
      
      if (response.error) {
        alert(response.error);
      } else {
        setShowAddModal(false);
        setNewSociety({
          societyName: '',
          address: '',
          city: '',
          state: ''
        });
        fetchSocieties();
      }
    } catch (err) {
      alert("Failed to add society");
    }
  };

  const handleUpdateSociety = async () => {
    try {
      const response = await updateSociety(selectedSociety.id, newSociety);
      
      if (response.error) {
        alert(response.error);
      } else {
        setShowEditModal(false);
        setSelectedSociety(null);
        setNewSociety({
          societyName: '',
          address: '',
          city: '',
          state: ''
        });
        fetchSocieties();
      }
    } catch (err) {
      alert("Failed to update society");
    }
  };

  const handleDeleteSociety = async (societyId) => {
    try {
      const response = await deleteSociety(societyId);
      
      if (response.error) {
        alert(response.error);
      } else {
        setShowDeleteModal(false);
        setSelectedSociety(null);
        fetchSocieties();
      }
    } catch (err) {
      alert("Failed to delete society");
    }
  };

  const openEditModal = (society) => {
    setSelectedSociety(society);
    setNewSociety({
      societyName: society.society_name,
      address: society.address,
      city: society.city,
      state: society.state
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && societies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchSocieties} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Society Management</h1>
          <p className="text-zinc-400 mt-2">Manage all registered societies</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Society
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Total Societies
            </CardTitle>
            <Building2 className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {societies.length}
            </div>
            <p className="text-xs text-zinc-400">
              Registered societies
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Active Societies
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {societies.length}
            </div>
            <p className="text-xs text-zinc-400">
              All societies active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Recent Additions
            </CardTitle>
            <Calendar className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {societies.filter(s => {
                const createdDate = new Date(s.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return createdDate > weekAgo;
              }).length}
            </div>
            <p className="text-xs text-zinc-400">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Societies Table */}
      <Card className="bg-[#1a1a1a] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Societies</CardTitle>
          <CardDescription className="text-zinc-400">
            {societies.length} total societies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-300">Society</TableHead>
                <TableHead className="text-zinc-300">Location</TableHead>
                <TableHead className="text-zinc-300">Created</TableHead>
                <TableHead className="text-zinc-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {societies.map((society) => (
                <TableRow key={society.id} className="border-zinc-800">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {society.society_name}
                        </p>
                        <p className="text-zinc-400 text-sm">ID: {society.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-zinc-400" />
                      <div>
                        <p className="text-white text-sm">
                          {society.city}, {society.state}
                        </p>
                        <p className="text-zinc-400 text-xs">
                          {society.address}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {formatDate(society.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(society)}
                        className="text-blue-500"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSociety(society);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Society Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Society"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddSociety();
        }} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300">Society Name</label>
            <Input
              value={newSociety.societyName}
              onChange={(e) => setNewSociety({ ...newSociety, societyName: e.target.value })}
              className="mt-1 bg-zinc-900 border-zinc-700 text-white"
              placeholder="Enter society name"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-zinc-300">Location Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                id="location-search"
                className="mt-1 pl-10 bg-zinc-900 border-zinc-700 text-white"
                placeholder="Search for location, address, or landmark..."
                onChange={(e) => handleSearchInputChange(e, false)}
                onKeyDown={(e) => handleSearchKeyDown(e, false)}
                disabled={searchLoading}
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 text-zinc-400 animate-spin" />
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Start typing to search for a location. All address fields will be filled automatically.
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-zinc-300">Address</label>
            <Input
              value={newSociety.address}
              onChange={(e) => setNewSociety({ ...newSociety, address: e.target.value })}
              className="mt-1 bg-zinc-900 border-zinc-700 text-white"
              placeholder="Full address will be filled automatically"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-300">City</label>
              <Input
                value={newSociety.city}
                onChange={(e) => setNewSociety({ ...newSociety, city: e.target.value })}
                className="mt-1 bg-zinc-900 border-zinc-700 text-white"
                placeholder="City will be filled automatically"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300">State</label>
              <Input
                value={newSociety.state}
                onChange={(e) => setNewSociety({ ...newSociety, state: e.target.value })}
                className="mt-1 bg-zinc-900 border-zinc-700 text-white"
                placeholder="State will be filled automatically"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Society
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Society Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Society"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleUpdateSociety();
        }} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300">Society Name</label>
            <Input
              value={newSociety.societyName}
              onChange={(e) => setNewSociety({ ...newSociety, societyName: e.target.value })}
              className="mt-1 bg-zinc-900 border-zinc-700 text-white"
              placeholder="Enter society name"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-zinc-300">Location Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                id="edit-location-search"
                className="mt-1 pl-10 bg-zinc-900 border-zinc-700 text-white"
                placeholder="Search for location, address, or landmark..."
                onChange={(e) => handleSearchInputChange(e, true)}
                onKeyDown={(e) => handleSearchKeyDown(e, true)}
                disabled={searchLoading}
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 text-zinc-400 animate-spin" />
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Start typing to search for a location. All address fields will be filled automatically.
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-zinc-300">Address</label>
            <Input
              value={newSociety.address}
              onChange={(e) => setNewSociety({ ...newSociety, address: e.target.value })}
              className="mt-1 bg-zinc-900 border-zinc-700 text-white"
              placeholder="Full address will be filled automatically"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-300">City</label>
              <Input
                value={newSociety.city}
                onChange={(e) => setNewSociety({ ...newSociety, city: e.target.value })}
                className="mt-1 bg-zinc-900 border-zinc-700 text-white"
                placeholder="City will be filled automatically"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300">State</label>
              <Input
                value={newSociety.state}
                onChange={(e) => setNewSociety({ ...newSociety, state: e.target.value })}
                className="mt-1 bg-zinc-900 border-zinc-700 text-white"
                placeholder="State will be filled automatically"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Society
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Society"
      >
        <div className="space-y-4">
          <p className="text-zinc-300">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">
              {selectedSociety?.society_name}
            </span>?
          </p>
          <p className="text-zinc-400 text-sm">
            This action cannot be undone. All society data will be permanently removed.
          </p>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDeleteSociety(selectedSociety?.id)}
            >
              Delete Society
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SocietyManagement;
