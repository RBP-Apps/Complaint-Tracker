"use client"

import { useState, useEffect } from "react"
import { Calendar, Upload, MapPin, Loader } from "react-feather"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

function TrackerPendingTable() {
  const [pendingTasks, setPendingTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedTaskData, setSelectedTaskData] = useState(null)
  const [date, setDate] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [status, setStatus] = useState("pending")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [uploadedDocument, setUploadedDocument] = useState(null)
  const [uploadedPhoto, setUploadedPhoto] = useState(null)
  const [uploadStatus, setUploadStatus] = useState("")

  // Google Apps Script Web App URL - Replace with your actual deployed script URL
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzkBpcYMupYQi6gSURT_tqDfeQrGtbS6DwiRvmjw0s2kAIGmHlkjnVJDddXOy0v6ur7rw/exec"
  // Google Drive folder ID for file uploads
  const DRIVE_FOLDER_ID = "1-H5DWKRV2u_ueqtLX-ISTPvuySGYBLoT"

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

  // Add this function after formatDateString function
const getPriorityColor = (priority) => {
  switch(priority?.toLowerCase()) {
    case "urgent": return "bg-red-500"
    case "high": return "bg-orange-500"
    case "medium": return "bg-blue-500"
    case "low": return "bg-green-500"
    default: return "bg-gray-500"
  }
}
  
  // Function to fetch data from Google Sheets
  useEffect(() => {
    const fetchTasks = async () => {
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
        
        // Process the task data
        if (data && data.table && data.table.rows) {
          const taskData = []
          
          // Skip the header row and process the data rows
          data.table.rows.slice(3).forEach((row, index) => {
            if (row.c) {
              const hasColumnAJ = row.c[35] && row.c[35].v !== null && row.c[35].v !== "";
              const isColumnAKEmpty = !row.c[36] || row.c[36].v === null || row.c[36].v === "";
              
              // Only include rows where column AJ has data and column AK is null
              if (hasColumnAJ && isColumnAKEmpty) {
                const task = {
                  rowIndex: index + 6, // Actual row index in the sheet (1-indexed, +5 for header rows, +1 for 1-indexing)
  
                  // All columns from B to AI (excluding Planned, Actual, and Delay)
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
                  // Skip Y (Planned), Z (Actual), and AA (Delay) columns as requested
                  technicianName: row.c[27] ? row.c[27].v : "", // Column AB - Technician Name
                  technicianContact: row.c[28] ? row.c[28].v : "", // Column AC - Technician Contact
                  assigneeName: row.c[29] ? row.c[29].v : "", // Column AD - Assignee Name
                  assigneeWhatsApp: row.c[30] ? row.c[30].v : "", // Column AE - Assignee WhatsApp Number
                  location: row.c[31] ? row.c[31].v : "", // Column AF - Location
                  complaintDetails: row.c[32] ? row.c[32].v : "", // Column AG - Complaint Details
                  expectedCompletionDate: row.c[33] ? formatDateString(row.c[33].v) : "", // Column AH - Expected Completion Date
                  notesForTechnician: row.c[34] ? row.c[34].v : "", // Column AI - Notes for Technician
                  
                  // Keep these for backward compatibility with existing functionality
                  id: row.c[1] ? row.c[1].v : `COMP-${index + 1}`,
                  assignee: row.c[29] ? row.c[29].v : "", // AD - Assignee Name
                  technician: row.c[27] ? row.c[27].v : "", // AB - Technician Name
                  details: row.c[32] ? row.c[32].v : "", // AG - Complaint Details
                  targetDate: row.c[33] ? formatDateString(row.c[33].v) : "", // AH - Expected Completion Date
                  
                  // Store the complete row data for future reference
                  fullRowData: row.c
                }
                
                taskData.push(task)
              }
            }
          })
          
          setPendingTasks(taskData)
        }
      } catch (err) {
        console.error("Error fetching tasks data:", err)
        setError(err.message)
        // On error, set to empty array
        setPendingTasks([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTasks()
  }, [])

  // Function to upload files to Google Drive
  // Function to upload files to Google Drive - modified version
// Modified uploadFileToDrive function for CORS workaround
const uploadFileToDrive = async (file, fileType) => {
  if (!file) return null;
  
  try {
    setUploadStatus(`Uploading ${fileType}...`);
    
    // Convert file to base64
    const reader = new FileReader();
    const fileBase64 = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Create form data
    const formData = new FormData();
    formData.append('action', 'uploadFile');
    formData.append('fileName', file.name);
    formData.append('mimeType', file.type);
    formData.append('folderId', DRIVE_FOLDER_ID);
    formData.append('data', fileBase64);

    // Send the request
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData
    });

    // Parse the response
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to upload file');
    }

    // Return the direct file URL
    return `https://drive.google.com/uc?id=${result.fileId}`;
    
  } catch (err) {
    console.error(`Error uploading ${fileType}:`, err);
    alert(`Failed to upload ${fileType}: ${err.message}`);
    return null;
  }
};

  // Handle updating task
  // Modified handleUpdateTask function to ensure file URLs are correctly saved
const handleUpdateTask = async () => {
  setIsSubmitting(true);
  
  try {
    // Find the task in our state
    const taskIndex = pendingTasks.findIndex(t => t.id === selectedTask);
    if (taskIndex === -1) throw new Error("Task not found");
    
    const task = pendingTasks[taskIndex];
    
    // Upload files if they exist - store exact URLs
    let documentUrl = null;
    let photoUrl = null;
    
    if (uploadedDocument) {
      setUploadStatus("Uploading document...");
      documentUrl = await uploadFileToDrive(uploadedDocument, "document");
      console.log("Document uploaded, URL:", documentUrl);
    }
    
    if (uploadedPhoto) {
      setUploadStatus("Uploading photo...");
      photoUrl = await uploadFileToDrive(uploadedPhoto, "photo");
      console.log("Photo uploaded, URL:", photoUrl);
    }
    
    // Get the completion date and format it
    const completionDate = date ? date.toISOString().split('T')[0] : '';
    const remarks = document.getElementById('remarks').value;
    
    // Create history entry with the correct file URLs
    // Make sure to explicitly include the URLs in the row data
    setUploadStatus("Submitting to Tracker History...");
    
    // Format current timestamp
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Create the history row with explicit URLs
    const historyRow = [
      timestamp,                            // Current timestamp
      task.id,                             // Complaint ID
      completionDate,                      // Completion Date
      status === "close_task" ? "Completed" : "In Progress", // Status
      remarks,                             // Remarks
      documentUrl || "",                   // Document URL - explicit direct URL
      photoUrl || ""                       // Photo URL - explicit direct URL
    ];
    
    console.log("Adding to Tracker History with row data:", historyRow);
    
    // Add to Tracker History with the direct file URLs
    await addToTrackerHistory(task, completionDate, remarks, documentUrl, photoUrl);
    
    // If task is closed, remove it from the list
    if (status === "close_task") {
      setPendingTasks(prev => 
        prev.filter(task => task.id !== selectedTask)
      );
    }
    
    // Show success message
    alert(`Task ${selectedTask} has been updated successfully to Tracker History.`);
    
    // Close dialog
    setIsDialogOpen(false);
    
  } catch (err) {
    console.error("Error updating task:", err);
    alert("Failed to update task: " + err.message);
  } finally {
    setIsSubmitting(false);
    setUploadStatus("");
  }
};

// Function to add a new entry to the Tracker History sheet - updated to ensure URLs are passed correctly
const addToTrackerHistory = async (task, completionDate, remarks, documentUrl, photoUrl) => {
  try {
    const formData = new FormData();
    formData.append('sheetName', 'Tracker History');
    formData.append('action', 'insert');
    
    const now = new Date();
    // const timestamp = now.toISOString();
    const timestamp = new Date().toLocaleString('en-US')
    
    const historyRow = [
      timestamp,
      task.id,
      completionDate,
      status === "close_task" ? "Completed" : "In Progress",
      remarks,
      documentUrl || "",
      photoUrl || ""
    ];
    
    formData.append('rowData', JSON.stringify(historyRow));
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update tracker history');
    }
    
    return true;
  } catch (error) {
    console.error("Error submitting to Tracker History:", error);
    throw error;
  }
};
  // Function to add a new entry to the Tracker History sheet
  // const addToTrackerHistory = async (task, completionDate, remarks, documentUrl, photoUrl) => {
  //   // Prepare form data for adding to Tracker History
  //   const formData = new FormData();
  //   formData.append('sheetName', 'Tracker History');
  //   formData.append('action', 'insert');
    
  //   // Format current timestamp
  //   const now = new Date();
  //   const timestamp = now.toISOString();
  //   const historyRow = [
  //     timestamp, // Current timestamp
  //     task.id, // Complaint ID
  //     completionDate, // Completion Date
  //     status === "close_task" ? "Completed" : "In Progress", // Status
  //     remarks, // Remarks
  //     documentUrl || "", // Document URL
  //     photoUrl || "" // Photo URL
  //   ];
    
  //   // Add the JSON string of row data to the form
  //   formData.append('rowData', JSON.stringify(historyRow));
    
  //   console.log("Adding to Tracker History:");
  //   console.log("Row data:", historyRow);
    
  //   // Post the update
  //   const response = await fetch(GOOGLE_SCRIPT_URL, {
  //     method: 'POST',
  //     body: formData
  //   });
    
  //   // Log the response for debugging
  //   console.log("Tracker History update response:", response);
    
  //   // Try to parse the JSON response if available
  //   try {
  //     const result = await response.json();
  //     console.log("Response JSON:", result);
      
  //     if (result.error) {
  //       throw new Error(result.error);
  //     }
  //   } catch (jsonError) {
  //     console.log("Could not parse JSON response (likely due to CORS). This is expected.");
  //   }
  // };

  // Handle file selection for documents
  const handleDocumentChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedDocument(e.target.files[0]);
    }
  };
  
  // Handle file selection for photos
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedPhoto(e.target.files[0]);
    }
  };

  // Filter tasks based on search term
  const filteredTasks = pendingTasks.filter(
    (task) =>
      task.assigneeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.technicianName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.complaintNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.beneficiaryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.product?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="text-gray-500">Loading tasks data...</div>
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
        <h1 className="text-xl font-bold">Tracker Pending Tasks</h1>
        
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
              <p className="text-gray-500">No pending tracker tasks found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
  <tr>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
      Actions
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
      Complaint No.
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
      Date
    </th>
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
                {filteredTasks.map((task) => (
                 <tr key={task.complaintNo || index} className="hover:bg-gray-50">
                 <td className="px-3 py-4 whitespace-nowrap">
                   <button
                     className="bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 border-0 py-1 px-3 rounded-md"
                     onClick={() => {
                       setSelectedTask(task.id)
                       setSelectedTaskData(task)
                       setIsDialogOpen(true)
                       setUploadedDocument(null)
                       setUploadedPhoto(null)
                       setDate(null)
                       setStatus("pending")
                     }}
                   >
                     Update
                   </button>
                 </td>
                 <td className="px-3 py-4 whitespace-nowrap font-medium text-sm">{task.complaintNo}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.date}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.head}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.companyName}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.modeOfCall}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.idNumber}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.projectName}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.complaintNumber}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.complaintDate}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">{task.beneficiaryName}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.contactNumber}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.village}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.block}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.district}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.product}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.make}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.systemVoltage}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.rating}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.qty}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.acDc}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">
                   {task.priority && (
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getPriorityColor(task.priority)}`}>
                       {task.priority}
                     </span>
                   )}
                 </td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.insuranceType}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm max-w-xs truncate" title={task.natureOfComplaint}>
                   {task.natureOfComplaint}
                 </td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">{task.technicianName}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.technicianContact}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.assigneeName}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.assigneeWhatsApp}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.location}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm max-w-xs truncate" title={task.complaintDetails}>
                   {task.complaintDetails}
                 </td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm">{task.expectedCompletionDate}</td>
                 <td className="px-3 py-4 whitespace-nowrap text-sm max-w-xs truncate" title={task.notesForTechnician}>
                   {task.notesForTechnician}
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Update Task: {selectedTask}</h3>
                    <div className="mt-4 max-h-[60vh] overflow-auto">
                      <div className="grid gap-4">
                      <div className="space-y-2">
  <label htmlFor="completeDate" className="block text-sm font-medium text-gray-700">
    Date of Complete
  </label>
  <div className="relative">
    <DatePicker
      id="completeDate"
      selected={date}
      onChange={(selectedDate) => setDate(selectedDate)}
      className="w-full border border-gray-300 rounded-md py-2 px-3 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      dateFormat="yyyy-MM-dd"
      placeholderText="Select completion date"
      showPopperArrow={false}
      popperClassName="z-50"
      calendarClassName="shadow-lg border border-gray-200 rounded-md"
      dayClassName={(date) => "hover:bg-blue-500 hover:text-white rounded"}
      wrapperClassName="w-full"
    />
    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
  </div>
</div>

                        <div className="space-y-2">
                          <label htmlFor="status" className="block text-sm font-medium">
                            Tracker Status
                          </label>
                          <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full border border-gray-300 rounded-md py-2 px-3"
                          >
                            <option value="pending">In Progress</option>
                            <option value="close_task">Close Task</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="remarks" className="block text-sm font-medium">
                            Remarks
                          </label>
                          <textarea
                            id="remarks"
                            placeholder="Enter remarks about the task"
                            className="w-full border border-gray-300 rounded-md py-2 px-3"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="documents" className="block text-sm font-medium">
                            Upload Documents
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              id="documents"
                              type="file"
                              className="flex-1 border border-gray-300 rounded-md py-2 px-3"
                              onChange={handleDocumentChange}
                            />
                            <button 
                              type="button" 
                              className="p-2 border border-gray-300 rounded-md"
                              disabled={!uploadedDocument}
                            >
                              <Upload className="h-4 w-4" />
                            </button>
                          </div>
                          {uploadedDocument && (
                            <div className="text-sm text-green-600">
                              Selected: {uploadedDocument.name}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="geotagPhoto" className="block text-sm font-medium">
                            Geotag Photo
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              id="geotagPhoto"
                              type="file"
                              accept="image/*"
                              className="flex-1 border border-gray-300 rounded-md py-2 px-3"
                              onChange={handlePhotoChange}
                            />
                            <button 
                              type="button" 
                              className="p-2 border border-gray-300 rounded-md"
                              disabled={!uploadedPhoto}
                            >
                              <MapPin className="h-4 w-4" />
                            </button>
                          </div>
                          {uploadedPhoto && (
                            <div className="text-sm text-green-600">
                              Selected: {uploadedPhoto.name}
                            </div>
                          )}
                        </div>
                        
                        {uploadStatus && (
                          <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded-md">
                            {uploadStatus}
                          </div>
                        )}
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
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
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
  )
}

export default TrackerPendingTable