"use client"

import { useState, useEffect } from "react"

function AssignmentHistoryTable() {
  const [assignmentHistory, setAssignmentHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

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
    // Handle Google Sheets Date constructor format like "Date(2025,4,21)"
    else if (typeof dateValue === 'string' && dateValue.startsWith('Date(')) {
      // Extract the date parts from "Date(2025,4,21)" format
      const match = dateValue.match(/Date\((\d+),(\d+),(\d+)\)/);
      if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]); // Month is 0-indexed in this format
        const day = parseInt(match[3]);
        date = new Date(year, month, day);
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
    const fetchAssignmentHistory = async () => {
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
        
        // Process the assignments data
        if (data && data.table && data.table.rows) {
          const historyData = []
          
          // Skip the header row and process the data rows
          data.table.rows.slice(0).forEach((row, index) => {
            if (row.c) {
              // Check if column Y (index 25) has data and column Z (index 26) is null/empty
              const hasColumnY = row.c[25] && row.c[25].v !== null && row.c[25].v !== "";
              const isColumnZEmpty = row.c[26] && row.c[26].v !== null && row.c[26].v !== "";
              
              // Only include rows where column Y has data and column Z is null
              if (hasColumnY && isColumnZEmpty) {
                const assignment = {
                  rowIndex: index + 6, // Actual row index in the sheet (1-indexed, +5 for header rows, +1 for 1-indexing)
                  
                  // All columns from B to AI (excluding Planned and Actual)
                  complaintNo: row.c[1] ? row.c[1].v : "", // Column B - Complaint No.
                  date: row.c[2] ? formatDateString(row.c[2].v) : "", // Column C - Date
                  head: row.c[3] ? row.c[3].v : "", // Column D - Head
                  companyName: row.c[4] ? row.c[4].v : "", // Column E - Company Name
                  modeOfCall: row.c[5] ? row.c[5].v : "", // Column F - Mode Of Call
                  idNumber: row.c[6] ? row.c[6].v : "", // Column G - ID Number
                  projectName: row.c[7] ? row.c[7].v : "", // Column H - Project Name
                  complaintNumber: row.c[8] ? row.c[8].v : "", // Column I - Complaint Number
                  complaintDate: row.c[9] ? formatDateString(row.c[9].v) : "", // Column J - Complaint Date
                  beneficiaryName: row.c[10] ? row.c[10].v : "", // Column K - Beneficiary Name
                  contactNumber: row.c[11] ? row.c[11].v : "", // Column L - Contact Number
                  village: row.c[12] ? row.c[12].v : "", // Column M - Village
                  block: row.c[13] ? row.c[13].v : "", // Column N - Block
                  district: row.c[14] ? row.c[14].v : "", // Column O - District
                  product: row.c[15] ? row.c[15].v : "", // Column P - Product
                  make: row.c[16] ? row.c[16].v : "", // Column Q - Make
                  systemVoltage: row.c[17] ? row.c[17].v : "", // Column R - System Voltage
                  rating: row.c[18] ? row.c[18].v : "", // Column S - Rating
                  qty: row.c[19] ? row.c[19].v : "", // Column T - Qty
                  acDc: row.c[20] ? row.c[20].v : "", // Column U - AC/DC
                  priority: row.c[21] ? row.c[21].v : "", // Column V - Priority
                  insuranceType: row.c[22] ? row.c[22].v : "", // Column W - Insurance Type
                  natureOfComplaint: row.c[23] ? row.c[23].v : "", // Column X - Nature Of Complaint
                  // Skip Y (Planned) and Z (Actual) columns as requested
                  delay: row.c[26] ? row.c[26].v : "", // Column AA - Delay
                  technicianName: row.c[27] ? row.c[27].v : "", // Column AB - Technician Name
                  technicianContact: row.c[28] ? row.c[28].v : "", // Column AC - Technician Contact
                  assigneeName: row.c[29] ? row.c[29].v : "", // Column AD - Assignee Name
                  assigneeWhatsApp: row.c[30] ? row.c[30].v : "", // Column AE - Assignee WhatsApp Number
                  location: row.c[31] ? row.c[31].v : "", // Column AF - Location
                  complaintDetails: row.c[32] ? row.c[32].v : "", // Column AG - Complaint Details
                  expectedCompletionDate: row.c[33] ? formatDateString(row.c[33].v) : "", // Column AH - Expected Completion Date
                  notesForTechnician: row.c[34] ? row.c[34].v : "", // Column AI - Notes for Technician
                }
                
                historyData.push(assignment)
              }
            }
          })
          
          setAssignmentHistory(historyData)
        }
      } catch (err) {
        console.error("Error fetching assignment history data:", err)
        setError(err.message)
        // On error, set to empty array
        setAssignmentHistory([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAssignmentHistory()
  }, [])

  // Function to get appropriate color for priority badges
  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case "urgent": return "bg-red-500"
      case "high": return "bg-orange-500"
      case "medium": return "bg-blue-500"
      case "low": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  // Filter assignments based on search term
  const filteredAssignments = assignmentHistory.filter(
    (assignment) =>
      assignment.beneficiaryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.complaintNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.technicianName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="text-gray-500">Loading assignment history...</div>
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
    <div className="p-4">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Assignment History</h1>
        
        <div className="relative">
          <input
            type="search"
            placeholder="Search assignments..."
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
          {filteredAssignments.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No assignment history found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Complaint No.
                  </th>
                  {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Date
                  </th> */}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Head
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Company Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Mode Of Call
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    ID Number
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Project Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Complaint Number
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Complaint Date
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Beneficiary Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Contact Number
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Village
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Block
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    District
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Product
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Make
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    System Voltage
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Rating
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Qty
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    AC/DC
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Priority
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Insurance Type
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Nature Of Complaint
                  </th>
                  {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Delay
                  </th> */}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Technician Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Technician Contact
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Assignee Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Assignee WhatsApp
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Location
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Complaint Details
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Expected Completion
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Notes for Technician
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment, index) => (
                  <tr key={assignment.complaintNo || index} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap font-medium text-sm">{assignment.complaintNo}</td>
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.date}</td> */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.head}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.companyName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.modeOfCall}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.idNumber}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.projectName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.complaintNumber}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.complaintDate}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">{assignment.beneficiaryName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.contactNumber}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.village}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.block}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.district}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.product}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.make}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.systemVoltage}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.rating}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.qty}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.acDc}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      {assignment.priority && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getPriorityColor(assignment.priority)}`}>
                          {assignment.priority}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.insuranceType}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm max-w-xs truncate" title={assignment.natureOfComplaint}>
                      {assignment.natureOfComplaint}
                    </td>
                    {/* <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.delay}</td> */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">{assignment.technicianName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.technicianContact}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.assigneeName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.assigneeWhatsApp}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.location}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm max-w-xs truncate" title={assignment.complaintDetails}>
                      {assignment.complaintDetails}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{assignment.expectedCompletionDate}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm max-w-xs truncate" title={assignment.notesForTechnician}>
                      {assignment.notesForTechnician}
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

export default AssignmentHistoryTable