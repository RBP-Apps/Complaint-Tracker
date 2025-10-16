"use client"

import { useState, useEffect } from "react"

function ComplaintsTable() {
  const [complaints, setComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

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

  useEffect(() => {
    const fetchComplaints = async () => {
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
          const complaintData = []
          
          data.table.rows.slice(2).forEach((row, index) => {
            if (row.c) {
              const complaint = {
                // Column mappings (0-based index)
                timestamp: row.c[0]?.v || "", // Column A (0)
                complaintNo: row.c[1]?.v || "", // Column B (1)
                date: row.c[2] ? (row.c[2].f || formatDateString(row.c[2].v) || row.c[2].v) : "", // Column C (2)
                head: row.c[3]?.v || "", // Column D (3)
                companyName: row.c[4]?.v || "", // Column E (4)
                modeOfCall: row.c[5]?.v || "", // Column F (5)
                idNumber: row.c[6]?.v || "", // Column G (6)
                projectName: row.c[7]?.v || "", // Column H (7)
                complaintNumber: row.c[8]?.v || "", // Column I (8)
                complaintDate: row.c[9] ? (row.c[9].f || formatDateString(row.c[9].v) || row.c[9].v) : "", // Column J (9)
                beneficiaryName: row.c[10]?.v || "", // Column K (10)
                contactNumber: row.c[11]?.v || "", // Column L (11)
                village: row.c[12]?.v || "", // Column M (12)
                block: row.c[13]?.v || "", // Column N (13)
                district: row.c[14]?.v || "", // Column O (14)
                product: row.c[15]?.v || "", // Column P (15)
                make: row.c[16]?.v || "", // Column Q (16)
                systemVoltage: row.c[17]?.v || "", // Column R (17)
                rating: row.c[18]?.v || "", // Column S (18)
                qty: row.c[19]?.v || "", // Column T (19)
                acDc: row.c[20]?.v || "", // Column U (20)
                priority: row.c[21]?.v || "Normal", // Column V (21)
                insuranceType: row.c[22]?.v || "", // Column W (22)
                natureOfComplaint: row.c[23]?.v || "", // Column X (23)
                planned: row.c[24]?.v || "", // Column Y (24)
                actual: row.c[25]?.v || "", // Column Z (25)
                delay: row.c[26]?.v || "", // Column AA (26)
                technicianName: row.c[27]?.v || "", // Column AB (27)
                technicianContact: row.c[28]?.v || "", // Column AC (28)
                assigneeName: row.c[29]?.v || "", // Column AD (29)
                assigneeWhatsApp: row.c[30]?.v || "", // Column AE (30)
                location: row.c[31]?.v || "", // Column AF (31)
                complaintDetails: row.c[32]?.v || "", // Column AG (32)
                expectedCompletionDate: row.c[33] ? formatDateString(row.c[33].v) : "", // Column AH (33)
                notesForTechnician: row.c[34]?.v || "", // Column AI (34)
                planned2: row.c[35]?.v || "", // Column AJ (35)
                actual2: row.c[36]?.v || "", // Column AK (36)
                delay2: row.c[37]?.v || "", // Column AL (37)
                dateOfComplete: row.c[38] ? formatDateString(row.c[38].v) : "", // Column AM (38)
                trackerStatus: row.c[39]?.v || "", // Column AN (39)
                remarks: row.c[40]?.v || "", // Column AO (40)
                status: formatStatus(row.c[39]?.v || "In Progress")
              };
              
              complaintData.push(complaint)
            }
          })
          
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
  }, [])

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
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

 const filteredComplaints = complaints.filter((complaint) => {
  const search = searchTerm.toLowerCase();

  const matchesSearch =
    String(complaint.beneficiaryName || "").toLowerCase().includes(search) ||
    String(complaint.complaintNo || "").toLowerCase().includes(search) ||
    String(complaint.village || "").toLowerCase().includes(search) ||
    String(complaint.district || "").toLowerCase().includes(search) ||
    String(complaint.projectName || "").toLowerCase().includes(search) ||
    String(complaint.natureOfComplaint || "").toLowerCase().includes(search) ||
    String(complaint.complaintNumber || "").toLowerCase().includes(search) ||
    String(complaint.technicianName || "").toLowerCase().includes(search) ||
    String(complaint.complaintDetails || "").toLowerCase().includes(search);

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
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            className="w-full sm:w-[200px] px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Insurance">Insurance</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint No</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode of Call</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint Number</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiary Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Village</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Make</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System Voltage</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AC/DC</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance Type</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nature of Complaint</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planned</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delay</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician Contact</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee WhatsApp</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint Details</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Completion Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes for Technician</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planned 2</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual 2</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delay 2</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Complete</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracker Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.map((complaint, index) => (
                  <tr key={`complaint-${complaint.complaintNo}-${index}`} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.timestamp}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.complaintNo}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.date}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.head}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.companyName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.modeOfCall}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.idNumber}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.projectName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.complaintNumber}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.complaintDate}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.beneficiaryName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.contactNumber}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.village}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.block}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.district}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.product}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.make}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.systemVoltage}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.rating}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.qty}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.acDc}</td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.insuranceType}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.natureOfComplaint}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.planned}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.actual}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.delay}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.technicianName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.technicianContact}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.assigneeName}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.assigneeWhatsApp}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.location}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.complaintDetails}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.expectedCompletionDate}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.notesForTechnician}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.planned2}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.actual2}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.delay2}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.dateOfComplete}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.trackerStatus}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.remarks}</td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
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

      <div className="mt-6 text-xs text-gray-500 text-center">
        © {new Date().getFullYear()} Complaints Tracker. All rights reserved. | Powered By - Botivate
      </div>
    </div>
  )
}

export default ComplaintsTable