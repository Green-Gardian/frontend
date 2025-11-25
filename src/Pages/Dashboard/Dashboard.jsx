import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, LocateFixed } from "lucide-react"
import Cookies from "js-cookie"
import InfoCards from "@/components/info-cards"

const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })
}

// Simulated data for dustbins
const dustbins = [
  {
    id: 1,
    location: [24.8607, 67.0011],
    fillLevel: 75,
    lastEmptied: "2024-06-01",
    status: "Normal",
    type: "General Waste",
    address: "Block 2, Gulshan-e-Iqbal",
  },
  {
    id: 2,
    location: [24.865, 67.0099],
    fillLevel: 30,
    lastEmptied: "2024-06-03",
    status: "Normal",
    type: "Recyclable",
    address: "Main University Road",
  },
  {
    id: 3,
    location: [24.855, 67.012],
    fillLevel: 90,
    lastEmptied: "2024-05-28",
    status: "Critical",
    type: "General Waste",
    address: "Block 13-D, Gulshan-e-Iqbal",
  },
  {
    id: 4,
    location: [24.87, 67.02],
    fillLevel: 60,
    lastEmptied: "2024-06-02",
    status: "Normal",
    type: "Recyclable",
    address: "Millennium Mall, Gulistan-e-Johar",
  },
  {
    id: 5,
    location: [24.863, 67.03],
    fillLevel: 85,
    lastEmptied: "2024-05-30",
    status: "Warning",
    type: "General Waste",
    address: "Johar Chowrangi",
  },
  {
    id: 6,
    location: [24.858, 67.018],
    fillLevel: 45,
    lastEmptied: "2024-06-02",
    status: "Normal",
    type: "Organic",
    address: "Safari Park, Gulshan-e-Iqbal",
  },
  {
    id: 7,
    location: [24.852, 67.005],
    fillLevel: 95,
    lastEmptied: "2024-05-27",
    status: "Critical",
    type: "General Waste",
    address: "NIPA Chowrangi",
  },
  {
    id: 8,
    location: [24.867, 67.015],
    fillLevel: 20,
    lastEmptied: "2024-06-04",
    status: "Normal",
    type: "Recyclable",
    address: "Maskan Chowrangi",
  },
]

// Component to center map on user's location
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

const Dashboard = () => {
  const [username, setUsername] = useState("")
  const [lastRefreshed, setLastRefreshed] = useState(new Date())
  const mapRef = useRef(null)

  useEffect(() => {
    setUsername(Cookies.get("username"))
    // Fix Leaflet icons
    fixLeafletIcons()
  }, [])

  useEffect(() => {
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin"
    }
  }, [])

  // Simulate refreshing data
  const refreshData = () => {
    // In a real app, this would fetch new data from an API
    setLastRefreshed(new Date())
  }

  // Get fill level color
  const getFillLevelColor = (level) => {
    if (level >= 80) return "bg-red-500"
    if (level >= 60) return "bg-yellow-500"
    return "bg-green-500"
  }

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    if (status === "Critical") return "bg-[#FBE7E8] text-[#A30D11]"
    if (status === "Warning") return "bg-[#FEF3E2] text-[#B54708]"
    return "bg-[#EBF9F1] text-[#1F9254]"
  }

  // Calculate statistics
  const totalDustbins = dustbins.length
  const criticalDustbins = dustbins.filter((bin) => bin.status === "Critical").length
  const warningDustbins = dustbins.filter((bin) => bin.status === "Warning").length
  const averageFillLevel = Math.round(dustbins.reduce((sum, bin) => sum + bin.fillLevel, 0) / totalDustbins)

  // Cards data
  const cardsData = [
    {
      title: "Total Dustbins",
      number: totalDustbins.toString(),
      percentage: 8.2,
      backgroundColor: "bg-[#EDEEFC]",
    },
    {
      title: "Critical Dustbins",
      number: criticalDustbins.toString(),
      percentage: -15.2,
      backgroundColor: "bg-[#E6F1FD]",
    },
    {
      title: "Warning Dustbins",
      number: warningDustbins.toString(),
      percentage: 5.3,
      backgroundColor: "bg-[#EDEEFC]",
    },
    {
      title: "Average Fill Level",
      number: `${averageFillLevel}%`,
      percentage: 6.8,
      backgroundColor: "bg-[#E6F1FD]",
    },
  ]

  return (
    <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col w-auto">
      <h1 className="text-[#121212] text-[24px] leading-[32px]">
        Hello, <span className="font-semibold">{username}</span>
      </h1>

      {/* Cards Section */}
      <div className="flex flex-wrap md:gap-4 gap-2 justify-center w-full">
        {cardsData.map((card, index) => (
          <InfoCards
            key={index}
            title={card.title}
            number={card.number}
            percentage={card.percentage}
            backgroundColor={card.backgroundColor}
          />
        ))}
      </div>

      {/* Map Section */}
      <div className="flex flex-col justify-center w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-2 py-3 gap-3">
          <h2 className="text-lg font-semibold">Dustbin Locations</h2>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="bg-white border rounded-lg shadow-sm overflow-hidden" style={{ height: "500px" }}>
          {typeof window !== "undefined" && (
            <MapContainer
              center={[24.8607, 67.0011]} // Karachi coordinates
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Dustbin Markers */}
              {dustbins.map((bin) => (
                <Marker key={bin.id} position={bin.location}>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold">Dustbin #{bin.id}</h3>
                      <p className="text-sm">Type: {bin.type}</p>
                      <p className="text-sm">Address: {bin.address}</p>
                      <p className="text-sm">Last Emptied: {bin.lastEmptied}</p>
                      <div className="mt-2">
                        <p className="text-sm mb-1">Fill Level: {bin.fillLevel}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getFillLevelColor(bin.fillLevel)}`}
                            style={{ width: `${bin.fillLevel}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge className={getStatusBadgeColor(bin.status)}>{bin.status}</Badge>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Locate control */}
              <LocateControl />
            </MapContainer>
          )}
        </div>
      </div>

      {/* Dustbins Table */}
      <div className="flex flex-col justify-center w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-2 py-3 gap-3">
          <h2 className="text-lg font-semibold">Dustbin Details</h2>
        </div>

        <div className="rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-white border-none font-montserrat">
                <TableRow>
                  <TableHead className="w-[100px]">Dustbin ID</TableHead>
                  <TableHead className="min-w-[180px]">Location</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">Type</TableHead>
                  <TableHead className="min-w-[120px] hidden md:table-cell">Fill Level</TableHead>
                  <TableHead className="min-w-[120px] hidden lg:table-cell">Last Emptied</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dustbins.map((bin, index) => (
                  <TableRow key={index} className={`${index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"}`}>
                    <TableCell className="font-medium text-center">#{bin.id}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{bin.address}</span>
                        <span className="text-xs text-gray-500 sm:hidden">{bin.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-col">
                        <span>{bin.type}</span>
                        <span className="text-xs text-gray-500 md:hidden">
                          <div className="flex items-center mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2 max-w-[60px]">
                              <div
                                className={`h-1.5 rounded-full ${getFillLevelColor(bin.fillLevel)}`}
                                style={{ width: `${bin.fillLevel}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{bin.fillLevel}%</span>
                          </div>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[80px]">
                          <div
                            className={`h-2 rounded-full ${getFillLevelColor(bin.fillLevel)}`}
                            style={{ width: `${bin.fillLevel}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{bin.fillLevel}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{bin.lastEmptied}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadgeColor(bin.status)} text-xs`}>{bin.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
