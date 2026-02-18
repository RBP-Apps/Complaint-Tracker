// "use client"

// import { useState, useEffect } from "react"
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// function ComplaintsByDistrict() {
//   const [data, setData] = useState(null)
//   const [isMounted, setIsMounted] = useState(false)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [user, setUser] = useState(null)
//   const [userRole, setUserRole] = useState(null)

//   useEffect(() => {
//     setIsMounted(true)
//   }, [])

//   useEffect(() => {
//     const loggedInUser = localStorage.getItem('username')
//     const loggedInRole = localStorage.getItem('userRole')

//     console.log('ComplaintsByDistrict - Retrieved from localStorage:', { loggedInUser, loggedInRole })

//     if (loggedInUser) {
//       setUser(loggedInUser)
//     }

//     if (loggedInRole) {
//       setUserRole(loggedInRole)
//     }
//   }, [])

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true)
//         const sheetUrl =
//           "https://docs.google.com/spreadsheets/d/1VH0Wa4zOM77A1cYF7TZB9DBpVDbeFwdRPI9OS26CdL8/gviz/tq?tqx=out:json&sheet=FMS"
//         const response = await fetch(sheetUrl)

//         if (!response.ok) {
//           throw new Error(`Failed to fetch sheet data: ${response.status} ${response.statusText}`)
//         }

//         const text = await response.text()

//         const jsonStart = text.indexOf("{")
//         const jsonEnd = text.lastIndexOf("}") + 1

//         if (jsonStart === -1 || jsonEnd === 0) {
//           throw new Error("Invalid response format from Google Sheets")
//         }

//         const jsonData = text.substring(jsonStart, jsonEnd)
//         const parsedData = JSON.parse(jsonData)

//         if (parsedData && parsedData.table && parsedData.table.rows) {
//           // Skip the header rows (first row) - data starts from row 2
//           setData(parsedData.table.rows.slice(2))
//         } else {
//           throw new Error("No data found in the sheet")
//         }
//       } catch (err) {
//         console.error("Error fetching data:", err)
//         setError(err.message)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchData()
//   }, [])

//   // Role-based filtering function
//   const getFilteredDataByRole = () => {
//     if (!data) return [];

//     console.log('ComplaintsByDistrict - Filtering with user:', user, 'role:', userRole)

//     // If no role is set, show all data
//     if (!userRole) {
//       console.log('ComplaintsByDistrict - No role set, showing all data')
//       return data;
//     }

//     // If admin, show all data
//     if (userRole.toLowerCase() === 'admin') {
//       console.log('ComplaintsByDistrict - Admin user, showing all data')
//       return data;
//     }

//     // If user role and has username, filter by technician name
//     if (user) {
//       console.log('ComplaintsByDistrict - User role, filtering by technician name:', user)
//       const filtered = data.filter((row) => {
//         // Column AB is technician name, in data array it's at row.c[19]
//         const technicianName = row.c[19]?.v || "";
//         const match = technicianName === user;
//         return match;
//       });
//       console.log('ComplaintsByDistrict - Filtered data count:', filtered.length)
//       return filtered;
//     }

//     // If user role but no username, show empty
//     console.log('ComplaintsByDistrict - User role but no username, showing empty')
//     return [];
//   }

//   // Process complaints by district from filtered data
//   const processComplaintsByDistrict = () => {
//     const filteredData = getFilteredDataByRole();

//     if (!filteredData || filteredData.length === 0) return []

//     const districtCounts = {}

//     // Count complaints by district (column M, index 12)
//     filteredData.forEach((row) => {
//       if (row.c && row.c[12] && row.c[12].v) {
//         const district = row.c[12].v

//         if (!districtCounts[district]) {
//           districtCounts[district] = { name: district, pending: 0, completed: 0 }
//         }

//         // Check if completed (columns AJ and AK, indices 35 and 36)
//         if (row.c[35] && row.c[35].v) {
//           // Column AJ has data
//           if (row.c[36] && row.c[36].v) {
//             // Column AK has data
//             districtCounts[district].completed++
//           } else {
//             districtCounts[district].pending++
//           }
//         } else {
//           districtCounts[district].pending++
//         }
//       }
//     })

//     // Convert to array format for chart
//     return Object.values(districtCounts)
//       .sort((a, b) => b.pending + b.completed - (a.pending + a.completed))
//       .slice(0, 5) // Top 5 districts
//   }

//   const complaintsByDistrict = processComplaintsByDistrict()

//   if (!isMounted) {
//     return <div className="h-80 bg-gray-100 animate-pulse rounded-lg"></div>
//   }

//   if (isLoading) {
//     return (
//       <div className="rounded-lg border-0 shadow-lg bg-white">
//         <div className="pb-2 p-6">
//           <h3 className="text-lg font-medium">Complaints by District</h3>
//         </div>
//         <div className="pt-0 px-6 pb-6">
//           <div className="h-80 flex items-center justify-center">
//             <div className="text-gray-400">Loading district data...</div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="rounded-lg border-0 shadow-lg bg-white">
//         <div className="pb-2 p-6">
//           <h3 className="text-lg font-medium">Complaints by District</h3>
//         </div>
//         <div className="pt-0 px-6 pb-6">
//           <div className="text-red-500">Error loading district data: {error}</div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="rounded-lg border-0 shadow-lg bg-white">
//       <div className="pb-2 p-6">
//         <h3 className="text-lg font-medium">Complaints by District</h3>
//         {userRole && (
//           <p className="text-xs text-gray-500 mt-1">
//             Showing data for: {userRole === 'Admin' ? 'All Users' : user || 'Current User'}
//           </p>
//         )}
//       </div>
//       <div className="pt-0 px-6 pb-6">
//         <div className="h-80">
//           {complaintsByDistrict.length === 0 ? (
//             <div className="flex items-center justify-center h-full text-gray-500">No district data available</div>
//           ) : (
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={complaintsByDistrict}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//                 layout="vertical"
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis type="number" />
//                 <YAxis dataKey="name" type="category" width={120} />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="pending" stackId="a" fill="#93c5fd" name="Pending" />
//                 <Bar dataKey="completed" stackId="a" fill="#2563eb" name="Completed" />
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ComplaintsByDistrict




"use client"

import { useState, useEffect, useMemo } from "react"

function ComplaintsByRegion() {
  const [complaints, setComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const loggedInUser = localStorage.getItem("username")
    const loggedInRole = localStorage.getItem("userRole")
    if (loggedInUser) setUser(loggedInUser)
    if (loggedInRole) setUserRole(loggedInRole)
  }, [])

  const formatDateString = (dateValue) => {
    if (!dateValue) return ""
    let date
    if (typeof dateValue === "number" && dateValue > 40000) {
      const googleEpoch = new Date(1899, 11, 30)
      date = new Date(googleEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000)
    } else if (typeof dateValue === "string" && dateValue.startsWith("Date(")) {
      const match = dateValue.match(
        /Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/
      )
      if (match) {
        const year = parseInt(match[1])
        const month = parseInt(match[2])
        const day = parseInt(match[3])
        date = new Date(year, month, day)
      } else {
        return dateValue
      }
    } else if (typeof dateValue === "object" && dateValue && dateValue.getDate) {
      date = dateValue
    } else {
      return dateValue
    }
    if (!date || isNaN(date.getTime())) return dateValue
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const sheetUrl =
          "https://docs.google.com/spreadsheets/d/1VH0Wa4zOM77A1cYF7TZB9DBpVDbeFwdRPI9OS26CdL8/gviz/tq?tqx=out:json&sheet=FMS"
        const response = await fetch(sheetUrl)
        const text = await response.text()
        const jsonStart = text.indexOf("{")
        const jsonEnd = text.lastIndexOf("}") + 1
        const jsonData = text.substring(jsonStart, jsonEnd)
        const data = JSON.parse(jsonData)

        if (data && data.table && data.table.rows) {
          const complaintData = []
          data.table.rows.forEach((row) => {
            if (row.c && row.c[1] && row.c[1].v) {
              const complaint = {
                complaintId: row.c[1]?.v || "",
                companyName: row.c[2]?.v || "",
                modeOfCall: row.c[3]?.v || "",
                idNumber: row.c[4]?.v || "",
                projectName: row.c[5]?.v || "",
                complaintNumber: row.c[6]?.v || "",
                complaintDate: row.c[7]
                  ? row.c[7].f || formatDateString(row.c[7].v) || row.c[7].v
                  : "",
                beneficiaryName: row.c[8]?.v || "",
                contactNumber: row.c[9]?.v || "",
                village: row.c[10]?.v || "",
                block: row.c[11]?.v || "",
                district: row.c[12]?.v || "",
                product: row.c[13]?.v || "",
                make: row.c[14]?.v || "",
                rating: row.c[15]?.v || "",
                qty: row.c[16]?.v || "",
                insuranceType: row.c[17]?.v || "",
                natureOfComplaint: row.c[18]?.v || "",
                technicianName: row.c[19]?.v || "",
                technicianContact: row.c[20]?.v || "",
                assigneeWhatsApp: row.c[21]?.v || "",
                status: row.c[25] && row.c[25].v ? row.c[25].v : "Open",
                closeDate:
                  row.c[25] &&
                    row.c[25].v === "APPROVED-CLOSE" &&
                    row.c[23] &&
                    row.c[23].v
                    ? row.c[23].f ||
                    formatDateString(row.c[23].v) ||
                    row.c[23].v
                    : "",
              }
              if (complaint.complaintId) complaintData.push(complaint)
            }
          })
          setComplaints(complaintData)
        }
      } catch (err) {
        console.error("Error fetching complaints data:", err)
        setError(err.message || "Error")
        setComplaints([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchComplaints()
  }, [])

  const getFilteredComplaintsByRole = () => {
    let roleFilteredComplaints = complaints
    if (!userRole) return roleFilteredComplaints
    const roleLower = userRole.toLowerCase()
    if (roleLower === "admin" || roleLower === "user") return roleFilteredComplaints
    if (roleLower === "tech") {
      if (user) {
        roleFilteredComplaints = complaints.filter(
          (complaint) => complaint.technicianName === user
        )
      } else {
        roleFilteredComplaints = []
      }
    }
    return roleFilteredComplaints
  }

  const filteredComplaints = getFilteredComplaintsByRole().filter(
    (complaint) => {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        String(complaint.beneficiaryName || "")
          .toLowerCase()
          .includes(search) ||
        String(complaint.complaintId || "").toLowerCase().includes(search) ||
        String(complaint.village || "").toLowerCase().includes(search) ||
        String(complaint.district || "").toLowerCase().includes(search) ||
        String(complaint.projectName || "").toLowerCase().includes(search) ||
        String(complaint.natureOfComplaint || "").toLowerCase().includes(
          search
        ) ||
        String(complaint.complaintNumber || "").toLowerCase().includes(
          search
        ) ||
        String(complaint.technicianName || "").toLowerCase().includes(search)

      return matchesSearch
    }
  )

  const districtSummary = useMemo(() => {
    const map = new Map()

    filteredComplaints.forEach((c) => {
      const key = c.district || "UNKNOWN"
      if (!map.has(key)) {
        map.set(key, {
          district: key,
          total: 0,
          resolved: 0,
          pending: 0,
        })
      }
      const entry = map.get(key)
      entry.total += 1

      const s = String(c.status || "").toUpperCase()
      if (s.includes("APPROVED-CLOSE") || s.includes("COMPLETED")) {
        entry.resolved += 1
      } else {
        entry.pending += 1
      }
    })

    return Array.from(map.values()).sort((a, b) =>
      a.district.localeCompare(b.district)
    )
  }, [filteredComplaints])

  const grandTotals = useMemo(() => {
    return districtSummary.reduce(
      (acc, d) => {
        acc.total += d.total
        acc.resolved += d.resolved
        acc.pending += d.pending
        return acc
      },
      { total: 0, resolved: 0, pending: 0 }
    )
  }, [districtSummary])

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
      {/* HEADER */}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* DISTRICT DASHBOARD - STICKY HEADER */}
      <div className="mb-2 max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg">
        <div className="flex items-center bg-blue-50 px-4 py-2 text-xs font-semibold text-gray-600 sticky top-0 z-10">
          <div className="w-6 text-center">✓</div>
          <div className="flex-1">District</div>
          <div className="w-24 text-center">Total Complaint</div>
          <div className="w-24 text-center">Resolved</div>
          <div className="w-24 text-center">Pending</div>
        </div>

        <div className="divide-y divide-gray-100">
          {districtSummary.map((d) => (
            <div
              key={d.district}
              className="flex items-center px-4 py-2 hover:bg-gray-50 text-sm"
            >
              <div className="w-6 text-center">
                <input type="checkbox" className="h-4 w-4" checked readOnly />
              </div>
              <div className="flex-1 font-semibold text-gray-700">
                {d.district}
              </div>
              <div className="w-24 text-center">
                <span className="inline-flex items-center justify-center min-w-[32px] rounded-full bg-gray-200 text-xs font-bold text-gray-700 px-2 py-0.5">
                  {d.total}
                </span>
              </div>
              <div className="w-24 text-center">
                <span className="inline-flex items-center justify-center min-w-[32px] rounded-full bg-green-500 text-xs font-bold text-white px-2 py-0.5">
                  {d.resolved}
                </span>
              </div>
              <div className="w-24 text-center">
                <span className="inline-flex items-center justify-center min-w-[32px] rounded-full bg-orange-400 text-xs font-bold text-white px-2 py-0.5">
                  {d.pending}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOTAL BAR */}
      <div className="mt-2 flex items-center border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 overflow-hidden">
        <div className="flex-1 px-4 py-2 flex items-center gap-2">
          <span>Total Complaint</span>
          <span className="inline-flex items-center justify-center min-w-[40px] rounded-full bg-red-500 text-white px-2 py-0.5">
            {grandTotals.total}
          </span>
        </div>
        <div className="flex-1 px-4 py-2 flex items-center gap-2 justify-center border-l border-gray-200">
          <span>Closed Complaint</span>
          <span className="inline-flex items-center justify-center min-w-[40px] rounded-full bg-green-500 text-white px-2 py-0.5">
            {grandTotals.resolved}
          </span>
        </div>
        <div className="flex-1 px-4 py-2 flex items-center gap-2 justify-end border-l border-gray-200">
          <span>Pending Complaint</span>
          <span className="inline-flex items-center justify-center min-w-[40px] rounded-full bg-yellow-400 text-white px-2 py-0.5">
            {grandTotals.pending}
          </span>
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500 text-center">
        © {new Date().getFullYear()} Complaints Tracker. All rights reserved. |
        Powered By - Botivate
      </div>
    </div>
  )
}

export default ComplaintsByRegion
