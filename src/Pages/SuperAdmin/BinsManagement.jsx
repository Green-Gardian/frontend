import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "../Dashboard/dashboard.css"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, LocateFixed, Trash2, Edit2, OctagonX, Wifi, WifiOff } from "lucide-react"
import Cookies from "js-cookie"
import BinManagementModal from "@/components/BinManagementModal"
import EditBinModal from "@/components/EditBinModal"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { apiFetch } from "@/utils/apiClient"
import { io } from "socket.io-client"

const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })
}

// Create custom bin icon based on fill level
const createBinIcon = (fillLevel) => {
  let color;
  if (fillLevel >= 80) color = '#ef4444'; // red
  else if (fillLevel >= 60) color = '#f97316'; // orange
  else if (fillLevel >= 40) color = '#eab308'; // yellow
  else color = '#22c55e'; // green

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 9v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9M9 5a3 3 0 0 1 6 0M3 9h18"/>
      <rect x="7" y="13" width="10" height="6" fill="${color}" opacity="0.3"/>
    </svg>
  `

  return L.divIcon({
    html: svgString,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
    className: 'bin-icon',
  })
}

const LocateControl = () => {
  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: "60px" }}>
      <div className="leaflet-control leaflet-bar">
        <Button variant="outline" size="icon" className="h-10 w-10 bg-white hover:bg-gray-100">
          <LocateFixed className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

export const BinsManagement = () => {
  const [username, setUsername] = useState("")
  const [dustbins, setDustbins] = useState([])
  const [selectedBinForEdit, setSelectedBinForEdit] = useState(null)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())
  const [iotPolling, setIotPolling] = useState(false)
  const mapRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    setUsername(Cookies.get("username"))
    fixLeafletIcons()
  }, [])

  useEffect(() => {
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin"
    }
  }, [])

  useEffect(() => {
    const token = Cookies.get('access_token')
    const apiBase = 'http://localhost:3001'

    // fetch initial bins
    apiFetch(`${apiBase}/bins`, { method: 'GET' })
      .then((res) => res.json())
      .then((resData) => {
        if (resData && resData.data) {
          const mapped = resData.data.map((b) => ({
            id: b.id,
            address: b.address || b.name || 'Unknown',
            location: [parseFloat(b.latitude) || 24.8607, parseFloat(b.longitude) || 67.0011],
            fillLevel: Number(b.fill_level) || 0,
            status: b.status || 'idle',
            lastEmptied: b.updated_at ? new Date(b.updated_at).toLocaleString() : '-',
            hasIoT: !!b.thingspeak_channel_id,
            iotLastUpdate: b.iot_last_update,
            raw: b,
          }))
          setDustbins(mapped)
        }
      })
      .catch((err) => console.error('Failed to fetch bins', err))

    // connect socket
    try {
      socketRef.current = io(apiBase, {
        auth: { token },
      })

      socketRef.current.on('connect', () => {
        console.log('Socket connected', socketRef.current.id)
      })

      socketRef.current.on('bins:update', (updates) => {
        setDustbins((prev) => {
          const byId = new Map(prev.map((p) => [p.id, p]))
          updates.forEach((u) => {
            const mapped = {
              id: u.id,
              address: u.address || u.name || 'Unknown',
              location: [parseFloat(u.latitude) || 24.8607, parseFloat(u.longitude) || 67.0011],
              fillLevel: Number(u.fill_level) || 0,
              status: u.status || 'idle',
              lastEmptied: u.updated_at ? new Date(u.updated_at).toLocaleString() : '-',
              hasIoT: !!u.thingspeak_channel_id,
              iotLastUpdate: u.iot_last_update,
              raw: u,
            }
            byId.set(mapped.id, mapped)
          })
          return Array.from(byId.values())
        })
      })

      socketRef.current.on('bins:created', (b) => {
        setDustbins((prev) => [
          ...prev,
          {
            id: b.id,
            address: b.address || b.name || 'Unknown',
            location: [parseFloat(b.latitude) || 24.8607, parseFloat(b.longitude) || 67.0011],
            fillLevel: Number(b.fill_level) || 0,
            status: b.status || 'idle',
            lastEmptied: b.updated_at ? new Date(b.updated_at).toLocaleString() : '-',
            hasIoT: !!b.thingspeak_channel_id,
            iotLastUpdate: b.iot_last_update,
            raw: b,
          },
        ])
      })

      socketRef.current.on('bins:deleted', ({ id }) => {
        setDustbins((prev) => prev.filter((p) => p.id !== Number(id)))
      })

      socketRef.current.on('bins:updated', (u) => {
        setDustbins((prev) => prev.map((p) => (p.id === u.id ? { ...p, fillLevel: Number(u.fill_level) || 0, status: u.status, raw: u } : p)))
      })

    } catch (err) {
      console.error('Socket error', err)
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect()
    }
  }, [])

  const refreshData = () => {
    setLastRefreshed(new Date())
    const apiBase = 'http://localhost:3001'
    apiFetch(`${apiBase}/bins`, { method: 'GET' })
      .then((res) => res.json())
      .then((resData) => {
        if (resData && resData.data) {
          const mapped = resData.data.map((b) => ({
            id: b.id,
            address: b.address || b.name || 'Unknown',
            location: [parseFloat(b.latitude) || 24.8607, parseFloat(b.longitude) || 67.0011],
            fillLevel: Number(b.fill_level) || 0,
            status: b.status || 'idle',
            lastEmptied: b.updated_at ? new Date(b.updated_at).toLocaleString() : '-',
            hasIoT: !!b.thingspeak_channel_id,
            iotLastUpdate: b.iot_last_update,
            raw: b,
          }))
          setDustbins(mapped)
        }
      })
      .catch((err) => console.error('Failed to fetch bins', err))
  }

  // Poll IoT data from ThingSpeak
  const pollIoTData = async () => {
    setIotPolling(true)
    try {
      const apiBase = 'http://localhost:3001'
      await apiFetch(`${apiBase}/bins/iot/poll`, { method: 'POST' })
      // Refresh data after polling
      setTimeout(() => {
        refreshData()
        setIotPolling(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to poll IoT data:', err)
      setIotPolling(false)
    }
  }

  const getFillLevelColor = (level) => {
    if (level >= 80) return "bg-red-500"
    if (level >= 60) return "bg-orange-500"
    if (level >= 40) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStatusBadgeColor = (fillLevel) => {
    if (fillLevel >= 80) return "bg-red-100 text-red-800"
    if (fillLevel >= 60) return "bg-orange-100 text-orange-800"
    if (fillLevel >= 40) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const emptyBin = async (binId) => {
    try {
      const apiBase = 'http://localhost:3001'
      const response = await apiFetch(
        `${apiBase}/bins/${binId}`,
        { method: 'PUT', body: JSON.stringify({ fill_level: 0, status: 'idle' }) }
      )
      const data = await response.json()
      if (data.success) {
        setDustbins((prev) =>
          prev.map((bin) =>
            bin.id === binId ? { ...bin, fillLevel: 0, status: 'idle' } : bin
          )
        )
      }
    } catch (err) {
      console.error('Failed to empty bin:', err)
    }
  }

  const deleteBin = async (binId) => {
    try {
      const apiBase = 'http://localhost:3001'
      const response = await apiFetch(
        `${apiBase}/bins/${binId}`,
        { method: 'DELETE' }
      )
      const data = await response.json()
      if (data.success) {
        setDustbins((prev) => prev.filter((bin) => bin.id !== binId))
      }
    } catch (err) {
      console.error('Failed to delete bin:', err)
    }
  }

  const totalDustbins = dustbins.length
  const criticalDustbins = dustbins.filter((bin) => bin.fillLevel >= 80).length
  const warningDustbins = dustbins.filter((bin) => bin.fillLevel >= 60 && bin.fillLevel < 80).length
  const averageFillLevel = dustbins.length ? Math.round(dustbins.reduce((sum, bin) => sum + bin.fillLevel, 0) / dustbins.length) : 0

  return (
    <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col w-auto">
      <h1 className="text-[#121212] text-[24px] leading-[32px]">
        Dustbins Management
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Total Dustbins</p>
          <p className="text-2xl font-bold text-blue-900">{totalDustbins}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600">Critical (≥80%)</p>
          <p className="text-2xl font-bold text-red-900">{criticalDustbins}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <p className="text-sm text-gray-600">Warning (60-79%)</p>
          <p className="text-2xl font-bold text-orange-900">{warningDustbins}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Average Fill Level</p>
          <p className="text-2xl font-bold text-green-900">{averageFillLevel}%</p>
        </div>
      </div>

      {/* Map Section */}
      <div className="flex flex-col justify-center w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-2 py-3 gap-3">
          <h2 className="text-lg font-semibold">Dustbin Locations</h2>
          <div className="flex gap-2">
            <BinManagementModal onBinAdded={() => refreshData()} />
            <Button
              variant="outline"
              onClick={pollIoTData}
              disabled={iotPolling}
              className="bg-green-50 hover:bg-green-100 border-green-200"
            >
              <Wifi className={`h-4 w-4 mr-2 ${iotPolling ? 'animate-pulse' : ''}`} />
              {iotPolling ? 'Polling...' : 'IoT Poll'}
            </Button>
            <Button variant="outline" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow-sm overflow-hidden" style={{ height: "500px" }}>
          {typeof window !== "undefined" && (
            <MapContainer
              center={[33.5651, 74.3350]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {dustbins.map((bin) => (
                <Marker key={bin.id} position={bin.location} icon={createBinIcon(bin.fillLevel)}>
                  <Popup>
                    <div className="p-3 min-w-[250px]">
                      <h3 className="font-bold">Dustbin #{bin.id}</h3>
                      <p className="text-sm">Address: {bin.address}</p>
                      <div className="mt-2">
                        <p className="text-sm mb-1">Fill Level: {bin.fillLevel.toFixed(2)}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getFillLevelColor(bin.fillLevel)}`}
                            style={{ width: `${bin.fillLevel}%` }}
                          ></div>
                        </div>
                      </div>
                      {/* IoT Sensor Data */}
                      {bin.hasIoT && (
                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                          {bin.raw?.temperature !== null && (
                            <div className="bg-blue-50 p-1 rounded text-center">
                              <span className="block text-blue-600">🌡️ {bin.raw.temperature?.toFixed(1)}°C</span>
                            </div>
                          )}
                          {bin.raw?.humidity !== null && (
                            <div className="bg-cyan-50 p-1 rounded text-center">
                              <span className="block text-cyan-600">💧 {bin.raw.humidity?.toFixed(1)}%</span>
                            </div>
                          )}
                          {bin.raw?.smoke_level !== null && (
                            <div className="bg-gray-50 p-1 rounded text-center">
                              <span className="block text-gray-600">🌫️ {bin.raw.smoke_level}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <Badge className={getStatusBadgeColor(bin.fillLevel)}>{bin.fillLevel.toFixed(2)}%</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedBinForEdit(bin.raw)}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => emptyBin(bin.id)}
                          className="text-xs"
                        >
                          Empty
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs"
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Dustbin</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete dustbin #{bin.id}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex gap-2 justify-end">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteBin(bin.id)} className="bg-red-600 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              <LocateControl />
            </MapContainer>
          )}
        </div>
      </div>

      {/* Dustbins Table */}
      <div className="flex flex-col justify-center w-full">
        <h2 className="text-lg font-semibold mb-3">Dustbin Details</h2>

        <div className="rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-white border-none">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead className="min-w-[180px]">Location</TableHead>
                  <TableHead className="min-w-[80px] hidden sm:table-cell">IoT</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">Society</TableHead>
                  <TableHead className="min-w-[120px] hidden md:table-cell">Fill Level</TableHead>
                  <TableHead className="min-w-[120px] hidden lg:table-cell">Last Updated</TableHead>
                  <TableHead className="min-w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dustbins.map((bin, index) => (
                  <TableRow key={index} className={`${index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"}`}>
                    <TableCell className="font-medium">#{bin.id}</TableCell>
                    <TableCell>{bin.address}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1" title={bin.hasIoT ? (bin.iotLastUpdate ? `Last: ${new Date(bin.iotLastUpdate).toLocaleString()}` : 'Connected') : 'No IoT'}>
                        {bin.hasIoT ? (
                          <Wifi className="h-4 w-4 text-green-500" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{bin.raw?.society || '-'}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[80px]">
                          <div
                            className={`h-2 rounded-full ${getFillLevelColor(bin.fillLevel)}`}
                            style={{ width: `${bin.fillLevel}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{bin.fillLevel.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{bin.lastEmptied}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge className={`${getStatusBadgeColor(bin.fillLevel)} text-xs`}>{bin.fillLevel.toFixed(2)}%</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedBinForEdit(bin.raw)}
                          className="text-xs px-2 py-1 h-auto"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => emptyBin(bin.id)}
                          className="text-xs px-2 py-1 h-auto"
                          title="Empty"
                        >
                          <OctagonX className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs px-2 py-1 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Dustbin</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete dustbin #{bin.id}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex gap-2 justify-end">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteBin(bin.id)} className="bg-red-600 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Edit Bin Modal */}
      {selectedBinForEdit && (
        <EditBinModal
          bin={selectedBinForEdit}
          open={!!selectedBinForEdit}
          onOpenChange={(open) => {
            if (!open) setSelectedBinForEdit(null)
          }}
        />
      )}
    </div>
  )
}

export default BinsManagement
