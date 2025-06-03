"use client"

import { useState, useEffect } from "react"
import AssignComplaintForm from "./AssignComplaintForm"

function PendingAssignmentsTable() {
  const [pendingComplaints, setPendingComplaints] = useState([])
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [selectedComplaintData, setSelectedComplaintData] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Google Apps Script Web App URL - Replace with your actual deployed script URL
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzkBpcYMupYQi6gSURT_tqDfeQrGtbS6DwiRvmjw0s2kAIGmHlkjnVJDddXOy0v6ur7rw/exec"
  
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
                  id: row.c[1] ? row.c[1].v : `CT-${index + 1}`,
                  beneficiaryName: row.c[7] ? row.c[7].v : "",
                  product: row.c[9] ? row.c[9].v : "",
                  village: row.c[12] ? row.c[12].v : "",
                  district: row.c[14] ? row.c[14].v : "",
                  complaintDate: row.c[11] ? row.c[11].v : "",
                  priority: row.c[21] ? row.c[21].v : "Medium", // Default priority
                  status: "Pending",
                  details: row.c[8] ? row.c[8].v : "",
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

  // Handle assigning complaint (form submission)
  const handleAssignComplaint = async (complaintId, assigneeData) => {
    try {
      // Find the complaint in our state
      const complaintIndex = pendingComplaints.findIndex(c => c.id === complaintId)
      if (complaintIndex === -1) throw new Error("Complaint not found")
      
      const complaint = pendingComplaints[complaintIndex]
      
      // Get the actual row index in the sheet (we stored this when fetching data)
      const rowIndex = complaint.rowIndex
      
      // Prepare form data for the update
      const formData = new FormData()
      formData.append('sheetName', 'FMS')
      formData.append('action', 'update')
      formData.append('rowIndex', rowIndex.toString())
      
      // Create an array with all columns, filled with empty strings
      // This ensures we only update specific columns and leave others unchanged
      const rowDataArray = new Array(50).fill('')
      
      // Fill only the columns we want to update (AA to AI, indices 26-34)
      // Also update column Z (index 25) to indicate this complaint has been assigned
rowDataArray[25] = new Date().toLocaleString('en-US')
      rowDataArray[29] = assigneeData.assignee // Column AA - Assignee Name
      rowDataArray[27] = assigneeData.technicianName // Column AB - Technician Name
      rowDataArray[28] = assigneeData.technicianContact // Column AC - Technician Contact
      rowDataArray[30] = assigneeData.assigneeWhatsapp // Column AD - Assignee WhatsApp
      rowDataArray[31] = assigneeData.location // Column AE - Location
      rowDataArray[32] = assigneeData.complaintDetails // Column AF - Complaint Details
      rowDataArray[33] = assigneeData.expectedCompletionDate // Column AG - Expected Csompletion Date
      rowDataArray[34] = assigneeData.notes // Column AH - Notes
      // rowDataArray[35] = assigneeData.assignmentTimestamp // Column AI - Assignment Timestamp
      
      // Also update column Z (index 25) to indicate this complaint has been assigned
      // rowDataArray[25] = "Assigned - " + new Date().toLocaleString()
      
      // Add the JSON string of row data to the form
      formData.append('rowData', JSON.stringify(rowDataArray))
      
      console.log("Submitting assignment for row:", rowIndex)
      console.log("Row data:", rowDataArray)
      
      // Post the update
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formData
      })
      
      // Log the response for debugging
      console.log("Assignment response:", response)
      
      // Try to parse the JSON response if available
      try {
        const result = await response.json()
        console.log("Response JSON:", result)
        
        if (result.error) {
          throw new Error(result.error)
        }
      } catch (jsonError) {
        console.log("Could not parse JSON response (likely due to CORS). This is expected.")
      }
      
      // Update the local state to remove this complaint from the list
      setPendingComplaints(prev => 
        prev.filter(complaint => complaint.id !== complaintId)
      )
      
      // Show success message
      alert(`Complaint ${complaintId} has been assigned to ${assigneeData.technicianName}.`)
      
      // Close dialog
      setIsDialogOpen(false)
      
    } catch (err) {
      console.error("Error assigning complaint:", err)
      alert("Failed to assign complaint: " + err.message)
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

  // Filter complaints based on search term
  const filteredComplaints = pendingComplaints.filter(
    (complaint) =>
      complaint.beneficiaryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.district?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle opening the assignment dialog
  const handleOpenAssignDialog = (complaint) => {
    setSelectedComplaint(complaint.id)
    setSelectedComplaintData(complaint)
    setIsDialogOpen(true)
  }

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
    <div className="p-4">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl font-bold">Pending Complaint Assignments</h1>
        
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
                    Project Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Complaint Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Village
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    District
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Contact No.
                  </th>
                  <th
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
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.map((complaint, index) => (
                  <tr key={`complaint-${complaint.id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{complaint.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{complaint.beneficiaryName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{complaint.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{complaint.village}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{complaint.district}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{complaint.complaintDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getPriorityColor(complaint.priority)}`}
                      >
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full border border-gray-400 text-gray-600">
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md"
                        onClick={() => handleOpenAssignDialog(complaint)}
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsDialogOpen(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Assign Complaint: {selectedComplaint}
                    </h3>
                    <div className="mt-4 max-h-[60vh] overflow-auto">
                      <AssignComplaintForm 
                        complaintId={selectedComplaint} 
                        onClose={() => setIsDialogOpen(false)}
                        onSubmit={handleAssignComplaint}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingAssignmentsTable