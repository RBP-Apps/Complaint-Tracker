// ComplaintTracker.jsx
"use client"

import { useState, useEffect } from "react"
import { Calendar, Upload, MapPin, Loader, Edit, Check, X } from "react-feather"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import DashboardLayout from "../components/DashboardLayout"

function ComplaintTracker() {
  const [activeTab, setActiveTab] = useState("pending")
  const [pendingTasks, setPendingTasks] = useState([])
  const [historyTasks, setHistoryTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedTaskData, setSelectedTaskData] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [checked, setChecked] = useState("")
  const [remark, setRemark] = useState("")

  const GOOGLE_SCRIPT_URL = "https://script.google.com/a/macros/rbpindia.com/s/AKfycbwnIMOzsFbniWnPFhl3lzE-2W0l6lD23keuz57-ldS_umSXIJqpEK-qxLE6eM0s7drqrQ/exec"

  useEffect(() => {
  const fetchTasks = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("%c[DEBUG] Step 1: Fetching Tracker sheet data...", "color: cyan")
      const trackerSheetUrl =
        "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=Tracker"

      const response = await fetch(trackerSheetUrl)
      const text = await response.text()
      console.log("%c[DEBUG] Step 2: Raw response length: " + text.length, "color: yellow")

      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}") + 1
      const jsonData = text.substring(jsonStart, jsonEnd)

      console.log("%c[DEBUG] Step 3: JSON data preview:", "color: lime", jsonData.substring(0, 200) + "...")

      const data = JSON.parse(jsonData)
      console.log("%c[DEBUG] Step 4: Parsed data object:", "color: lime", data)

      const pendingData = []
      const historyData = []

      if (data?.table?.rows) {
        console.log("%c[DEBUG] Step 5: Total rows found: " + data.table.rows.length, "color: cyan")

        data.table.rows.forEach((row, index) => {
          if (row.c && row.c.length > 0) {
            // Skip header row if needed
            if (index === 0) {
              const firstCell = row.c[0]?.v || ""
              if (firstCell === "Timestamp" || firstCell.toString().toLowerCase().includes("timestamp")) {
                console.log("%cSkipping header row " + index, "color: gray")
                return
              }
            }

            // NEW LOGIC: Column V (index 21) and Column W (index 22)
            const columnV = row.c[21]?.v || null  // Column V
            const columnW = row.c[22]?.v || null  // Column W
            const columnX = row.c[23]?.v || null  // Column X (Checked)
            const columnY = row.c[24]?.v || null  // Column Y (Remark)

            console.log(`%cRow ${index}: V="${columnV}" W="${columnW}" X="${columnX}" Y="${columnY}"`, "color: violet")

            const task = {
              id: row.c[1]?.v || `TRACK-${index}`,
              serialNo: row.c[1]?.v || "",
              complaintId: row.c[2]?.v || "",
              technicianName: row.c[3]?.v || "",
              technicianContact: row.c[4]?.v || "",
              beneficiaryName: row.c[5]?.v || "",
              contactNumber: row.c[6]?.v || "",
              village: row.c[7]?.v || "",
              block: row.c[8]?.v || "",
              district: row.c[9]?.v || "",
              product: row.c[10]?.v || "",
              make: row.c[11]?.v || "",
              systemVoltage: row.c[12]?.v || "",
              natureOfComplaint: row.c[13]?.v || "",
              uploadDocuments: row.c[14]?.v || "",
              geotagPhoto: row.c[15]?.v || "",
              remarks: row.c[16]?.v || "",
              trackerStatus: row.c[17]?.v || "",
              assigneeName: row.c[18]?.v || "",    // Column R
              plannedDate: row.c[19]?.v || "",     // Column S  
              // NEW FIELDS
              columnV: columnV,                    // Column V
              actualDate: columnW,                 // Column W (Actual Date)
              checked: columnX,                    // Column X (Checked)
              remark: columnY,                     // Column Y (Remark)
              rowIndex: index + 1,
            }

            // NEW PENDING/HISTORY LOGIC
            const hasColumnV = columnV !== null && columnV !== ""
            const hasColumnW = columnW !== null && columnW !== ""

            if (hasColumnV && !hasColumnW) {
              console.log("%c→ Pending:", "color: orange", task)
              pendingData.push(task)
            } else if (hasColumnV && hasColumnW) {
              console.log("%c→ History:", "color: lightblue", task)
              historyData.push(task)
            } else {
              console.log("%c→ Skipped:", "color: gray", task)
            }
          }
        })
      }

      console.log("%c[DEBUG] Step 6: Final Pending Count = " + pendingData.length, "color: orange")
      console.log("%c[DEBUG] Step 7: Final History Count = " + historyData.length, "color: lightblue")

      // Remove duplicates based on serialNo
      const uniquePending = pendingData.filter((task, index, self) =>
        index === self.findIndex(t => t.serialNo === task.serialNo)
      )
      
      const uniqueHistory = historyData.filter((task, index, self) =>
        index === self.findIndex(t => t.serialNo === task.serialNo)
      )
      
      console.log("%c[DEBUG] After deduplication: Pending = " + uniquePending.length + ", History = " + uniqueHistory.length, "color: magenta")

      setPendingTasks(uniquePending)
      setHistoryTasks(uniqueHistory)
      
    } catch (err) {
      console.error("%c[ERROR] Failed fetching tasks:", "color: red", err)
      setError(err.message)
      setPendingTasks([])
      setHistoryTasks([])
    } finally {
      console.log("%c[DEBUG] Step 8: Fetch complete", "color: green")
      setIsLoading(false)
    }
  }

  fetchTasks()
}, [])

const handleUpdateTask = async () => {
  setIsSubmitting(true)
  
  try {
    const currentTasks = [...pendingTasks] // Create a copy
    const taskIndex = currentTasks.findIndex(t => t.id === selectedTask)
    if (taskIndex === -1) throw new Error("Task not found")
    
    const task = { ...currentTasks[taskIndex] } // Create a copy of task object
    
    const formData = new FormData()
    formData.append('action', 'updateTrackerRecord')
    formData.append('serialNo', task.serialNo)
    formData.append('checkedValue', checked)
    formData.append('remarkValue', remark || "")
    
   let actualDate = ""
if (checked === "Approved" || checked === "Reject" || checked === "Ok") {
  actualDate = new Date().toLocaleDateString('en-GB')
}
formData.append('actualDate', actualDate)

    console.log('Submitting data:', {
      action: 'updateTrackerRecord',
      serialNo: task.serialNo,
      checkedValue: checked,
      remarkValue: remark,
      actualDate: actualDate
    })

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
    console.log('Response:', result)

    if (!result.success) {
      throw new Error(result.error || 'Failed to update task')
    }

if (checked === "Approved" || checked === "Reject" || checked === "Ok") {
  // Create updated task object
  const updatedTask = { 
    ...task, 
    checked: checked, 
    remark: remark,
    actualDate: actualDate
  }
  
  // Remove from pending using serialNo for better uniqueness
  setPendingTasks(prev => prev.filter(t => t.serialNo !== task.serialNo))
  
  // Add to history (check if not already exists)
  setHistoryTasks(prev => {
    const exists = prev.some(t => t.serialNo === task.serialNo)
    if (exists) {
      // Update existing entry
      return prev.map(t => t.serialNo === task.serialNo ? updatedTask : t)
    }
    // Add new entry
    return [...prev, updatedTask]
  })
  
  alert(`Task ${selectedTask} has been ${checked === "Approved" ? "approved" : checked === "Reject" ? "rejected" : "marked as Ok"} and moved to history.`)
}
    
    setIsDialogOpen(false)
    resetDialogState()
    
  } catch (err) {
    console.error("Error updating task:", err)
    alert("Failed to update task: " + err.message)
  } finally {
    setIsSubmitting(false)
  }
}

  const resetDialogState = () => {
    setSelectedTask(null)
    setSelectedTaskData(null)
    setChecked("")
    setRemark("")
  }

  const getCurrentTasks = () => {
    return activeTab === "pending" ? pendingTasks : historyTasks
  }
  
  const filteredTasks = getCurrentTasks().filter((task) => {
    if (!searchTerm || searchTerm.trim() === "") return true
    
    const searchFields = [
      task.serialNo,
      task.complaintId,
      task.technicianName,
      task.technicianContact,
      task.beneficiaryName,
      task.contactNumber,
      task.village,
      task.block,
      task.district,
      task.product,
      task.make,
      task.systemVoltage,
      task.natureOfComplaint,
      task.remarks,
      task.trackerStatus,
      task.checked,
      task.remark
    ]
    
    const normalizeText = (text) => {
      if (!text) return ""
      return text.toString().toLowerCase().trim()
    }
    
    const normalizedSearchTerm = normalizeText(searchTerm)
    const searchWords = normalizedSearchTerm.split(/\s+/).filter(word => word.length > 0)
    
    return searchWords.every(word => 
      searchFields.some(field => 
        normalizeText(field).includes(word)
      )
    )
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading complaint tracker data...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500">Error loading data: {error}</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Complaint Tracker</h1>
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending ({pendingTasks.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              History ({historyTasks.length})
            </button>
          </nav>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="search"
              placeholder="Search across all fields"
              className="pl-8 w-full sm:w-[280px] lg:w-[320px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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

        {/* Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
           {filteredTasks.length === 0 ? (
  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
    <p className="text-gray-500">
      {activeTab === "pending" 
        ? "No pending complaints found" 
        : "No complaint history found"
      }
    </p>
  </div>
) : (
  <>
    {/* Mobile Card View */}
    <div className="block md:hidden space-y-3">
      {filteredTasks.map((task, index) => (
        <div key={task.serialNo || index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{task.serialNo}</span>
            <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded">{task.trackerStatus}</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Complaint ID</span>
              <span className="text-gray-900 font-medium">{task.complaintId}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Beneficiary</span>
              <span className="text-gray-900">{task.beneficiaryName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Village</span>
              <span className="text-gray-900">{task.village}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Product</span>
              <span className="text-gray-900">{task.product}</span>
            </div>
            
            {/* Technician Info */}
            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs">
              <span className="text-gray-500">Technician</span>
              <span className="text-gray-900">{task.technicianName}</span>
            </div>
            
            {/* Documents & Photos */}
            {(task.uploadDocuments || task.geotagPhoto) && (
              <div className="flex gap-2 mt-2">
                {task.uploadDocuments && (
                  <a href={task.uploadDocuments} target="_blank" rel="noopener noreferrer" 
                     className="flex-1 text-center bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">
                    📄 Doc
                  </a>
                )}
                {task.geotagPhoto && (
                  <a href={task.geotagPhoto} target="_blank" rel="noopener noreferrer" 
                     className="flex-1 text-center bg-green-50 text-green-600 px-2 py-1 rounded text-xs">
                    📷 Photo
                  </a>
                )}
              </div>
            )}
            
            {/* History specific fields */}
            {activeTab === "history" && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    task.checked === 'Approved' ? 'bg-green-100 text-green-800' : 
                    task.checked === 'Reject' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.checked}
                  </span>
                </div>
              </div>
            )}
            
            {/* Action button for pending */}
            {activeTab === "pending" && (
              <div className="mt-2">
                <button
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-1.5 rounded-md text-xs font-medium"
                  onClick={() => {
                    setSelectedTask(task.id)
                    setSelectedTaskData(task)
                    setIsDialogOpen(true)
                    setChecked(task.checked || "")
                    setRemark(task.remark || "")
                  }}
                >
                  Review
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>

    {/* Desktop Table View */}
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {activeTab === "pending" && (
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            )}
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Serial No
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Complaint Id
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Technician Name
            </th>
             <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Technician Contact
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
              Nature Of Complaint
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Upload Documents
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Geotag Photo
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Action Taken
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Tracker Status
            </th>
            {activeTab === "history" && (
              <>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actual Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Checked
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Remark
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredTasks.map((task, index) => (
            <tr key={task.serialNo || index} className="hover:bg-gray-50">
              {activeTab === "pending" && (
                <td className="px-3 py-4 whitespace-nowrap">
                  <button
                    className="bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 border-0 py-1 px-3 rounded-md"
                    onClick={() => {
                      setSelectedTask(task.id)
                      setSelectedTaskData(task)
                      setIsDialogOpen(true)
                      setChecked(task.checked || "")
                      setRemark(task.remark || "")
                    }}
                  >
                    Review
                  </button>
                </td>
              )}
              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">{task.serialNo}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{task.complaintId}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{task.technicianName}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{task.technicianContact}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{task.beneficiaryName}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{task.contactNumber}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{task.village}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{task.block}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{task.district}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{task.product}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{task.make}</td>
              <td className="px-3 py-4 whitespace-nowrap text-sm max-w-xs truncate" title={task.natureOfComplaint}>
                {task.natureOfComplaint}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">
                {task.uploadDocuments && (
                  <a href={task.uploadDocuments} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    View
                  </a>
                )}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">
                {task.geotagPhoto && (
                  <a href={task.geotagPhoto} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    View
                  </a>
                )}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm max-w-xs truncate" title={task.remarks}>
                {task.remarks}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm">{task.trackerStatus}</td>
              {activeTab === "history" && (
                <>
                  <td className="px-3 py-4 whitespace-nowrap text-sm">{task.actualDate}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      task.checked === 'Approved' ? 'bg-green-100 text-green-800' : 
                      task.checked === 'Reject' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.checked}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm max-w-xs truncate" title={task.remark}>
                    {task.remark}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
)}
          </div>
        </div>

        {/* Review Dialog */}
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
                        Review Complaint: {selectedTaskData?.complaintId}
                      </h3>
                      <div className="mt-4 max-h-[60vh] overflow-auto">
                        <div className="grid gap-4">
                          {/* Pre-filled fields - read only */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Serial No 
                            </label>
                            <input
                              type="text"
                              value={selectedTaskData?.serialNo || ""}
                              readOnly
                              className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-50 text-gray-600"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Complaint Id 
                            </label>
                            <input
                              type="text"
                              value={selectedTaskData?.complaintId || ""}
                              readOnly
                              className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-50 text-gray-600"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Technician Name
                            </label>
                            <input
                              type="text"
                              value={selectedTaskData?.technicianName || ""}
                              readOnly
                              className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-50 text-gray-600"
                            />
                          </div>

                       <div className="space-y-2">
  <label htmlFor="checked" className="block text-sm font-medium text-gray-700">
    Checked 
  </label>
  <select
    id="checked"
    value={checked}
    onChange={(e) => setChecked(e.target.value)}
    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select option (optional)</option>
    <option value="Approved">Approved</option>
    <option value="Reject">Reject</option>
    <option value="Ok">Ok</option>
  </select>
</div>

                          <div className="space-y-2">
                            <label htmlFor="remark" className="block text-sm font-medium text-gray-700">
                              Remark 
                            </label>
                            <textarea
                              id="remark"
                              value={remark}
                              onChange={(e) => setRemark(e.target.value)}
                              placeholder="Enter your remarks here (optional)..."
                              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="3"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => setIsDialogOpen(false)}
                          className="py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateTask}
                          className="bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white py-2 px-4 rounded-md flex items-center"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Submit"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ComplaintTracker
