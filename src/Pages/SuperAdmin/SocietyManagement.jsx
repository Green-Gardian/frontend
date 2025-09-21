"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  Loader2,
} from "lucide-react"
import { getSocieties, addSociety, updateSociety, deleteSociety } from "@/services/society"
import Modal from "@/components/modal"

const SocietyManagement = () => {
  const [societies, setSocieties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSociety, setSelectedSociety] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [newSociety, setNewSociety] = useState({
    societyName: "",
    address: "",
    city: "",
    state: "",
  })

  const fetchSocieties = async () => {
    try {
      const response = await getSocieties()
      setSocieties(response?.societies || [])
    } catch (err) {
      setError("Failed to fetch societies")
      setSocieties([])
    } finally {
      setLoading(false)
    }
  }

  const searchLocation = async (query) => {
    if (!query || query.length < 3) return []

    try {
      setSearchLoading(true)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=pk&limit=5&addressdetails=1`,
      )
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error searching location:", error)
      return []
    } finally {
      setSearchLoading(false)
    }
  }

  const handleLocationSearch = async (searchQuery, isEdit = false) => {
    if (!searchQuery || searchQuery.length < 3) return

    const results = await searchLocation(searchQuery)
    if (results.length > 0) {
      // Show location suggestions
      showLocationSuggestions(results, isEdit)
    }
  }

  const showLocationSuggestions = (locations, isEdit = false) => {
    // Create a simple dropdown for location suggestions
    const searchInput = document.getElementById(isEdit ? "edit-location-search" : "location-search")
    if (!searchInput) return

    // Remove existing suggestions
    const existingSuggestions = document.querySelector(".location-suggestions")
    if (existingSuggestions) {
      existingSuggestions.remove()
    }

    // Create suggestions container
    const suggestionsContainer = document.createElement("div")
    suggestionsContainer.className =
      "location-suggestions absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 z-50 max-h-48 overflow-y-auto shadow-lg"

    if (locations.length === 0) {
      const noResultsItem = document.createElement("div")
      noResultsItem.className = "px-3 py-2 text-gray-500 text-sm text-center"
      noResultsItem.textContent = "No locations found. Try a different search term."
      suggestionsContainer.appendChild(noResultsItem)
    } else {
      locations.forEach((location, index) => {
        const suggestionItem = document.createElement("div")
        suggestionItem.className =
          "px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-900 text-sm border-b border-gray-100 last:border-b-0"
        suggestionItem.textContent = location.display_name

        suggestionItem.onclick = () => {
          selectLocation(location, isEdit)
          suggestionsContainer.remove()
        }

        suggestionsContainer.appendChild(suggestionItem)
      })
    }

    // Position suggestions below search input
    searchInput.parentNode.style.position = "relative"
    searchInput.parentNode.appendChild(suggestionsContainer)
  }

  const selectLocation = (location, isEdit) => {
    const address = location.address
    const city = address.city || ""
    const state = address.state || ""
    setNewSociety((prevState) => ({
      ...prevState,
      address: location.display_name,
      city: city,
      state: state,
    }))
  }

  const handleClickOutside = (event) => {
    const locationSuggestions = document.querySelector(".location-suggestions")
    if (locationSuggestions && !locationSuggestions.contains(event.target)) {
      locationSuggestions.remove()
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const openEditModal = (society) => {
    setSelectedSociety(society)
    setNewSociety({
      societyName: society.society_name,
      address: society.address,
      city: society.city,
      state: society.state,
    })
    setShowEditModal(true)
  }

  const handleAddSociety = async () => {
    try {
      await addSociety(newSociety)
      fetchSocieties()
      setShowAddModal(false)
    } catch (error) {
      console.error("Error adding society:", error)
    }
  }

  const handleSearchInputChange = (event, isEdit) => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      handleLocationSearch(event.target.value, isEdit)
    }, 300)
  }

  const handleSearchKeyDown = (event, isEdit) => {
    if (event.key === "Enter") {
      event.preventDefault()
      handleLocationSearch(event.target.value, isEdit)
    }
  }

  const handleUpdateSociety = async () => {
    try {
      await updateSociety(selectedSociety.id, newSociety)
      fetchSocieties()
      setShowEditModal(false)
    } catch (error) {
      console.error("Error updating society:", error)
    }
  }

  const handleDeleteSociety = async (id) => {
    try {
      await deleteSociety(id)
      fetchSocieties()
      setShowDeleteModal(false)
    } catch (error) {
      console.error("Error deleting society:", error)
    }
  }

  useEffect(() => {
    fetchSocieties()
  }, [])

  // Add search timeout ref
  const searchTimeout = React.useRef(null)

  // Add custom styles for location suggestions
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      .location-suggestions {
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        max-height: 200px;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #d1d5db #f3f4f6;
      }
      
      .location-suggestions::-webkit-scrollbar {
        width: 6px;
      }
      
      .location-suggestions::-webkit-scrollbar-track {
        background: #f3f4f6;
        border-radius: 3px;
      }
      
      .location-suggestions::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }
      
      .location-suggestions::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }
      
      .location-suggestions > div {
        transition: background-color 0.2s ease;
        border-bottom: 1px solid #f3f4f6;
      }
      
      .location-suggestions > div:last-child {
        border-bottom: none;
      }
      
      .location-suggestions > div:hover {
        background-color: #f9fafb !important;
      }
    `
    document.head.appendChild(style)

    document.addEventListener("click", handleClickOutside)

    return () => {
      document.head.removeChild(style)
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  if (loading && (!societies || societies.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64 bg-white min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
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
    )
  }

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#121212]">Society Management</h1>
          <p className="text-gray-600 mt-2">Manage all registered societies</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Society
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#EDEEFC] border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Societies</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#121212]">{(societies || []).length}</div>
            <p className="text-xs text-gray-500">Registered societies</p>
          </CardContent>
        </Card>

        <Card className="bg-[#E6F1FD] border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Active Societies</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{(societies || []).length}</div>
            <p className="text-xs text-gray-500">All societies active</p>
          </CardContent>
        </Card>

        <Card className="bg-[#EDEEFC] border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Recent Additions</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#121212]">
              {
                (societies || []).filter((s) => {
                  const createdDate = new Date(s.created_at)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return createdDate > weekAgo
                }).length
              }
            </div>
            <p className="text-xs text-gray-500">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Societies Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#121212]">Societies</CardTitle>
          <CardDescription className="text-gray-600">{(societies || []).length} total societies</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-700 font-semibold">Society</TableHead>
                <TableHead className="text-gray-700 font-semibold">Location</TableHead>
                <TableHead className="text-gray-700 font-semibold">Created</TableHead>
                <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(societies || []).map((society, index) => (
                <TableRow
                  key={society.id}
                  className={`border-gray-200 ${index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"}`}
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[#121212] font-medium">{society.society_name}</p>
                        <p className="text-gray-500 text-sm">ID: {society.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-[#121212] text-sm">
                          {society.city}, {society.state}
                        </p>
                        <p className="text-gray-500 text-xs">{society.address}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{formatDate(society.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(society)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSociety(society)
                          setShowDeleteModal(true)
                        }}
                        className="text-red-600 border-red-200 hover:bg-red-50"
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
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Society">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAddSociety()
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-gray-700">Society Name</label>
            <Input
              value={newSociety.societyName}
              onChange={(e) => setNewSociety({ ...newSociety, societyName: e.target.value })}
              className="mt-1 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter society name"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Location Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="location-search"
                className="mt-1 pl-10 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Search for location, address, or landmark..."
                onChange={(e) => handleSearchInputChange(e, false)}
                onKeyDown={(e) => handleSearchKeyDown(e, false)}
                disabled={searchLoading}
              />
              {searchLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 text-gray-400 animate-spin" />}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Start typing to search for a location. All address fields will be filled automatically.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Address</label>
            <Input
              value={newSociety.address}
              onChange={(e) => setNewSociety({ ...newSociety, address: e.target.value })}
              className="mt-1 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Full address will be filled automatically"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">City</label>
              <Input
                value={newSociety.city}
                onChange={(e) => setNewSociety({ ...newSociety, city: e.target.value })}
                className="mt-1 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                placeholder="City will be filled automatically"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">State</label>
              <Input
                value={newSociety.state}
                onChange={(e) => setNewSociety({ ...newSociety, state: e.target.value })}
                className="mt-1 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                placeholder="State will be filled automatically"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Society</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Society Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Society">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleUpdateSociety()
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-gray-700">Society Name</label>
            <Input
              value={newSociety.societyName}
              onChange={(e) => setNewSociety({ ...newSociety, societyName: e.target.value })}
              className="mt-1 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter society name"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Location Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="edit-location-search"
                className="mt-1 pl-10 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Search for location, address, or landmark..."
                onChange={(e) => handleSearchInputChange(e, true)}
                onKeyDown={(e) => handleSearchKeyDown(e, true)}
                disabled={searchLoading}
              />
              {searchLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 text-gray-400 animate-spin" />}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Start typing to search for a location. All address fields will be filled automatically.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Address</label>
            <Input
              value={newSociety.address}
              onChange={(e) => setNewSociety({ ...newSociety, address: e.target.value })}
              className="mt-1 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Full address will be filled automatically"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">City</label>
              <Input
                value={newSociety.city}
                onChange={(e) => setNewSociety({ ...newSociety, city: e.target.value })}
                className="mt-1 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                placeholder="City will be filled automatically"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">State</label>
              <Input
                value={newSociety.state}
                onChange={(e) => setNewSociety({ ...newSociety, state: e.target.value })}
                className="mt-1 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                placeholder="State will be filled automatically"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Society</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Society">
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[#121212]">{selectedSociety?.society_name}</span>?
          </p>
          <p className="text-gray-500 text-sm">
            This action cannot be undone. All society data will be permanently removed.
          </p>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteSociety(selectedSociety?.id)}>
              Delete Society
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SocietyManagement
