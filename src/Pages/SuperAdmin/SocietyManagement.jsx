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
  CheckCircle
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
  const [newSociety, setNewSociety] = useState({
    societyName: '',
    address: '',
    city: '',
    state: ''
  });

  useEffect(() => {
    fetchSocieties();
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
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300">Society Name</label>
            <Input
              value={newSociety.societyName}
              onChange={(e) => setNewSociety({ ...newSociety, societyName: e.target.value })}
              className="mt-1 bg-zinc-900 border-zinc-700 text-white"
              placeholder="Enter society name"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-zinc-300">Address</label>
            <Input
              value={newSociety.address}
              onChange={(e) => setNewSociety({ ...newSociety, address: e.target.value })}
              className="mt-1 bg-zinc-900 border-zinc-700 text-white"
              placeholder="Enter full address"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-300">City</label>
              <Input
                value={newSociety.city}
                onChange={(e) => setNewSociety({ ...newSociety, city: e.target.value })}
                className="mt-1 bg-zinc-900 border-zinc-700 text-white"
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300">State</label>
              <Input
                value={newSociety.state}
                onChange={(e) => setNewSociety({ ...newSociety, state: e.target.value })}
                className="mt-1 bg-zinc-900 border-zinc-700 text-white"
                placeholder="Enter state"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSociety}>
              Add Society
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Society Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Society"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300">Society Name</label>
            <Input
              value={newSociety.societyName}
              onChange={(e) => setNewSociety({ ...newSociety, societyName: e.target.value })}
              className="mt-1 bg-zinc-900 border-zinc-700 text-white"
              placeholder="Enter society name"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-zinc-300">Address</label>
            <Input
              value={newSociety.address}
              onChange={(e) => setNewSociety({ ...newSociety, address: e.target.value })}
              className="mt-1 bg-zinc-900 border-zinc-700 text-white"
              placeholder="Enter full address"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-300">City</label>
              <Input
                value={newSociety.city}
                onChange={(e) => setNewSociety({ ...newSociety, city: e.target.value })}
                className="mt-1 bg-zinc-900 border-zinc-700 text-white"
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-300">State</label>
              <Input
                value={newSociety.state}
                onChange={(e) => setNewSociety({ ...newSociety, state: e.target.value })}
                className="mt-1 bg-zinc-900 border-zinc-700 text-white"
                placeholder="Enter state"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSociety}>
              Update Society
            </Button>
          </div>
        </div>
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
