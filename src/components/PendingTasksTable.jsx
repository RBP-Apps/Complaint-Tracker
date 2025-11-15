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
  const [showTechnicianDropdown, setShowTechnicianDropdown] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [editedData, setEditedData] = useState({})
  const [technicianOptions, setTechnicianOptions] = useState([])
  const [username, setUsername] = useState("")
  const [photoLocation, setPhotoLocation] = useState(null)
  const [isCapturingLocation, setIsCapturingLocation] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [user, setUser] = useState(null)
const [userRole, setUserRole] = useState(null)
// ✅ Empty array - data sheet se hi fetch hoga
const [trackerStatusOptions, setTrackerStatusOptions] = useState([]);

  
  // Form fields for tracker submission
  const [formData, setFormData] = useState({
    systemVoltage: "",
    natureOfComplaint: "",
    remarks: "",
    trackerStatus: ""
  })

useEffect(() => {
  const u = localStorage.getItem("username") || ""
  const loggedInRole = localStorage.getItem('userRole')
  
  console.log('TrackerPendingTable - Retrieved from localStorage:', { username: u, userRole: loggedInRole })
  
  setUsername(u)
  
  if (loggedInRole) {
    setUserRole(loggedInRole)
  }
}, [])

  const techDisplayName = (username || "").toLowerCase().startsWith("tech")
    ? (username || "").substring(4).trim()
    : ""

  const GOOGLE_SCRIPT_URL = "https://script.google.com/a/macros/rbpindia.com/s/AKfycbwnIMOzsFbniWnPFhl3lzE-2W0l6lD23keuz57-ldS_umSXIJqpEK-qxLE6eM0s7drqrQ/exec"
  const DRIVE_FOLDER_ID = "1-H5DWKRV2u_ueqtLX-ISTPvuySGYBLoT"

  // Location and address functions (from reference)
  const getFormattedAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.display_name) {
        return data.display_name;
      } else {
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
    } catch (error) {
      console.error("Error getting formatted address:", error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

          const formattedAddress = await getFormattedAddress(latitude, longitude);

          const locationInfo = {
            latitude,
            longitude,
            mapLink,
            formattedAddress,
            timestamp: new Date().toISOString(),
            accuracy: position.coords.accuracy,
          };

          resolve(locationInfo);
        },
        (error) => {
          const errorMessages = {
            1: "Location access denied. Please enable location services.",
            2: "Location information is unavailable.",
            3: "Location request timed out.",
          };
          reject(
            new Error(errorMessages[error.code] || "An unknown error occurred.")
          );
        },
        options
      );
    });
  };

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

// ✅ UPDATED: Call backend to generate unique serial number
const generateNextRBPSTId = async () => {
  try {
    console.log("🔄 Calling backend to generate unique serial number...")
    
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=generateUniqueSerialNo`, {
      method: 'POST'
    })
    
    const result = await response.json()
    console.log("📥 Backend response:", result)
    
    if (result.success && result.serialNo) {
      // ✅ Format: RBPT-002 (3 digits with leading zeros)
      const formattedSerial = result.serialNo.replace(/RBPST-(\d+)/, (match, num) => {
        return `RBPT-${String(num).padStart(3, '0')}`
      })
      console.log("✅ Generated unique Serial No:", formattedSerial)
      return formattedSerial
    } else {
      throw new Error(result.error || 'Failed to generate serial number from backend')
    }
    
  } catch (error) {
    console.error("❌ Error calling backend for serial number:", error)
    
    // Fallback: Generate timestamp-based unique ID
    const timestamp = Date.now().toString().slice(-3)
    const fallbackId = `RBPT-${timestamp.padStart(3, '0')}`
    console.log("⚠️ Using fallback timestamp-based ID:", fallbackId)
    return fallbackId
  }
}


  const getPriorityColor = (priority) => {
    const priorityStr = priority ? priority.toString().toLowerCase() : ""
    
    switch(priorityStr) {
      case "urgent": return "bg-red-500"
      case "high": return "bg-orange-500"
      case "medium": return "bg-blue-500"
      case "low": return "bg-green-500"
      case "1": return "bg-red-500"
      case "2": return "bg-orange-500"
      case "3": return "bg-blue-500"
      case "4": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

useEffect(() => {
  console.log('🚀 Component mounted - Starting data fetch...');
  
  const fetchTasks = async () => {
    console.log('🔄 fetchTasks function called');
    setIsLoading(true);
    setError(null);
    
    try {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=FMS`;
      console.log('📡 Fetching from URL:', sheetUrl);
      
      const response = await fetch(sheetUrl);
      console.log('📥 Response received:', response.status, response.ok);
      
      const text = await response.text();
      console.log('📄 Response text length:', text.length);
      
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonData = text.substring(jsonStart, jsonEnd);
      const data = JSON.parse(jsonData);
      
      console.log('📊 Data parsed successfully');
      console.log('📊 Total rows in sheet:', data?.table?.rows?.length || 0);
      console.log('📊 First row (headers):', data?.table?.rows?.[0]?.c?.map((col, idx) => `${idx}:${col?.v || 'empty'}`));
      
      if (data && data.table && data.table.rows) {
        const taskData = [];
        let skippedCount = 0;
        
        data.table.rows.forEach((row, index) => {
          if (row.c && index > 0) {
            const hasComplaintId = row.c[1] && row.c[1].v !== null && row.c[1].v !== "";
            // ✅ NEW CONDITION: Check Column Z (index 25) for "APPROVED-CLOSE"
            const columnZValue = row.c[25] ? row.c[25].v : "";
            const isNotApprovedClose = columnZValue !== "APPROVED-CLOSE";
            
            // ✅ LOG for debugging
            if (index >= 1 && index <= 20) {
              console.log(`Row ${index}:`, {
                complaintId: row.c[1]?.v || 'NO ID',
                hasComplaintId,
                columnZ: columnZValue || 'empty',
                isNotApprovedClose,
                willBeAdded: hasComplaintId && isNotApprovedClose
              });
            }
            
            // ✅ UPDATED CONDITION: Show in pending unless Column Z = "APPROVED-CLOSE"
            if (hasComplaintId && isNotApprovedClose) {
              console.log(`✅ ADDING to pending - Row ${index}:`, row.c[1].v);
              
              const task = {
                rowIndex: index + 1,
                complaintId: row.c[1] ? row.c[1].v : "",
                technicianName: row.c[19] ? row.c[19].v : "",
                technicianNumber: row.c[20] ? row.c[20].v : "",
                beneficiaryName: row.c[8] ? row.c[8].v : "",
                contactNumber: row.c[9] ? row.c[9].v : "",
                village: row.c[10] ? row.c[10].v : "",
                block: row.c[11] ? row.c[11].v : "",
                district: row.c[12] ? row.c[12].v : "",
                product: row.c[13] ? row.c[13].v : "",
                make: row.c[14] ? row.c[14].v : "",
                systemVoltage: row.c[16] ? row.c[16].v : "",
                natureOfComplaint: row.c[18] && row.c[18].v ? row.c[18].v.toString() : "",
                ContollerRIDNo: row.c[27] ? row.c[27].v : "",
                ProductSLNo: row.c[28] ? row.c[28].v : "",
                ChallanDate: row.c[29] ? formatDateString(row.c[29].v) : "",
                CloseDate: row.c[30] ? formatDateString(row.c[30].v) : "",
                timestamp: row.c[0] ? formatDateString(row.c[0].v) : "",
                date: row.c[7] ? formatDateString(row.c[7].v) : "",
                head: row.c[0] ? row.c[0].v : "",
                companyName: row.c[2] ? row.c[2].v : "",
                modeOfCall: row.c[3] ? row.c[3].v : "",
                priority: row.c[15] ? row.c[15].v : "",
                id: row.c[1] ? row.c[1].v : `COMP-${index + 1}`,
                fullRowData: row.c,
              };
              
              taskData.push(task);
            } else {
              skippedCount++;
            }
          }
        });
        
        console.log('✅ Pending tasks found:', taskData.length);
        console.log('⏭️ Rows skipped:', skippedCount);
        console.log('📋 Pending task IDs:', taskData.map(t => t.complaintId));
        console.log('📋 First 3 tasks:', taskData.slice(0, 3));
        
        setPendingTasks(taskData);
      } else {
        console.error('❌ Invalid data structure:', data);
      }
    } catch (err) {
      console.error('❌ Error fetching tasks data:', err);
      console.error('❌ Error stack:', err.stack);
      setError(err.message);
      setPendingTasks([]);
    } finally {
      setIsLoading(false);
      console.log('🏁 fetchTasks completed');
    }
  };

  const fetchTechnicianOptions = async () => {
    console.log('👥 Fetching technician options...');
    try {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=master`;
      const response = await fetch(sheetUrl);
      const text = await response.text();
      
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonData = text.substring(jsonStart, jsonEnd);
      const data = JSON.parse(jsonData);
      
      if (data && data.table && data.table.rows) {
        const options = data.table.rows.slice(2)
          .map(row => row.c[5]?.v)
          .filter(name => name && typeof name === 'string' && name.trim() !== '');
        console.log('👥 Technician options loaded:', options.length);
        setTechnicianOptions([...new Set(options)].sort());
      }
    } catch (err) {
      console.error('❌ Error fetching technician options:', err);
      setTechnicianOptions([]);
    }
  };

  fetchTasks();
  fetchTechnicianOptions();
  fetchTrackerStatusOptions();
}, []);



const fetchTrackerStatusOptions = async () => {
  try {
    const sheetUrl = `https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=master`;
    const response = await fetch(sheetUrl);
    const text = await response.text();
    
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonData = text.substring(jsonStart, jsonEnd);
    const data = JSON.parse(jsonData);
    
    if (data && data.table && data.table.rows) {
      // ✅ FIXED: .slice(1) instead of .slice(2) to include Row 2
      const statusOptions = data.table.rows
        // .slice(1) // Skip only header row (Row 1)
        .map(row => row.c[7]?.v) // Column H = index 7
        .filter(status => status && typeof status === 'string' && status.trim() !== '');
      
      console.log('✅ All Status Options from Column H:', statusOptions);
      
      // ✅ Remove duplicates
      const uniqueOptions = [...new Set(statusOptions)];
      
      console.log('✅ Unique Options:', uniqueOptions);
      
      // ✅ Create mapping
      const mappedOptions = uniqueOptions.map(status => {
        // If format is "Hindi | English"
        if (status.includes('|')) {
          const [label, value] = status.split('|').map(s => s.trim());
          return { 
            label, 
            value: value.toLowerCase().replace(/[^a-z0-9]/g, '') 
          };
        }
        // English text only - use as both label and value
        return { 
          label: status.trim(),
          value: status.trim().toLowerCase().replace(/[^a-z0-9]/g, '') 
        };
      });
      
      console.log('✅ Final Mapped Options:', mappedOptions);
      setTrackerStatusOptions(mappedOptions);
    }
  } catch (err) {
    console.error('❌ Error fetching tracker status options:', err);
  }
};




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

  // Image location overlay function (from reference)
  async function addLocationOverlayToImage(imageFile, latitude, longitude, address) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = img.width;
          canvas.height = img.height;

          ctx.drawImage(img, 0, 0);

          const minFontSize = 12;
          const maxFontSize = 24;
          
          const widthBasedSize = Math.floor(img.width / 25);
          const heightBasedSize = Math.floor(img.height / 15);
          const fontSize = Math.max(minFontSize, Math.min(maxFontSize, Math.min(widthBasedSize, heightBasedSize)));
          
          const lineHeight = fontSize + 6;
          const padding = Math.max(8, fontSize / 2);
          
          let numberOfLines = 2;
          if (address && address.trim() !== "") {
            numberOfLines = 3;
          }
          
          const calculatedHeight = (numberOfLines * lineHeight) + (2 * padding);
          const maxOverlayHeight = img.height * 0.5;
          const overlayHeight = Math.min(calculatedHeight, maxOverlayHeight);
          
          ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
          ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);

          ctx.fillStyle = "#fff";
          ctx.font = `bold ${fontSize}px Arial`;
          
          const textX = padding;
          let textY = canvas.height - overlayHeight + padding + fontSize;

          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;

          const latText = `Lat: ${latitude.toFixed(6)}`;
          ctx.fillText(latText, textX, textY);
          textY += lineHeight;

          const lngText = `Lng: ${longitude.toFixed(6)}`;
          ctx.fillText(lngText, textX, textY);
          
          if (address && address.trim() !== "" && numberOfLines === 3) {
            textY += lineHeight;
            
            let displayAddress = address;
            const maxTextWidth = canvas.width - (2 * padding);
            
            if (ctx.measureText(displayAddress).width > maxTextWidth) {
              while (displayAddress.length > 5 && ctx.measureText(displayAddress + "...").width > maxTextWidth) {
                displayAddress = displayAddress.substring(0, displayAddress.length - 1);
              }
              displayAddress = displayAddress + "...";
            }
            
            ctx.fillText(displayAddress, textX, textY);
          }

          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], imageFile.name, { type: "image/jpeg" }));
            } else {
              reject(new Error("Failed to create blob"));
            }
          }, "image/jpeg", 0.9);

        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  }

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
      
      // Generate RBPST ID
      const serialNo = await generateNextRBPSTId();
      
      // Submit to Tracker sheet
      await submitToTrackerSheet(task, serialNo, documentUrl, photoUrl);
      
      // Remove from pending tasks if completed
      if (formData.trackerStatus === "completed") {
        setPendingTasks(prev => 
          prev.filter(task => task.id !== selectedTask)
        );
      }
      
      alert(`Task ${selectedTask} has been updated successfully to Tracker sheet.`);
      setIsDialogOpen(false);
      resetForm();
      
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Failed to update task: " + err.message);
    } finally {
      setIsSubmitting(false);
      setUploadStatus("");
    }
  };

 const submitToTrackerSheet = async (task, serialNo, documentUrl, photoUrl) => {
  try {
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('sheetName', 'Tracker');
    formDataToSubmit.append('action', 'insert');
    
    // ✅ Format timestamp as DD/MM/YYYY HH:MM:SS
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    
    // Get location data
    const latitude = photoLocation ? photoLocation.latitude : "";
    const longitude = photoLocation ? photoLocation.longitude : "";
    const address = photoLocation ? photoLocation.formattedAddress : "";
    
    // Prepare row data for Tracker sheet (columns A to U)
    const trackerRow = [
      timestamp,                      // Column A - Timestamp (DD/MM/YYYY HH:MM:SS)
      serialNo,                       // Column B - Serial No (RBPT-002 format)
      task.complaintId,               // Column C - Complaint Id
      task.technicianName,            // Column D - Technician Name 
      task.technicianNumber,          // Column E - Technician Number 
      task.beneficiaryName,           // Column F - Beneficiary Name
      task.contactNumber,             // Column G - Contact Number
      task.village,                   // Column H - Village
      task.block,                     // Column I - Block
      task.district,                  // Column J - District
      task.product,                   // Column K - Product
      task.make,                      // Column L - Make                       
      formData.systemVoltage,         // Column M - System Voltage
      formData.natureOfComplaint,     // Column N - Nature Of Complaint
      documentUrl || "",              // Column O - Upload Documents
      photoUrl || "",                 // Column P - Geotag Photo
      formData.remarks,               // Column Q - Remarks
      formData.trackerStatus,         // Column R - Tracker Status
      latitude,                       // Column S - Latitude
      longitude,                      // Column T - Longitude
      address                         // Column U - Address
    ];
    
    formDataToSubmit.append('rowData', JSON.stringify(trackerRow));
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formDataToSubmit
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to submit to Tracker sheet');
    }
    
    return true;
  } catch (error) {
    console.error("Error submitting to Tracker sheet:", error);
    throw error;
  }
};

  const handleDocumentChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedDocument(e.target.files[0]);
    }
  };
  
  const handlePhotoChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      setIsCapturingLocation(true);
      setLocationError(null);

      try {
        const location = await getCurrentLocation();
        setPhotoLocation(location);
        console.log("📍 Location captured:", location);

        const processedPhoto = await addLocationOverlayToImage(
          file,
          location.latitude,
          location.longitude,
          location.formattedAddress
        );

        setUploadedPhoto(processedPhoto);
        setIsCapturingLocation(false);
        
        console.log("✅ Image updated with overlay text");

      } catch (error) {
        console.error("Location error:", error);
        setLocationError(error.message);
        setIsCapturingLocation(false);
        setUploadedPhoto(file);
      }
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      systemVoltage: "",
      // natureOfComplaint: "",
      remarks: "",
      trackerStatus: "pending"
    });
    setUploadedDocument(null);
    setUploadedPhoto(null);
    setDate(null);
    setPhotoLocation(null);
    setLocationError(null);
    setIsCapturingLocation(false);
  };

// ✅ FIXED handleTaskSelection function
const handleTaskSelection = (task) => {
  console.log('Selected task data:', task);
  console.log('natureOfComplaint from task:', task.natureOfComplaint);
  
  setSelectedTask(task.id);
  setSelectedTaskData(task);
  setIsDialogOpen(true);
  
  // ✅ Pre-fill form with task data including natureOfComplaint
  setFormData(prevData => ({
    ...prevData,
    systemVoltage: task.systemVoltage || "",
    natureOfComplaint: task.natureOfComplaint || "", // ✅ Set from task data
    remarks: "",
    trackerStatus: "pending"
  }));
  
  console.log('FormData after setting:', {
    systemVoltage: task.systemVoltage,
    natureOfComplaint: task.natureOfComplaint
  });
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
  


// Role-based filtering function
const getFilteredTasksByRole = () => {
  console.log('TrackerPendingTable - Filtering with user:', username, 'role:', userRole)
  
  // If no role is set, show all tasks
  if (!userRole) {
    console.log('TrackerPendingTable - No role set, showing all tasks')
    return pendingTasks;
  }
  
  // If admin or user, show all tasks
  if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'user') {
    console.log('TrackerPendingTable - Admin/User role, showing all tasks')
    return pendingTasks;
  }
  
  // If tech role and has username, filter by technician name
  if (userRole.toLowerCase() === 'tech' && username) {
    console.log('TrackerPendingTable - Tech role, filtering by technician name:', username)
    const filtered = pendingTasks.filter((task) => {
      const match = task.technicianName === username;
      return match;
    });
    console.log('TrackerPendingTable - Filtered tasks count:', filtered.length)
    return filtered;
  }
  
  // If tech role but no username, show empty
  if (userRole.toLowerCase() === 'tech' && !username) {
    console.log('TrackerPendingTable - Tech role but no username, showing empty')
    return [];
  }
  
  // Default: show all tasks
  console.log('TrackerPendingTable - Default, showing all tasks')
  return pendingTasks;
}



  const filteredTasks = getFilteredTasksByRole().filter(
  (task) => {
    const searchFields = [
      task.complaintId,
      task.technicianName,
      task.beneficiaryName,
      task.contactNumber,
      task.village,
      task.block,
      task.district,
      task.product,
      task.make,
      task.companyName,
      task.modeOfCall
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
    
    return matchesSearchTerm && matchesCompany && matchesModeOfCall && matchesTechnician
  }
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
        <h1 className="text-sm font-bold">Tracker Pending Tasks</h1>

        
        <div className="relative">
          <input
            type="search"
            placeholder="Search across all fields..."
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
      <>
        {/* Mobile Card View */}
        <div className="block md:hidden space-y-3">
          {filteredTasks.map((task, index) => (
            <div key={task.complaintId || index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{task.complaintId}</span>
                {task.priority && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Beneficiary</span>
                  <span className="text-gray-900 font-medium">{task.beneficiaryName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Contact</span>
                  <span className="text-gray-900">{task.contactNumber}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Village</span>
                  <span className="text-gray-900">{task.village}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Block</span>
                  <span className="text-gray-900">{task.block}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">District</span>
                  <span className="text-gray-900">{task.district}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Product</span>
                  <span className="text-gray-900 font-medium">{task.product}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <button
                    className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 border-0 py-2 px-3 rounded-md text-sm font-medium"
                    onClick={() => handleTaskSelection(task)}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

       {/* Desktop Table View */}
<div className="hidden md:block overflow-x-auto">
  <div className="max-h-[600px] overflow-y-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-100 sticky top-0 z-10">
        <tr>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
            Actions
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
            Auto Complaint ID
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
            Beneficiary Name
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
            Contact Number
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
            Village
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
            Block
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
            District
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
            Product
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
            Rating  
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">Contoller RID No.</th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">Product SL No.</th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">Challan Date </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">Close Date</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredTasks.map((task, index) => (
          <tr key={task.complaintId || index} className="hover:bg-gray-50">
            <td className="px-3 py-4 whitespace-nowrap">
              <button
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 border-0 py-1 px-3 rounded-md"
                onClick={() => handleTaskSelection(task)}
              >
                Update
              </button>
            </td>
            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">{task.complaintId}</td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">{task.beneficiaryName}</td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">{task.contactNumber}</td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">{task.village}</td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">{task.block}</td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">{task.district}</td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">{task.product}</td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">
              {task.priority && (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              )}
            </td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">{task.ContollerRIDNo}</td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">{task.ProductSLNo}</td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">{task.ChallanDate}</td>
            <td className="px-3 py-4 whitespace-nowrap text-sm">{task.CloseDate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
      </>
    )}
  </div>
</div>

    {isDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsDialogOpen(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                   
                    
                   {selectedTaskData && (
  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
    
    <div className="grid grid-cols-2 gap-4">
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">शिकायत आईडी</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 text-gray-600"
          value={selectedTaskData.complaintId}
          readOnly
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">तकनीशियन का नाम</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 text-gray-600"
          value={selectedTaskData.technicianName}
          readOnly
        />
      </div>

     

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">लाभार्थी का नाम</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 text-gray-600"
          value={selectedTaskData.beneficiaryName}
          readOnly
        />
      </div>

   

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">गाँव</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 text-gray-600"
          value={selectedTaskData.village}
          readOnly
        />
      </div>

     

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">जिला</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 text-gray-600"
          value={selectedTaskData.district}
          readOnly
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">उत्पाद</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-100 text-gray-600"
          value={selectedTaskData.product}
          readOnly
        />
      </div>


    </div>
  </div>
)}

                    
                    <div className="mt-4 max-h-[60vh] overflow-auto">
                      <h4 className="font-medium text-gray-700 mb-4">ट्रैकर फॉर्म फील्ड्स</h4>
                      <div className="grid gap-4">
                        
                        {/* <div className="space-y-2">
                          <label htmlFor="systemVoltage" className="block text-sm font-medium text-gray-700">
                            सिस्टम वोल्टेज
                          </label>
                          <input
                            type="text"
                            id="systemVoltage"
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.systemVoltage}
                            onChange={(e) => handleFormChange('systemVoltage', e.target.value)}
                            placeholder="सिस्टम वोल्टेज दर्ज करें"
                          />
                        </div> */}

                       <div className="space-y-2">
  <label htmlFor="trackerStatus" className="block text-sm font-medium text-gray-700">
    ट्रैकर स्थिति (Tracker Status)
  </label>
  <select
    id="trackerStatus"
    name="trackerStatus"
    value={formData.trackerStatus}
    onChange={(e) => handleFormChange("trackerStatus", e.target.value)}
    required
    className="w-full border border-gray-300 rounded-md py-2 px-3"
  >
    <option value="">Select Status</option>
    {trackerStatusOptions.map((option, index) => (
      <option key={index} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
</div>


                      {/* Nature of Complaint - Auto-filled from FMS, Read Only */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    शिकायत की प्रकृति (Auto-filled from FMS)
  </label>
  <textarea
    name="natureOfComplaint"
    value={formData.natureOfComplaint}
    readOnly
    rows={4}
    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
    placeholder="Auto-filled from FMS data..."
  />
</div>


                        <div className="space-y-2">
                          <label htmlFor="documents" className="block text-sm font-medium text-gray-700">
                            दस्तावेज़ अपलोड करें
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
                              चयनित: {uploadedDocument.name}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="geotagPhoto" className="block text-sm font-medium text-gray-700">
                            जियोटैग फोटो
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              id="geotagPhoto"
                              type="file"
                              accept="image/*"
                              capture="environment"
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
                              ✓ चयनित: {uploadedPhoto.name}
                            </div>
                          )}
                          
                          {isCapturingLocation && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Loader className="h-4 w-4 animate-spin" />
                              स्थान कैप्चर किया जा रहा है...
                            </div>
                          )}
                          
                          {photoLocation && !isCapturingLocation && (
                            <div className="text-sm text-green-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                स्थान सफलतापूर्वक कैप्चर किया गया
                              </div>
                              <div className="text-xs text-gray-600 ml-6">
                                📍 अक्षांश: {photoLocation.latitude.toFixed(6)}, 
                                देशांतर: {photoLocation.longitude.toFixed(6)}
                              </div>
                              <div className="text-xs text-gray-500 ml-6 truncate">
                                📌 {photoLocation.formattedAddress}
                              </div>
                            </div>
                          )}
                          
                          {locationError && !isCapturingLocation && (
                            <div className="text-sm text-amber-600">
                              ⚠️ स्थान उपलब्ध नहीं है: {locationError}
                              <div className="text-xs text-gray-600 mt-1">
                                फोटो बिना स्थान डेटा के अपलोड की जाएगी
                              </div>
                            </div>
                          )}
                        </div>

                      <div className="space-y-2">
  <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
    की गई कार्रवाई
  </label>
  <textarea
    id="remarks"
    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
    rows="3"
    value={formData.remarks}
    onChange={(e) => handleFormChange('remarks', e.target.value)}
    placeholder="की गई कार्रवाई दर्ज करें"
  />
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
                        रद्द करें
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
                            सहेजा जा रहा है...
                          </>
                        ) : (
                          "परिवर्तन सहेजें"
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

