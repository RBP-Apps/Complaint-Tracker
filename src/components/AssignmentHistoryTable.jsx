"use client"

import { useState, useEffect } from "react"

function AssignmentHistoryTable() {
  const [assignmentHistory, setAssignmentHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

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
              // Check if column Y (index 24) has data and column Z (index 25) is null/empty
              const hasColumnY = row.c[24] && row.c[24].v !== null && row.c[24].v !== "";
              const isColumnZEmpty = row.c[25] && row.c[25].v !== null && row.c[25].v !== "";
              
              // Only include rows where column Y has data and column Z is null
              if (hasColumnY && isColumnZEmpty) {
                const assignment = {
                  rowIndex: index + 6, // Actual row index in the sheet (1-indexed, +5 for header rows, +1 for 1-indexing)
                  id: row.c[1] ? row.c[1].v : `COMP-${index + 1}`, // Column B - Complaint No.
                  date: row.c[2] ? row.c[2].v : "", // Column C - Date
                  beneficiaryName: row.c[10] ? row.c[10].v : "", // Column K - Beneficiary Name
                  contactNumber: row.c[11] ? row.c[11].v : "", // Column L - Contact Number
                  village: row.c[31] ? row.c[31].v : "", // Column M - Village
                  district: row.c[14] ? row.c[14].v : "", // Column O - District
                  product: row.c[15] ? row.c[15].v : "", // Column P - Product
                  priority: row.c[21] ? row.c[21].v : "Medium", // Column V - Priority
                  nature: row.c[23] ? row.c[23].v : "", // Column X - Nature Of Complaint
                  
                  // Assignment details (AB to AI)
                  technicianName: row.c[29] ? row.c[29].v : "", // Column AB - Technician Name
                  technicianContact: row.c[29] ? row.c[29].v : "", // Column AC - Technician Contact
                  assigneeName: row.c[27] ? row.c[27].v : "", // Column AA - Assignee Name
                  assigneeWhatsApp: row.c[30] ? row.c[30].v : "", // Column AD - Assignee WhatsApp Number
                  location: row.c[31] ? row.c[31].v : "", // Column AE - Location
                  complaintDetails: row.c[32] ? row.c[32].v : "", // Column AF - Complaint Details
                  expectedCompletionDate: row.c[33] ? row.c[33].v : "", // Column AG - Expected Completion Date
                  notes: row.c[34] ? row.c[34].v : "", // Column AH - Notes for Technician
                  
                  // Determine status based on if it has a completed date or not
                  // This is a placeholder logic - you might need to adjust based on your actual data structure
                  status: row.c[35] && row.c[35].v ? "Completed" : "In Progress",
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

  // Function to get appropriate color for status badges
  const getStatusColor = (status) => {
    switch(status) {
      case "Completed": return "bg-green-500"
      case "In Progress": return "bg-blue-500"
      case "Scheduled": return "bg-purple-500"
      default: return "bg-gray-500"
    }
  }

  // Function to get appropriate color for priority badges
  const getPriorityColor = (priority) => {
    switch(priority) {
      case "Urgent": return "bg-red-500"
      case "High": return "bg-orange-500"
      case "Medium": return "bg-blue-500"
      default: return "bg-green-500"
    }
  }

  // Filter assignments based on search term
  const filteredAssignments = assignmentHistory.filter(
    (assignment) =>
      assignment.beneficiaryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.technicianName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.district?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-xl font-bold">Assignment History</h1>
        
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
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Complaint ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Beneficiary
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Assigned Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Expected Completion
                  </th>
                  {/* <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Priority
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Status
                  </th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{assignment.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{assignment.beneficiaryName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{assignment.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{assignment.technicianName}</div>
                        {/* <div className="text-xs text-gray-500">{assignment.technicianContact}</div> */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div>{assignment.village}</div>
                        {/* <div className="text-xs text-gray-500">{assignment.district}</div> */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{assignment.expectedCompletionDate}</td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getPriorityColor(assignment.priority)}`}
                      >
                        {assignment.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(assignment.status)}`}
                      >
                        {assignment.status}
                      </span>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Modal (you can add this if you want to view more details) */}
    </div>
  )
}

export default AssignmentHistoryTable