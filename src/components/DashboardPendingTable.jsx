"use client"

import { useState, useEffect } from "react"

function ComplaintsTable() {
  const [complaints, setComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)

  // localStorage useEffect - ADD THIS
  useEffect(() => {
    const loggedInUser = localStorage.getItem('username')
    const loggedInRole = localStorage.getItem('userRole')
    
    console.log('Retrieved from localStorage:', { loggedInUser, loggedInRole })
    
    if (loggedInUser) {
      setUser(loggedInUser)
    }
    
    if (loggedInRole) {
      setUserRole(loggedInRole)
    }
  }, []) // Empty dependency array

  // Data fetching useEffect - KEEP WORKING VERSION
  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const sheetUrl = "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=FMS"
        const response = await fetch(sheetUrl)
        const text = await response.text()
        
        const jsonStart = text.indexOf('{')
        const jsonEnd = text.lastIndexOf('}') + 1
        const jsonData = text.substring(jsonStart, jsonEnd)
        
        const data = JSON.parse(jsonData)
        
        if (data && data.table && data.table.rows) {
          const complaintData = []
          
          // Fix: Don't use parsedNumHeaders blindly
          console.log('Total rows:', data.table.rows.length)
          console.log('ParsedNumHeaders:', data.parsedNumHeaders)
          
          // Check first few rows to find actual data start
          console.log('Row 0 sample:', data.table.rows[0]?.c?.slice(0, 5))
          console.log('Row 1 sample:', data.table.rows[1]?.c?.slice(0, 5))
          
          // Start from row 0 (first row) since your data is actually there
          data.table.rows.forEach((row, index) => {
            if (row.c && row.c[1]?.v) { // Check if complaint ID exists
              console.log(`Processing row ${index}:`, {
                id: row.c[1]?.v,
                company: row.c[2]?.v,
                beneficiary: row.c[8]?.v
              })
              
              const complaint = {
                complaintId: row.c[1]?.v || "", // Column B (1) - Complaint ID
                companyName: row.c[2]?.v || "", // Column C (2) - Company Name
                modeOfCall: row.c[3]?.v || "", // Column D (3) - Mode of Call
                idNumber: row.c[4]?.v || "", // Column E (4) - ID Number
                projectName: row.c[5]?.v || "", // Column F (5) - Project Name
                complaintNumber: row.c[6]?.v || "", // Column G (6) - Complaint Number
                complaintDate: row.c[7] ? (row.c[7].f || formatDateString(row.c[7].v) || row.c[7].v) : "",
                beneficiaryName: row.c[8]?.v || "", // Column I (8) - Beneficiary Name
                contactNumber: row.c[9]?.v || "", // Column J (9) - Contact Number
                village: row.c[10]?.v || "", // Column K (10) - Village
                block: row.c[11]?.v || "", // Column L (11) - Block
                district: row.c[12]?.v || "", // Column M (12) - District
                product: row.c[13]?.v || "", // Column N (13) - Product
                make: row.c[14]?.v || "", // Column O (14) - Make
                rating: row.c[15]?.v || "", // Column P (15) - Rating
                qty: row.c[16]?.v || "", // Column Q (16) - Qty
                insuranceType: row.c[17]?.v || "", // Column R (17) - Insurance Type
                natureOfComplaint: row.c[18]?.v || "", // Column S (18) - Nature of Complaint
                technicianName: row.c[19]?.v || "", // Column T (19) - Technician Name
                technicianContact: row.c[20]?.v || "", // Column U (20) - Technician Contact
                assigneeWhatsApp: row.c[21]?.v || "", // Column V (21) - Assignee WhatsApp Number
               status: row.c[25]?.v ? row.c[25].v : "Open",

              };
              
              // Only add if complaint has valid data
              if (complaint.complaintId) {
                complaintData.push(complaint)
              }
            }
          })
          
          console.log('Final complaint data:', complaintData)
          setComplaints(complaintData)
        }
      } catch (err) {
        console.error("Error fetching complaints data:", err)
        setError(err.message)
        setComplaints([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchComplaints()
  }, []) // Empty dependency array

  const formatStatus = (statusValue) => {
    if (!statusValue) return "In Progress";
    
    const statusStr = String(statusValue);
    
    if (statusStr.includes("Completed") || statusStr.includes("COMPLETED")) {
      return "Completed";
    } else if (statusStr.includes("Progress") || 
               statusStr.includes("Date(") || 
               statusStr.includes("In Progress")) {
      return "In Progress";
    } else if (statusStr.includes("Insurance") || 
               statusStr.trim() === "") {
      return "Insurance";
    }
    
    return "In Progress"; 
  };

  const formatDateString = (dateValue) => {
    if (!dateValue) return "";
    
    let date;
    
    if (typeof dateValue === 'number' && dateValue > 40000) {
      const googleEpoch = new Date(1899, 11, 30);
      date = new Date(googleEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
    }
    else if (typeof dateValue === 'string' && dateValue.startsWith('Date(')) {
      const match = dateValue.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/);
      if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        const day = parseInt(match[3]);
        date = new Date(year, month, day);
      } else {
        return dateValue;
      }
    }
    else if (typeof dateValue === 'object' && dateValue.getDate) {
      date = dateValue;
    }
    else {
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
    const priorityStr = String(priority || "").toLowerCase();
    switch(priorityStr) {
      case "urgent": return "bg-red-500"
      case "high": return "bg-orange-500"
      case "medium": return "bg-blue-500"
      default: return "bg-green-500"
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case "Completed": return "bg-green-100 text-green-800 border border-green-200"
      case "In Progress": return "bg-blue-100 text-blue-800 border border-blue-200"
      case "Insurance": return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      default: return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }


  // Role-based filtering function
const getFilteredComplaintsByRole = () => {
  console.log('Current user:', user, 'Current role:', userRole) // Debug log
  
  let roleFilteredComplaints = complaints;

  // If no role is set, show all complaints
  if (!userRole) {
    console.log('No role set - showing all complaints') // Debug log
    return roleFilteredComplaints;
  }

  // If user is admin or user, show all complaints
  if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'user') {
    console.log('Admin/User role - showing all complaints') // Debug log
    return roleFilteredComplaints;
  }

  // If user is tech, filter by technician name
  if (userRole.toLowerCase() === 'tech') {
    if (user) {
      console.log('Tech role - filtering for user:', user) // Debug log
      roleFilteredComplaints = complaints.filter((complaint) => {
        const match = complaint.technicianName === user;
        console.log(`Comparing: "${complaint.technicianName}" === "${user}" = ${match}`) // Debug log
        return match;
      });
      console.log('Filtered complaints count:', roleFilteredComplaints.length) // Debug log
    } else {
      // Tech user with no username - show empty results
      console.log('Tech user with no username - showing no complaints') // Debug log
      roleFilteredComplaints = [];
    }
  }

  return roleFilteredComplaints;
}

  const filteredComplaints = getFilteredComplaintsByRole().filter((complaint) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      String(complaint.beneficiaryName || "").toLowerCase().includes(search) ||
      String(complaint.complaintId || "").toLowerCase().includes(search) ||
      String(complaint.village || "").toLowerCase().includes(search) ||
      String(complaint.district || "").toLowerCase().includes(search) ||
      String(complaint.projectName || "").toLowerCase().includes(search) ||
      String(complaint.natureOfComplaint || "").toLowerCase().includes(search) ||
      String(complaint.complaintNumber || "").toLowerCase().includes(search) ||
      String(complaint.technicianName || "").toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
        <h2 className="text-xl font-bold">
          Complaint Tracker
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({filteredComplaints.length} records)
          </span>
          {userRole && (
            <span className="ml-2 text-sm font-normal text-blue-600">
              Role: {userRole}
            </span>
          )}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            className="w-full sm:w-[200px] px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
           <option value="All">All Statuses</option>
<option value="Open">Open</option>
<option value="Approved">Approved</option>
<option value="Reject">Reject</option>

          </select>
          
          <div className="relative flex items-center">
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
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
         {filteredComplaints.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No complaints found matching your criteria</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            {filteredComplaints.map((complaint, index) => (
              <div key={`complaint-${complaint.complaintId}-${index}`} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{complaint.complaintId}</span>
                  <span className="text-xs px-2 py-1 rounded">{complaint.status}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Company</span>
                    <span className="text-gray-900 font-medium">{complaint.companyName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Complaint No</span>
                    <span className="text-gray-900">{complaint.complaintNumber}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-900">{complaint.complaintDate}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Beneficiary</span>
                    <span className="text-gray-900 font-medium">{complaint.beneficiaryName}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex-1">
                        <div className="text-gray-500 mb-0.5">Technician</div>
                        <div className="text-gray-900 font-medium">{complaint.technicianName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-500 mb-0.5">Contact</div>
                        <div className="text-gray-900">{complaint.technicianContact}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auto Complaint ID</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number </th>
            
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiary Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Village</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nature of Complaint</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.map((complaint, index) => (
                  <tr key={`complaint-${complaint.complaintId}-${index}`} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{complaint.complaintId}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.complaintDate}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.idNumber}</td>

                   
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.beneficiaryName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.contactNumber}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.village}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.block}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.district}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.projectName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.natureOfComplaint}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.technicianName}</td>
                    <td className="px-3 py-4 whitespace-nowrap">{complaint.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500 text-center">
        © {new Date().getFullYear()} Complaints Tracker. All rights reserved. | Powered By - Botivate
      </div>
    </div>
  )
}

export default ComplaintsTable
