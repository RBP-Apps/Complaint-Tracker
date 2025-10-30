"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

function ComplaintsByDistrict() {
  const [data, setData] = useState(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const loggedInUser = localStorage.getItem('username')
    const loggedInRole = localStorage.getItem('userRole')
    
    console.log('ComplaintsByDistrict - Retrieved from localStorage:', { loggedInUser, loggedInRole })
    
    if (loggedInUser) {
      setUser(loggedInUser)
    }
    
    if (loggedInRole) {
      setUserRole(loggedInRole)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const sheetUrl =
          "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=FMS"
        const response = await fetch(sheetUrl)

        if (!response.ok) {
          throw new Error(`Failed to fetch sheet data: ${response.status} ${response.statusText}`)
        }

        const text = await response.text()

        const jsonStart = text.indexOf("{")
        const jsonEnd = text.lastIndexOf("}") + 1

        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error("Invalid response format from Google Sheets")
        }

        const jsonData = text.substring(jsonStart, jsonEnd)
        const parsedData = JSON.parse(jsonData)

        if (parsedData && parsedData.table && parsedData.table.rows) {
          // Skip the header rows (first row) - data starts from row 2
          setData(parsedData.table.rows.slice(2))
        } else {
          throw new Error("No data found in the sheet")
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Role-based filtering function
  const getFilteredDataByRole = () => {
    if (!data) return [];
    
    console.log('ComplaintsByDistrict - Filtering with user:', user, 'role:', userRole)
    
    // If no role is set, show all data
    if (!userRole) {
      console.log('ComplaintsByDistrict - No role set, showing all data')
      return data;
    }
    
    // If admin, show all data
    if (userRole.toLowerCase() === 'admin') {
      console.log('ComplaintsByDistrict - Admin user, showing all data')
      return data;
    }
    
    // If user role and has username, filter by technician name
    if (user) {
      console.log('ComplaintsByDistrict - User role, filtering by technician name:', user)
      const filtered = data.filter((row) => {
        // Column AB is technician name, in data array it's at row.c[19]
        const technicianName = row.c[19]?.v || "";
        const match = technicianName === user;
        return match;
      });
      console.log('ComplaintsByDistrict - Filtered data count:', filtered.length)
      return filtered;
    }
    
    // If user role but no username, show empty
    console.log('ComplaintsByDistrict - User role but no username, showing empty')
    return [];
  }

  // Process complaints by district from filtered data
  const processComplaintsByDistrict = () => {
    const filteredData = getFilteredDataByRole();
    
    if (!filteredData || filteredData.length === 0) return []

    const districtCounts = {}

    // Count complaints by district (column M, index 12)
    filteredData.forEach((row) => {
      if (row.c && row.c[12] && row.c[12].v) {
        const district = row.c[12].v

        if (!districtCounts[district]) {
          districtCounts[district] = { name: district, pending: 0, completed: 0 }
        }

        // Check if completed (columns AJ and AK, indices 35 and 36)
        if (row.c[35] && row.c[35].v) {
          // Column AJ has data
          if (row.c[36] && row.c[36].v) {
            // Column AK has data
            districtCounts[district].completed++
          } else {
            districtCounts[district].pending++
          }
        } else {
          districtCounts[district].pending++
        }
      }
    })

    // Convert to array format for chart
    return Object.values(districtCounts)
      .sort((a, b) => b.pending + b.completed - (a.pending + a.completed))
      .slice(0, 5) // Top 5 districts
  }

  const complaintsByDistrict = processComplaintsByDistrict()

  if (!isMounted) {
    return <div className="h-80 bg-gray-100 animate-pulse rounded-lg"></div>
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border-0 shadow-lg bg-white">
        <div className="pb-2 p-6">
          <h3 className="text-lg font-medium">Complaints by District</h3>
        </div>
        <div className="pt-0 px-6 pb-6">
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-400">Loading district data...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border-0 shadow-lg bg-white">
        <div className="pb-2 p-6">
          <h3 className="text-lg font-medium">Complaints by District</h3>
        </div>
        <div className="pt-0 px-6 pb-6">
          <div className="text-red-500">Error loading district data: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border-0 shadow-lg bg-white">
      <div className="pb-2 p-6">
        <h3 className="text-lg font-medium">Complaints by District</h3>
        {userRole && (
          <p className="text-xs text-gray-500 mt-1">
            Showing data for: {userRole === 'Admin' ? 'All Users' : user || 'Current User'}
          </p>
        )}
      </div>
      <div className="pt-0 px-6 pb-6">
        <div className="h-80">
          {complaintsByDistrict.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">No district data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={complaintsByDistrict}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="pending" stackId="a" fill="#93c5fd" name="Pending" />
                <Bar dataKey="completed" stackId="a" fill="#2563eb" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

export default ComplaintsByDistrict