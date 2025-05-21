"use client"

import { useState, useEffect } from "react"

function VerifiedTasksTable() {
  const [verifiedTasks, setVerifiedTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Function to fetch data from Google Sheets
  useEffect(() => {
    const fetchVerifiedTasks = async () => {
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
        
        // Process the verified tasks data
        if (data && data.table && data.table.rows) {
          const tasksData = []
          
          // Skip the header row and process the data rows
          data.table.rows.slice(5).forEach((row, index) => {
            if (row.c) {
              // Check if columns AT (index 45) and AU (index 46) are both not null
              const hasColumnAT = row.c[40] && row.c[40].v !== null && row.c[40].v !== "";
              const hasColumnAU = row.c[41] && row.c[41].v !== null && row.c[41].v !== "";
              
              // Only include rows where both column AT and AU have data
              if (hasColumnAT && hasColumnAU) {
                const task = {
                  rowIndex: index + 6, // Actual row index in the sheet (1-indexed, +5 for header rows, +1 for 1-indexing)
                  id: row.c[1] ? row.c[1].v : `COMP-${index + 1}`, // Column B - Complaint No.
                  date: row.c[2] ? row.c[2].v : "", // Column C - Date
                  name: row.c[3] ? row.c[3].v : "", // Column D - Name
                  phone: row.c[4] ? row.c[4].v : "", // Column E - Phone
                  email: row.c[5] ? row.c[5].v : "", // Column F - Email
                  address: row.c[6] ? row.c[6].v : "", // Column G - Address
                  
                  // Additional relevant data that might be useful
                  assignee: row.c[27] ? row.c[27].v : "", // Column AA - Assignee Name
                  technician: row.c[28] ? row.c[28].v : "", // Column AB - Technician Name
                  complaintDetails: row.c[32] ? row.c[32].v : "", // Column AF - Complaint Details
                  completedDate: row.c[36] ? row.c[36].v : "", // Column AJ - Completed Date
                  verificationDate: row.c[45] ? row.c[45].v : "", // Column AT - Verification Date
                  
                  // Status is always "Verified" for verified tasks
                  status: "Verified",
                }
                
                tasksData.push(task)
              }
            }
          })
          
          setVerifiedTasks(tasksData)
        }
      } catch (err) {
        console.error("Error fetching verified tasks data:", err)
        setError(err.message)
        // On error, set to empty array
        setVerifiedTasks([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchVerifiedTasks()
  }, [])

  // Filter tasks based on search term
  const filteredTasks = verifiedTasks.filter(
    (task) =>
      task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.technician?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="text-gray-500">Loading verified tasks...</div>
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
        <h1 className="text-xl font-bold">Verified Tasks</h1>
        
        <div className="relative">
          <input
            type="search"
            placeholder="Search tasks..."
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
          {filteredTasks.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No verified tasks found</p>
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
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Address
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Assignee
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Technician
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Completed Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Verification Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{task.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{task.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{task.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{task.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{task.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{task.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{task.assignee}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{task.technician}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{task.completedDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{task.verificationDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full text-white bg-teal-500">
                        {task.status}
                      </span>
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

export default VerifiedTasksTable