"use client"

import { useState, useEffect } from "react"

function PendingComplaintsTable() {
  const [pendingComplaints, setPendingComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const formatDateString = (dateValue) => {
    if (!dateValue) return "";
    
    let date;
    
    // Handle Google Sheets serial date numbers (like 45466 for 21/06/2025)
    if (typeof dateValue === 'number' && dateValue > 40000) {
      // Google Sheets date serial number starts from 1900-01-01
      const googleEpoch = new Date(1899, 11, 30); // Dec 30, 1899
      date = new Date(googleEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
    }
    // Handle ISO string format (2025-05-22T07:38:28.052Z)
    else if (typeof dateValue === 'string' && dateValue.includes('T')) {
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
    // Handle DD/MM/YYYY format
    else if (typeof dateValue === 'string' && dateValue.includes('/') && !dateValue.includes(',')) {
      const parts = dateValue.split('/');
      if (parts.length === 3) {
        // Assume DD/MM/YYYY format
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        date = new Date(year, month, day);
      } else {
        date = new Date(dateValue);
      }
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
    const fetchComplaints = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch the entire sheet using Google Sheets API directly
        const sheetUrl = "https://docs.google.com/spreadsheets/d/1Vn295WmY0o6qh03rYzpCISGfMgT5RViXdYyd_ZNQ2p8/gviz/tq?tqx=out:json&sheet=FMS"
        const response = await fetch(sheetUrl)
        const text = await response.text()
        
        // Extract the JSON part from the response
        const jsonStart = text.indexOf('{')
        const jsonEnd = text.lastIndexOf('}') + 1
        const jsonData = text.substring(jsonStart, jsonEnd)
        
        const data = JSON.parse(jsonData)
        
        // Process the complaints data
        if (data && data.table && data.table.rows) {
          const complaintData = []
          
          // Skip the header row and process the data rows
          data.table.rows.slice(2).forEach((row, index) => {
            if (row.c) {
              // Check if column Y (index 24) has data and column Z (index 25) is null/empty
              const hasColumnY = row.c[24] && row.c[24].v !== null && row.c[24].v !== "";
              const isColumnZEmpty = !row.c[25] || row.c[25].v === null || row.c[25].v === "";

              // Only include rows where column Y has data and column Z is null
              if (hasColumnY && isColumnZEmpty) {
                const complaint = {
                  rowIndex: index + 6, // Actual row index in the sheet (1-indexed, +5 for header rows, +1 for 1-indexing)
                  // Columns B to X (indices 1 to 23)
                  complaintNo: row.c[1] ? row.c[1].v : "", // Column B
                  date: row.c[2] ? (row.c[2].f || formatDateString(row.c[2].v) || row.c[2].v) : "", // Column C
                  head: row.c[3] ? row.c[3].v : "", // Column D
                  companyName: row.c[4] ? row.c[4].v : "", // Column E
                  modeOfCall: row.c[5] ? row.c[5].v : "", // Column F
                  idNumber: row.c[6] ? row.c[6].v : "", // Column G
                  projectName: row.c[7] ? row.c[7].v : "", // Column H
                  complaintNumber: row.c[8] ? row.c[8].v : "", // Column I
                  complaintDate: row.c[9] ? (row.c[9].f || formatDateString(row.c[9].v) || row.c[9].v) : "", // Column J
                  beneficiaryName: row.c[10] ? row.c[10].v : "", // Column K
                  contactNumber: row.c[11] ? row.c[11].v : "", // Column L
                  village: row.c[12] ? row.c[12].v : "", // Column M
                  block: row.c[13] ? row.c[13].v : "", // Column N
                  district: row.c[14] ? row.c[14].v : "", // Column O
                  product: row.c[15] ? row.c[15].v : "", // Column P
                  make: row.c[16] ? row.c[16].v : "", // Column Q
                  system: row.c[17] ? row.c[17].v : "", // Column R
                  voltageRating: row.c[18] ? row.c[18].v : "", // Column S
                  qty: row.c[19] ? row.c[19].v : "", // Column T
                  acDc: row.c[20] ? row.c[20].v : "", // Column U
                  priority: row.c[21] ? row.c[21].v : "Medium", // Column V
                  insuranceType: row.c[22] ? row.c[22].v : "", // Column W
                  natureOfComplaint: row.c[23] ? row.c[23].v : "", // Column X
                  status: "Pending",
                  // Store the complete row data for future reference
                  fullRowData: row.c
                }
                
                complaintData.push(complaint)
              }
            }
          })
          
          setPendingComplaints(complaintData)
        }
      } catch (err) {
        console.error("Error fetching complaints data:", err)
        setError(err.message)
        // On error, set to empty array
        setPendingComplaints([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchComplaints()
  }, [])

  // Function to get appropriate color for priority badges
  const getPriorityColor = (priority) => {
    switch(priority) {
      case "Urgent": return "bg-red-500"
      case "High": return "bg-orange-500"
      case "Medium": return "bg-blue-500"
      default: return "bg-green-500"
    }
  }

  // Filter complaints based on search term
  const filteredComplaints = pendingComplaints.filter(
    (complaint) =>
      complaint.beneficiaryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaintNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="text-gray-500">Loading complaints data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="text-red-500">Error loading data: {error}</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold">Pending Complaints</h2>
        
        <div className="relative">
          <input
            type="search"
            placeholder="Search complaints..."
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
          {filteredComplaints.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No pending complaints found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-100">
    <tr>
      {/* <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Complaint No.
        </th> */}
        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
          Complaint Number
        </th>
        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
          Complaint Date
        </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Date
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Head
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Company Name
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Mode Of Call
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        ID Number
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Project Name
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Beneficiary Name
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Contact Number
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Village
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Block
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        District
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Product
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Make
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        System
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Voltage Rating
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Qty
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        AC/DC
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Priority
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Insurance Type
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Nature Of Complaint
      </th>
      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
        Status
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {filteredComplaints.map((complaint, index) => (
      <tr key={`complaint-${complaint.complaintNo}-${index}`} className="hover:bg-gray-50">
        {/* <td className="px-3 py-4 whitespace-nowrap font-medium text-sm">{complaint.complaintNo}</td> */}
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.complaintNumber}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.complaintDate}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.date}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.head}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.companyName}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.modeOfCall}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.idNumber}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.projectName}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.beneficiaryName}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.contactNumber}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.village}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.block}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.district}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.product}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.make}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.system}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.voltageRating}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.qty}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.acDc}</td>
        <td className="px-3 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getPriorityColor(complaint.priority)}`}>
            {complaint.priority}
          </span>
        </td>
        <td className="px-3 py-4 whitespace-nowrap text-sm">{complaint.insuranceType}</td>
        <td className="px-3 py-4 whitespace-nowrap text-sm max-w-xs truncate" title={complaint.natureOfComplaint}>
          {complaint.natureOfComplaint}
        </td>
        <td className="px-3 py-4 whitespace-nowrap">
          <span className="px-2 py-1 text-xs font-semibold rounded-full border border-gray-400 text-gray-600">
            {complaint.status}
          </span>
        </td>
      </tr>
    ))}
  </tbody>
</table>
          )}
        </div>
      </div>

      {filteredComplaints.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredComplaints.length} pending complaint{filteredComplaints.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

export default PendingComplaintsTable