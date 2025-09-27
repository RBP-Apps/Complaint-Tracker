"use client"

import { useState, useEffect } from "react"

function TrackerHistoryTable() {
  const [historyData, setHistoryData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [username, setUsername] = useState("")

  useEffect(() => {
    const u = localStorage.getItem("username") || ""
    setUsername(u)
  }, [])

  const techDisplayName = (username || "").toLowerCase().startsWith("tech")
    ? (username || "").substring(4).trim()
    : ""

  // Function to format date string to dd/mm/yyyy
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

  // Function to fetch data from Google Sheets
  useEffect(() => {
    const fetchHistoryData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch the Tracker History sheet using Google Sheets API directly
        const sheetUrl = "https://docs.google.com/spreadsheets/d/1Vn295WmY0o6qh03rYzpCISGfMgT5RViXdYyd_ZNQ2p8/gviz/tq?tqx=out:json&sheet=Tracker%20History"
        const response = await fetch(sheetUrl)
        const text = await response.text()
        
        // Extract the JSON part from the response
        const jsonStart = text.indexOf('{')
        const jsonEnd = text.lastIndexOf('}') + 1
        const jsonData = text.substring(jsonStart, jsonEnd)
        
        const data = JSON.parse(jsonData)
        
                  // Process the history data
        if (data && data.table && data.table.rows) {
          const recordsData = []
          
          // Skip the header row and process the data rows
          data.table.rows.slice(0).forEach((row, index) => {
            if (row.c) {
              // Format timestamp (Column A) - ISO format to dd/mm/yyyy
              let timestampValue = row.c[0] ? row.c[0].v : "";
              timestampValue = formatDateString(timestampValue);
              
              // Format date of complete (Column C) - date format to dd/mm/yyyy
              let dateCompleteValue = row.c[2] ? row.c[2].v : "";
              dateCompleteValue = formatDateString(dateCompleteValue);
              
              const record = {
                rowIndex: index + 2, // Actual row index in the sheet (1-indexed, +1 for header row, +1 for 1-indexing)
                columnA: timestampValue, // Column A (formatted timestamp)
                columnB: row.c[1] ? row.c[1].v : "", // Column B
                columnC: dateCompleteValue, // Column C (formatted date)
                columnD: row.c[3] ? row.c[3].v : "", // Column D
                columnE: row.c[4] ? row.c[4].v : "", // Column E
                columnF: row.c[5] ? row.c[5].v : "", // Column F
                columnG: row.c[6] ? row.c[6].v : "", // Column G
                columnH: row.c[7] ? row.c[7].v : "", // Column H
                columnI: row.c[8] ? row.c[8].v : "", // Column I
                columnJ: row.c[9] ? row.c[9].v : "", // Column J
                columnK: row.c[10] ? row.c[10].v : "", // Column K
                columnL: row.c[11] ? row.c[11].v : "", // Column L
                columnM: row.c[12] ? row.c[12].v : "", // Column M
                columnN: row.c[13] ? row.c[13].v : "", // Column N
                columnO: row.c[14] ? row.c[14].v : "", // Column O
                columnP: row.c[15] ? row.c[15].v : "", // Column P
                columnQ: row.c[16] ? row.c[16].v : "", // Column Q
                columnR: row.c[17] ? row.c[17].v : "", // Column R
                columnS: row.c[18] ? row.c[18].v : "", // Column S
                columnT: row.c[19] ? row.c[19].v : "", // Column T
                columnU: row.c[20] ? row.c[20].v : "", // Column U
                
                // Store which columns contain Drive URLs (for rendering as hyperlinks)
                hasDriveUrl: {
                  columnA: row.c[0] && typeof row.c[0].v === 'string' && row.c[0].v.includes('drive.google.com'),
                  columnB: row.c[1] && typeof row.c[1].v === 'string' && row.c[1].v.includes('drive.google.com'),
                  columnC: row.c[2] && typeof row.c[2].v === 'string' && row.c[2].v.includes('drive.google.com'),
                  columnD: row.c[3] && typeof row.c[3].v === 'string' && row.c[3].v.includes('drive.google.com'),
                  columnE: row.c[4] && typeof row.c[4].v === 'string' && row.c[4].v.includes('drive.google.com'),
                  columnF: row.c[5] && typeof row.c[5].v === 'string' && row.c[5].v.includes('drive.google.com'),
                  columnG: row.c[6] && typeof row.c[6].v === 'string' && row.c[6].v.includes('drive.google.com'),
                  columnH: row.c[7] && typeof row.c[7].v === 'string' && row.c[7].v.includes('drive.google.com'),
                  columnI: row.c[8] && typeof row.c[8].v === 'string' && row.c[8].v.includes('drive.google.com'),
                  columnJ: row.c[9] && typeof row.c[9].v === 'string' && row.c[9].v.includes('drive.google.com'),
                  columnK: row.c[10] && typeof row.c[10].v === 'string' && row.c[10].v.includes('drive.google.com'),
                  columnL: row.c[11] && typeof row.c[11].v === 'string' && row.c[11].v.includes('drive.google.com'),
                  columnM: row.c[12] && typeof row.c[12].v === 'string' && row.c[12].v.includes('drive.google.com'),
                  columnN: row.c[13] && typeof row.c[13].v === 'string' && row.c[13].v.includes('drive.google.com'),
                  columnO: row.c[14] && typeof row.c[14].v === 'string' && row.c[14].v.includes('drive.google.com'),
                  columnP: row.c[15] && typeof row.c[15].v === 'string' && row.c[15].v.includes('drive.google.com'),
                  columnQ: row.c[16] && typeof row.c[16].v === 'string' && row.c[16].v.includes('drive.google.com'),
                  columnR: row.c[17] && typeof row.c[17].v === 'string' && row.c[17].v.includes('drive.google.com'),
                  columnS: row.c[18] && typeof row.c[18].v === 'string' && row.c[18].v.includes('drive.google.com'),
                  columnT: row.c[19] && typeof row.c[19].v === 'string' && row.c[19].v.includes('drive.google.com'),
                  columnU: row.c[20] && typeof row.c[20].v === 'string' && row.c[20].v.includes('drive.google.com'),
                }
              }
              
              recordsData.push(record)
            }
          })
          
          setHistoryData(recordsData)
        }
      } catch (err) {
        console.error("Error fetching history data:", err)
        setError(err.message)
        // On error, set to empty array
        setHistoryData([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchHistoryData()
  }, [])

  // Filter data based on Tech user and search term
  const filteredData = historyData.filter(
    (record) => {
      const matchesSearch = !searchTerm || (
        record.columnA?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.columnB?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.columnC?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
      const matchesTechUser = !techDisplayName || (
        (record.columnU || "").toString().toLowerCase().includes(techDisplayName.toLowerCase())
      )
      return matchesSearch && matchesTechUser
    }
  )

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
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Timestamp</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Complaint Id</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Date Of Complete</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Tracker Status</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Remarks</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Upload Documents</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Geotag Photo</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Beneficiary Name</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Contact Number</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Village</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Block</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">District</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Product</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Make</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">System Voltage</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Rating</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Qty</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">AC/DC</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Priority</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Insurance Type</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Nature Of Complaint</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Technician Name</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnA ? (
                        <a href={record.columnA} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnA}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnB ? (
                        <a href={record.columnB} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnB}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnC ? (
                        <a href={record.columnC} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnC}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnD ? (
                        <a href={record.columnD} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnD}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnE ? (
                        <a href={record.columnE} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnE}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnF ? (
                        <a href={record.columnF} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnF}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnG ? (
                        <a href={record.columnG} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnG}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnH ? (
                        <a href={record.columnH} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnH}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnI ? (
                        <a href={record.columnI} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnI}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnJ ? (
                        <a href={record.columnJ} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnJ}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnK ? (
                        <a href={record.columnK} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnK}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnL ? (
                        <a href={record.columnL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnL}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnM ? (
                        <a href={record.columnM} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnM}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnN ? (
                        <a href={record.columnN} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnN}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnO ? (
                        <a href={record.columnO} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnO}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnP ? (
                        <a href={record.columnP} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnP}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnQ ? (
                        <a href={record.columnQ} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnQ}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnR ? (
                        <a href={record.columnR} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnR}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnS ? (
                        <a href={record.columnS} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnS}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnT ? (
                        <a href={record.columnT} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnT}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hasDriveUrl.columnU ? (
                        <a href={record.columnU} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Open Drive Folder
                        </a>
                      ) : record.columnU}
                    </td>
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