"use client"

import { useState, useEffect } from "react"

function TrackerHistoryTable() {
  const [historyData, setHistoryData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [username, setUsername] = useState("")
  const [userRole, setUserRole] = useState(null)

 useEffect(() => {
  const u = localStorage.getItem("username") || ""
  const loggedInRole = localStorage.getItem('userRole')
  
  console.log('TrackerHistoryTable - Retrieved from localStorage:', { username: u, userRole: loggedInRole })
  
  setUsername(u)
  
  if (loggedInRole) {
    setUserRole(loggedInRole)
  }
}, [])

  const techDisplayName = (username || "").toLowerCase().startsWith("tech")
    ? (username || "").substring(4).trim()
    : ""

  // Function to format date string to dd/mm/yyyy
  const formatDateString = (dateValue) => {
    if (!dateValue) return "";

    let date;

    // Handle ISO string format (2025-05-22T07:38:28.052Z)
    if (typeof dateValue === 'string' && dateValue.includes('T')) {
      date = new Date(dateValue);
    }
    // Handle date format (2025-05-21)
    else if (typeof dateValue === 'string' && dateValue.includes('-')) {
      date = new Date(dateValue);
    }
    // Handle Google Sheets format like "5/22/2025, 2:32:51 PM"
    else if (typeof dateValue === 'string' && dateValue.includes('/') && dateValue.includes(',')) {
      date = new Date(dateValue);
    }
    // Handle Google Sheets Date constructor format like "Date(2025,4,21)" or "Date(2025,4,22,14,32,51)"
    else if (typeof dateValue === 'string' && dateValue.startsWith('Date(')) {
      // Extract the date parts from "Date(2025,4,21)" or "Date(2025,4,22,14,32,51)" format
      const match = dateValue.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/);
      if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]); // Month is 0-indexed in this format
        const day = parseInt(match[3]);
        // Optional time components
        const hours = match[4] ? parseInt(match[4]) : 0;
        const minutes = match[5] ? parseInt(match[5]) : 0;
        const seconds = match[6] ? parseInt(match[6]) : 0;
        date = new Date(year, month, day, hours, minutes, seconds);
      } else {
        return dateValue;
      }
    }
    // Handle if it's already a Date object
    else if (typeof dateValue === 'object' && dateValue.getDate) {
      date = dateValue;
    }
    else {
      return dateValue; // Return as is if not a recognizable date format
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateValue; // Return original value if invalid date
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

useEffect(() => {
  const fetchHistoryData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch data from both Tracker sheet and FMS sheet
      const trackerSheetUrl = "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=Tracker"
      const fmsSheetUrl = "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=FMS"

      // Fetch both sheets simultaneously
      const [trackerResponse, fmsResponse] = await Promise.all([
        fetch(trackerSheetUrl),
        fetch(fmsSheetUrl)
      ])

      const trackerText = await trackerResponse.text()
      const fmsText = await fmsResponse.text()

      // Extract JSON from both responses
      const trackerJsonStart = trackerText.indexOf('{')
      const trackerJsonEnd = trackerText.lastIndexOf('}') + 1
      const trackerJsonData = trackerText.substring(trackerJsonStart, trackerJsonEnd)
      const trackerData = JSON.parse(trackerJsonData)

      const fmsJsonStart = fmsText.indexOf('{')
      const fmsJsonEnd = fmsText.lastIndexOf('}') + 1
      const fmsJsonData = fmsText.substring(fmsJsonStart, fmsJsonEnd)
      const fmsData = JSON.parse(fmsJsonData)

      // Create a map of FMS data by Complaint ID for quick lookup
      const fmsMap = new Map()
      if (fmsData && fmsData.table && fmsData.table.rows) {
        // 🔥 FIX: Add proper debugging and row validation for FMS
        console.log('FMS Total rows:', fmsData.table.rows.length)
        console.log('FMS ParsedNumHeaders:', fmsData.parsedNumHeaders)
        
        fmsData.table.rows.forEach((row, index) => {
          if (row.c && row.c[1]?.v) { // Check if complaint ID exists
            console.log(`FMS Processing row ${index}:`, { id: row.c[1]?.v, status: row.c[25]?.v })
            
            const complaintId = row.c[1].v // Column B - Complaint ID
            const status = row.c[25] ? row.c[25].v : "" // Column Z (index 25)
            const attendDate = row.c[26] ? row.c[26].v : "" // Column AA (index 26)
            
            fmsMap.set(complaintId, {
              status: status,
              attendDate: formatDateString(attendDate)
            })
          }
        })
      }

      // Process the tracker data
      if (trackerData && trackerData.table && trackerData.table.rows) {
        const recordsData = []

        // 🔥 FIX: Add proper debugging and header detection for Tracker
        console.log('Tracker Total rows:', trackerData.table.rows.length)
        console.log('Tracker ParsedNumHeaders:', trackerData.parsedNumHeaders)
        console.log('Tracker Row 0 sample:', trackerData.table.rows[0]?.c?.slice(0, 5))
        console.log('Tracker Row 1 sample:', trackerData.table.rows[1]?.c?.slice(0, 5))

        // 🔥 FIX: Use smart header detection instead of blind slice(1)
        trackerData.table.rows.forEach((row, index) => {
          if (row.c && row.c[2]?.v) { // Check if complaint ID exists (Column C)
            console.log(`Tracker Processing row ${index}:`, {
              serial: row.c[1]?.v,
              complaintId: row.c[2]?.v,
              technician: row.c[3]?.v
            })
            
            const complaintId = row.c[2] ? row.c[2].v : "" // Column C - Complaint ID
            
            // Get corresponding FMS data
            const fmsInfo = fmsMap.get(complaintId) || { status: "", attendDate: "" }

            const record = {
              rowIndex: index + 1, // Actual row index in the sheet
              serialNo: row.c[1] ? row.c[1].v : "", // Column B - Serial No
              complaintId: complaintId, // Column C - Complaint Id
              technicianName: row.c[3] ? row.c[3].v : "", // Column D - Technician Name
              technicianNumber: row.c[4] ? row.c[4].v : "", // Column E - Technician Number
              beneficiaryName: row.c[5] ? row.c[5].v : "", // Column F - Beneficiary Name
              contactNumber: row.c[6] ? row.c[6].v : "", // Column G - Contact Number
              village: row.c[7] ? row.c[7].v : "", // Column H - Village
              block: row.c[8] ? row.c[8].v : "", // Column I - Block
              district: row.c[9] ? row.c[9].v : "", // Column J - District
              product: row.c[10] ? row.c[10].v : "", // Column K - Product
              make: row.c[11] ? row.c[11].v : "", // Column L - Make
              systemVoltage: row.c[12] ? row.c[12].v : "", // Column M - System Voltage
              natureOfComplaint: row.c[13] ? row.c[13].v : "", // Column N - Nature Of Complaint
              uploadDocuments: row.c[14] ? row.c[14].v : "", // Column O - Upload Documents
              geotagPhoto: row.c[15] ? row.c[15].v : "", // Column P - Geotag Photo
              remarks: row.c[16] ? row.c[16].v : "", // Column Q - Remarks
              trackerStatus: row.c[17] ? row.c[17].v : "", // Column R - Tracker Status
              address: row.c[20] ? row.c[20].v : "", // Column U - Address
              
              // From FMS sheet
              status: fmsInfo.status, // Column Z from FMS
              attendDate: fmsInfo.attendDate, // Column AA from FMS

              // Store which columns contain Drive URLs (for rendering as hyperlinks)
              hasDriveUrl: {
                uploadDocuments: row.c[14] && typeof row.c[14].v === 'string' && row.c[14].v.includes('drive.google.com'),
                geotagPhoto: row.c[15] && typeof row.c[15].v === 'string' && row.c[15].v.includes('drive.google.com'),
              }
            }

            // Only add if record has valid data (complaint ID exists)
            if (record.complaintId) {
              recordsData.push(record)
            }
          }
        })

        console.log('Final tracker history data:', recordsData)
        setHistoryData(recordsData)
      }
    } catch (err) {
      console.error("Error fetching history data:", err)
      setError(err.message)
      setHistoryData([])
    } finally {
      setIsLoading(false)
    }
  }

  fetchHistoryData()
}, []) // 🔥 Empty dependency array जरूरी है!




  // Role-based filtering function
const getFilteredHistoryByRole = () => {
  console.log('TrackerHistoryTable - Filtering with user:', username, 'role:', userRole)
  
  // If no role is set, show all history
  if (!userRole) {
    console.log('TrackerHistoryTable - No role set, showing all history')
    return historyData;
  }
  
  // If admin, show all history
  if (userRole.toLowerCase() === 'admin') {
    console.log('TrackerHistoryTable - Admin user, showing all history')
    return historyData;
  }
  
  // If user role and has username, filter by technician name
  if (username) {
    console.log('TrackerHistoryTable - User role, filtering by technician name:', username)
    const filtered = historyData.filter((record) => {
      const match = record.technicianName === username;
      return match;
    });
    console.log('TrackerHistoryTable - Filtered history count:', filtered.length)
    return filtered;
  }
  
  // If user role but no username, show empty
  console.log('TrackerHistoryTable - User role but no username, showing empty')
  return [];
}

  const filteredData = getFilteredHistoryByRole().filter((record) => {
  const matchesSearch = !searchTerm || (
    record.serialNo?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.complaintId?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.technicianName?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.beneficiaryName?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  )

  // For history, we want records that have been completed/processed
  const isHistoryRecord = record.trackerStatus && record.trackerStatus.toString().trim() !== ""

  return matchesSearch && isHistoryRecord
})

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4 h-64">
        <div className="text-gray-500">Loading tracker history data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-4 h-64">
        <div className="text-red-500">Error loading data: {error}</div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 justify-between items-start mb-4 md:flex-row md:items-center">
        <h1 className="text-xl font-bold">Tracker History</h1>

        <div className="relative">
          <input
            type="search"
            placeholder="Search history..."
            className="pl-8 w-[200px] md:w-[300px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          {filteredData.length === 0 ? (
            <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No history data found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Serial No</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Complaint Id</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Technician Name</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Technician Number</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Beneficiary Name</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Contact Number</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Village</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Block</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">District</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Product</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Make</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">System Voltage</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Nature Of Complaint</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Upload Documents</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Geotag Photo</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Remarks</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Tracker Status</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Address</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Status</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Attend Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{record.serialNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.complaintId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.technicianName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.technicianNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.beneficiaryName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.contactNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.village}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.block}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.district}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.make}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.systemVoltage}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.natureOfComplaint}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.uploadDocuments ? (
                        <a href={record.uploadDocuments} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          View Document
                        </a>
                      ) : record.uploadDocuments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.geotagPhoto ? (
                        <a href={record.geotagPhoto} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          View Photo
                        </a>
                      ) : record.geotagPhoto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.remarks}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.trackerStatus}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.attendDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrackerHistoryTable
