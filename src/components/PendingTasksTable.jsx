"use client"

import { useState, useEffect } from "react"
import { Calendar, Upload, MapPin, Loader, Edit, Check, X } from "react-feather"
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
  const [companyFilter, setCompanyFilter] = useState("")
  const [modeOfCallFilter, setModeOfCallFilter] = useState("")
  const [technicianFilter, setTechnicianFilter] = useState("")
  const [technicianName, setTechnicianName] = useState("")
  const [showTechnicianDropdown, setShowTechnicianDropdown] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [editedData, setEditedData] = useState({})
  const [technicianOptions, setTechnicianOptions] = useState([])
  const [username, setUsername] = useState("")

  useEffect(() => {
    const u = localStorage.getItem("username") || ""
    setUsername(u)
  }, [])

  const techDisplayName = (username || "").toLowerCase().startsWith("tech")
    ? (username || "").substring(4).trim()
    : ""

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzkBpcYMupYQi6gSURT_tqDfeQrGtbS6DwiRvmjw0s2kAIGmHlkjnVJDddXOy0v6ur7rw/exec"
  const DRIVE_FOLDER_ID = "1-H5DWKRV2u_ueqtLX-ISTPvuySGYBLoT"

  const formatDateString = (dateValue) => {
    if (!dateValue) return "";
    
    let date;
    
    if (typeof dateValue === 'string' && dateValue.includes('T')) {
      date = new Date(dateValue);
    } else if (typeof dateValue === 'string' && dateValue.includes('-')) {
      date = new Date(dateValue);
    } else if (typeof dateValue === 'string' && dateValue.startsWith('Date(')) {
      const match = dateValue.match(/Date\((\d+),(\d+),(\d+)\)/);
      if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        const day = parseInt(match[3]);
        date = new Date(year, month, day);
      } else {
        return dateValue;
      }
    } else if (typeof dateValue === 'object' && dateValue.getDate) {
      date = dateValue;
    } else {
      return dateValue;
    }
    
    if (isNaN(date.getTime())) {
      return dateValue;
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case "urgent": return "bg-red-500"
      case "high": return "bg-orange-500"
      case "medium": return "bg-blue-500"
      case "low": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }
  
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const sheetUrl = "https://docs.google.com/spreadsheets/d/1Vn295WmY0o6qh03rYzpCISGfMgT5RViXdYyd_ZNQ2p8/gviz/tq?tqx=out:json&sheet=FMS"
        const response = await fetch(sheetUrl)
        const text = await response.text()
        
        const jsonStart = text.indexOf('{')
        const jsonEnd = text.lastIndexOf('}') + 1
        const jsonData = text.substring(jsonStart, jsonEnd)
        
        const data = JSON.parse(jsonData)
        
        if (data && data.table && data.table.rows) {
          const taskData = []
          
          data.table.rows.slice(3).forEach((row, index) => {
            if (row.c) {
              const hasColumnAJ = row.c[35] && row.c[35].v !== null && row.c[35].v !== "";
              const isColumnAKEmpty = !row.c[36] || row.c[36].v === null || row.c[36].v === "";
              
              if (hasColumnAJ && isColumnAKEmpty) {
                const task = {
                  rowIndex: index + 6,
                  complaintNo: row.c[1] ? row.c[1].v : "",
                  date: row.c[2] ? formatDateString(row.c[2].v) : "",
                  head: row.c[3] ? row.c[3].v : "",
                  companyName: row.c[4] ? row.c[4].v : "",
                  modeOfCall: row.c[5] ? row.c[5].v : "",
                  idNumber: row.c[6] ? row.c[6].v : "",
                  projectName: row.c[7] ? row.c[7].v : "",
                  complaintNumber: row.c[8] ? row.c[8].v : "",
                  complaintDate: row.c[9] ? formatDateString(row.c[9].v) : "",
                  beneficiaryName: row.c[10] ? row.c[10].v : "",
                  contactNumber: row.c[11] ? row.c[11].v : "",
                  village: row.c[12] ? row.c[12].v : "",
                  block: row.c[13] ? row.c[13].v : "",
                  district: row.c[14] ? row.c[14].v : "",
                  product: row.c[15] ? row.c[15].v : "",
                  make: row.c[16] ? row.c[16].v : "",
                  systemVoltage: row.c[17] ? row.c[17].v : "",
                  rating: row.c[18] ? row.c[18].v : "",
                  qty: row.c[19] ? row.c[19].v : "",
                  acDc: row.c[20] ? row.c[20].v : "",
                  priority: row.c[21] ? row.c[21].v : "",
                  insuranceType: row.c[22] ? row.c[22].v : "",
                  natureOfComplaint: row.c[23] ? row.c[23].v : "",
                  technicianName: row.c[27] ? row.c[27].v : "",
                  technicianContact: row.c[28] ? row.c[28].v : "",
                  assigneeName: row.c[29] ? row.c[29].v : "",
                  assigneeWhatsApp: row.c[30] ? row.c[30].v : "",
                  location: row.c[31] ? row.c[31].v : "",
                  complaintDetails: row.c[32] ? row.c[32].v : "",
                  expectedCompletionDate: row.c[33] ? formatDateString(row.c[33].v) : "",
                  notesForTechnician: row.c[34] ? row.c[34].v : "",
                  id: row.c[1] ? row.c[1].v : `COMP-${index + 1}`,
                  assignee: row.c[29] ? row.c[29].v : "",
                  technician: row.c[27] ? row.c[27].v : "",
                  details: row.c[32] ? row.c[32].v : "",
                  targetDate: row.c[33] ? formatDateString(row.c[33].v) : "",
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
        setPendingTasks([])
      } finally {
        setIsLoading(false)
      }
    }

    const fetchTechnicianOptions = async () => {
      try {
        const sheetUrl = "https://docs.google.com/spreadsheets/d/1Vn295WmY0o6qh03rYzpCISGfMgT5RViXdYyd_ZNQ2p8/gviz/tq?tqx=out:json&sheet=master"
        const response = await fetch(sheetUrl)
        const text = await response.text()
        
        const jsonStart = text.indexOf('{')
        const jsonEnd = text.lastIndexOf('}') + 1
        const jsonData = text.substring(jsonStart, jsonEnd)
        
        const data = JSON.parse(jsonData)
        
        if (data && data.table && data.table.rows) {
          const options = data.table.rows.slice(2).map(row => row.c[5]?.v || "").filter(name => name && name.trim() !== "")
          setTechnicianOptions([...new Set(options)].sort())
        }
      } catch (err) {
        console.error("Error fetching technician options:", err)
        setTechnicianOptions([])
      }
    }

    fetchTasks()
    fetchTechnicianOptions()
  }, [])

  const uploadFileToDrive = async (file, fileType) => {
    if (!file) return null;
    
    try {
      setUploadStatus(`Uploading ${fileType}...`);
      
      const reader = new FileReader();
      const fileBase64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const formData = new FormData();
      formData.append('action', 'uploadFile');
      formData.append('fileName', file.name);
      formData.append('mimeType', file.type);
      formData.append('folderId', DRIVE_FOLDER_ID);
      formData.append('data', fileBase64);

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload file');
      }

      return `https://drive.google.com/uc?id=${result.fileId}`;
      
    } catch (err) {
      console.error(`Error uploading ${fileType}:`, err);
      alert(`Failed to upload ${fileType}: ${err.message}`);
      return null;
    }
  };

  const handleUpdateTask = async () => {
    setIsSubmitting(true);
    
    try {
      const taskIndex = pendingTasks.findIndex(t => t.id === selectedTask);
      if (taskIndex === -1) throw new Error("Task not found");
      
      const task = pendingTasks[taskIndex];
      
      let documentUrl = null;
      let photoUrl = null;
      
      if (uploadedDocument) {
        setUploadStatus("Uploading document...");
        documentUrl = await uploadFileToDrive(uploadedDocument, "document");
      }
      
      if (uploadedPhoto) {
        setUploadStatus("Uploading photo...");
        photoUrl = await uploadFileToDrive(uploadedPhoto, "photo");
      }
      
      const completionDate = date ? date.toISOString().split('T')[0] : '';
      const remarks = document.getElementById('remarks').value;
      
      const now = new Date();
      const timestamp = now.toISOString();
      
      let statusText = "";
      switch(status) {
        case "pending":
          statusText = "In Progress";
          break;
        case "insurance":
          statusText = "Insurance";
          break;
        case "close_task":
          statusText = "Completed";
          break;
        default:
          statusText = "In Progress";
      }
      
      const historyRow = [
        timestamp,
        task.id,
        completionDate,
        statusText,
        remarks,
        documentUrl || "",
        photoUrl || "",
        technicianName || task.technicianName || ""
      ];
      
      await addToTrackerHistory(task, completionDate, remarks, documentUrl, photoUrl);
      
      if (status === "close_task") {
        setPendingTasks(prev => 
          prev.filter(task => task.id !== selectedTask)
        );
      }
      
      alert(`Task ${selectedTask} has been updated successfully to Tracker History.`);
      setIsDialogOpen(false);
      
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Failed to update task: " + err.message);
    } finally {
      setIsSubmitting(false);
      setUploadStatus("");
    }
  };

  const addToTrackerHistory = async (task, completionDate, remarks, documentUrl, photoUrl) => {
    try {
      const formData = new FormData();
      formData.append('sheetName', 'Tracker History');
      formData.append('action', 'insert');
      
      const timestamp = new Date().toLocaleString('en-US')
      
      let statusText = "";
      switch(status) {
        case "pending":
          statusText = "In Progress";
          break;
        case "insurance":
          statusText = "Insurance";
          break;
        case "close_task":
          statusText = "Completed";
          break;
        default:
          statusText = "In Progress";
      }
      
      const historyRow = [
        timestamp,
        task.id,
        completionDate,
        statusText,
        remarks,
        documentUrl || "",
        photoUrl || "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", 
        technicianName || task.technicianName || ""
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

  const handleDocumentChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedDocument(e.target.files[0]);
    }
  };
  
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedPhoto(e.target.files[0]);
    }
  };

  const handleTechnicianSelect = (name) => {
    setTechnicianName(name);
    setShowTechnicianDropdown(false);
  };

  const handleEditRow = (task) => {
    setEditingRow(task.id);
    setEditedData({
      technicianName: task.technicianName || "",
      technicianContact: task.technicianContact || "",
      assigneeName: task.assigneeName || "",
      assigneeWhatsApp: task.assigneeWhatsApp || "",
      location: task.location || "",
      complaintDetails: task.complaintDetails || "",
      expectedCompletionDate: task.expectedCompletionDate || "",
      notesForTechnician: task.notesForTechnician || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditedData({});
  };

  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitEdit = async (task) => {
    setIsSubmitting(true);
    try {
      const updates = {};
      
      if (editedData.technicianName !== undefined) {
        updates['technicianName'] = editedData.technicianName;
      }
      if (editedData.technicianContact !== undefined) {
        updates['technicianContact'] = editedData.technicianContact;
      }
      if (editedData.assigneeName !== undefined) {
        updates['assigneeName'] = editedData.assigneeName;
      }
      if (editedData.assigneeWhatsApp !== undefined) {
        updates['assigneeWhatsApp'] = editedData.assigneeWhatsApp;
      }
      if (editedData.location !== undefined) {
        updates['location'] = editedData.location;
      }
      if (editedData.complaintDetails !== undefined) {
        updates['complaintDetails'] = editedData.complaintDetails;
      }
      if (editedData.expectedCompletionDate !== undefined) {
        updates['expectedCompletionDate'] = editedData.expectedCompletionDate;
      }
      if (editedData.notesForTechnician !== undefined) {
        updates['notesForTechnician'] = editedData.notesForTechnician;
      }

      const formData = new FormData();
      formData.append('action', 'updateSpecificColumns');
      formData.append('sheetName', 'FMS');
      formData.append('complaintNumber', task.complaintNumber);
      formData.append('updates', JSON.stringify(updates));

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update row');
      }

      setPendingTasks(prev => prev.map(t => 
        t.id === task.id ? {
          ...t,
          ...updates
        } : t
      ));

      // Refetch technician options after update
      const fetchTechnicianOptions = async () => {
        try {
          const sheetUrl = "https://docs.google.com/spreadsheets/d/1Vn295WmY0o6qh03rYzpCISGfMgT5RViXdYyd_ZNQ2p8/gviz/tq?tqx=out:json&sheet=master"
          const response = await fetch(sheetUrl)
          const text = await response.text()
          
          const jsonStart = text.indexOf('{')
          const jsonEnd = text.lastIndexOf('}') + 1
          const jsonData = text.substring(jsonStart, jsonEnd)
          
          const data = JSON.parse(jsonData)
          
          if (data && data.table && data.table.rows) {
            const options = data.table.rows.slice(2).map(row => row.c[5]?.v || "").filter(name => name && name.trim() !== "")
            setTechnicianOptions([...new Set(options)].sort())
          }
        } catch (err) {
          console.error("Error fetching technician options:", err)
          setTechnicianOptions([])
        }
      };
      await fetchTechnicianOptions(); // Ensure this runs before proceeding

      setEditingRow(null);
      setEditedData({});
      alert("Task updated successfully!");
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Failed to update task: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUniqueCompanyNames = () => {
    const companies = pendingTasks
      .map(task => task.companyName)
      .filter(name => name && name.trim() !== "")
    return [...new Set(companies)].sort()
  }
  
  const getUniqueModeOfCalls = () => {
    const modes = pendingTasks
      .map(task => task.modeOfCall)
      .filter(mode => mode && mode.trim() !== "")
    return [...new Set(modes)].sort()
  }
  
  const getUniqueTechnicianNames = () => {
    const technicians = pendingTasks
      .map(task => task.technicianName)
      .filter(name => name && name.trim() !== "")
    return [...new Set(technicians)].sort()
  }
  
  const filteredTasks = pendingTasks.filter(
    (task) => {
      const searchFields = [
        task.complaintNo,
        task.date,
        task.head,
        task.companyName,
        task.modeOfCall,
        task.idNumber,
        task.projectName,
        task.complaintNumber,
        task.complaintDate,
        task.beneficiaryName,
        task.contactNumber,
        task.village,
        task.block,
        task.district,
        task.product,
        task.make,
        task.systemVoltage,
        task.rating,
        task.qty,
        task.acDc,
        task.priority,
        task.insuranceType,
        task.natureOfComplaint,
        task.technicianName,
        task.technicianContact,
        task.assigneeName,
        task.assigneeWhatsApp,
        task.location,
        task.complaintDetails,
        task.expectedCompletionDate,
        task.notesForTechnician,
        task.id,
        task.assignee,
        task.technician,
        task.details,
        task.targetDate
      ]
      
      const normalizeText = (text) => {
        if (!text) return ""
        return text.toString().toLowerCase().trim()
      }
      
      const matchesSearch = () => {
        if (!searchTerm || searchTerm.trim() === "") return true
        
        const normalizedSearchTerm = normalizeText(searchTerm)
        const searchWords = normalizedSearchTerm.split(/\s+/).filter(word => word.length > 0)
        
        return searchWords.every(word => 
          searchFields.some(field => 
            normalizeText(field).includes(word)
          )
        );
      }
      
      const matchesSearchTerm = matchesSearch()
      const matchesCompany = companyFilter === "" || task.companyName === companyFilter
      const matchesModeOfCall = modeOfCallFilter === "" || task.modeOfCall === modeOfCallFilter
      const matchesTechnician = technicianFilter === "" || task.technicianName === technicianFilter
      const matchesTechUser = !techDisplayName || ((task.technicianName || "").toLowerCase().includes(techDisplayName.toLowerCase()))
      
      return matchesSearchTerm && matchesCompany && matchesModeOfCall && matchesTechnician && matchesTechUser
    }
  )

  const renderTableCell = (task, field, value) => {
    if (editingRow === task.id) {
      return (
        <td className="px-3 py-4 whitespace-nowrap">
          <input
            type="text"
            value={editedData[field] || value || ""}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </td>
      );
    }
    return (
      <td className="px-3 py-4 whitespace-nowrap text-sm">
        {value}
      </td>
    );
  };

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
            placeholder="Search across all fields (tasks, technicians, etc.)"
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
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-2 h-6 w-6 text-gray-400 hover:text-gray-600 flex items-center justify-center rounded-full hover:bg-gray-100"
              title="Clear search"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <select
          className="w-full sm:w-[160px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        >
          <option value="">All Companies</option>
          {getUniqueCompanyNames().map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>

        <select
          className="w-full sm:w-[140px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={modeOfCallFilter}
          onChange={(e) => setModeOfCallFilter(e.target.value)}
        >
          <option value="">All Modes</option>
          {getUniqueModeOfCalls().map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>

        <select
          className="w-full sm:w-[160px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={technicianFilter}
          onChange={(e) => setTechnicianFilter(e.target.value)}
        >
          <option value="">All Technicians</option>
          {getUniqueTechnicianNames().map((technician) => (
            <option key={technician} value={technician}>
              {technician}
            </option>
          ))}
        </select>
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
                    Edit
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Complaint Number
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Complaint Date
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
                    Observation Details
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
                {filteredTasks.map((task, index) => (
                  <tr key={task.complaintNo || index} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap">
                      {editingRow === task.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSubmitEdit(task)}
                            className="text-green-600 hover:text-green-800"
                            disabled={isSubmitting}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditRow(task)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </td>
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
                          setTechnicianName(task.technicianName || "")
                        }}
                      >
                        Update
                      </button>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.complaintNumber}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.complaintDate}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.head}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.companyName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.modeOfCall}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.idNumber}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.projectName}</td>
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
                    {renderTableCell(task, "technicianName", task.technicianName)}
                    {renderTableCell(task, "technicianContact", task.technicianContact)}
                    {renderTableCell(task, "assigneeName", task.assigneeName)}
                    {renderTableCell(task, "assigneeWhatsApp", task.assigneeWhatsApp)}
                    {renderTableCell(task, "location", task.location)}
                    {renderTableCell(task, "complaintDetails", task.complaintDetails)}
                    {renderTableCell(task, "expectedCompletionDate", task.expectedCompletionDate)}
                    {renderTableCell(task, "notesForTechnician", task.notesForTechnician)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Update Task: {selectedTaskData?.complaintNumber || selectedTask}</h3>
                    <div className="mt-4 max-h-[60vh] overflow-auto">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <label htmlFor="technicianName" className="block text-sm font-medium text-gray-700">
                            Technician Name *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="technicianName"
                              className="w-full border border-gray-300 rounded-md py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Type or select a technician"
                              value={technicianName}
                              onChange={(e) => setTechnicianName(e.target.value)}
                              onFocus={() => setShowTechnicianDropdown(true)}
                            />
                            {showTechnicianDropdown && (
                              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                                {technicianOptions.map((name, index) => (
                                  <div
                                    key={index}
                                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                                    onClick={() => handleTechnicianSelect(name)}
                                  >
                                    {name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

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
                            <option value="insurance">Insurance</option>
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