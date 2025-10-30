"use client"

import { useState, useEffect } from "react"
import { Clock, CheckCircle, AlertTriangle, Check, ArrowUp, ArrowDown, Shield } from 'lucide-react'

function DashboardStats() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const loggedInUser = localStorage.getItem('username')
    const loggedInRole = localStorage.getItem('userRole')
    
    console.log('DashboardStats - Retrieved from localStorage:', { loggedInUser, loggedInRole })
    
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
        const sheetUrl = "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=FMS"
        const response = await fetch(sheetUrl)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch sheet data: ${response.status} ${response.statusText}`)
        }
        
        const text = await response.text()
        
        const jsonStart = text.indexOf('{')
        const jsonEnd = text.lastIndexOf('}') + 1
        
        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error("Invalid response format from Google Sheets")
        }
        
        const jsonData = text.substring(jsonStart, jsonEnd)
        const parsedData = JSON.parse(jsonData)
        
        if (parsedData && parsedData.table && parsedData.table.rows) {
          // Get parsedNumHeaders से actual header count
          const headerCount = parsedData.parsedNumHeaders || 0
          
          // Header rows को skip करें
          const rows = parsedData.table.rows.slice(headerCount)
          
          console.log('Raw sheet data:', rows)
          console.log('Header count:', headerCount)
          console.log('Data rows after removing headers:', rows.length)
          console.log('First data row sample:', rows[0])
          
          if (rows[0] && rows[0].c) {
            console.log('Row structure - total columns:', rows[0].c.length)
            // Print all column values to find the right ones
            rows[0].c.forEach((col, index) => {
              if (col && col.v !== null && col.v !== "") {
                console.log(`Column ${index} (${String.fromCharCode(65 + index)}):`, col.v)
              }
            })
          }
          setData(rows)
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
    
    console.log('DashboardStats - Filtering with user:', user, 'role:', userRole)
    
    // If admin, show all data
    if (userRole && userRole.toLowerCase() === 'admin') {
      console.log('DashboardStats - Admin user, showing all data')
      return data;
    }
    
    // If user role and has username, filter by technician name
    if (userRole && userRole.toLowerCase() !== 'admin' && user) {
      console.log('DashboardStats - User role, filtering by technician name:', user)
      const filtered = data.filter((row) => {
        // You need to find the correct technician column index
        const technicianName = row.c[19]?.v || "";
        const match = technicianName === user;
        return match;
      });
      console.log('DashboardStats - Filtered data count:', filtered.length)
      return filtered;
    }
    
    // If user role but no username, show empty
    if (userRole && userRole.toLowerCase() !== 'admin' && !user) {
      console.log('DashboardStats - User role but no username, showing empty')
      return [];
    }
    
    // Default: show all data (when no role is set)
    console.log('DashboardStats - No role set, showing all data')
    return data;
  }

  // Get filtered data based on role
  const filteredData = getFilteredDataByRole()

  // Calculate stats from filtered data
  const totalComplaints = filteredData ? filteredData.length : 0

  // For pending complaints, we need to find the correct column for "submitted date" 
  // Since AJ doesn't exist, let's use a different logic
  // Check if row has data (any meaningful data in key columns)
  const pendingComplaints = filteredData
    ? filteredData.filter(
        (row) => {
          const columnZ = row.c[25]?.v;  // Z column status
          
          // Check if this row has meaningful data (not all empty)
          const hasData = row.c.some(cell => cell && cell.v !== null && cell.v !== "");
          
          console.log('Pending check - hasData:', hasData, 'Z:', columnZ)
          
          // Show as pending if: has data AND (Z is null/empty OR Z is "Reject")
          const isPending = hasData && (!columnZ || columnZ === null || columnZ === "" || columnZ === "Reject");
          
          return isPending;
        }
      ).length
    : 0

  // For completed complaints
  const completedComplaints = filteredData
    ? filteredData.filter(
        (row) => {
          const columnZ = row.c[25]?.v;  // Z column status
          
          // Check if this row has meaningful data
          const hasData = row.c.some(cell => cell && cell.v !== null && cell.v !== "");
          
          console.log('Completed check - hasData:', hasData, 'Z:', columnZ)
          
          // Show as completed if: has data AND Z is "Approved"
          const isCompleted = hasData && columnZ === "Approved";
          
          return isCompleted;
        }
      ).length
    : 0

  console.log('Final stats:', { totalComplaints, pendingComplaints, completedComplaints })

  const stats = [
    {
      title: "Total Complaints",
      value: isLoading ? "-" : totalComplaints,
      change: "+12%",
      trend: "up",
      icon: Clock,
      color: "bg-blue-600",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Pending Complaints", 
      value: isLoading ? "-" : pendingComplaints,
      change: "-5%",
      trend: "down",
      icon: AlertTriangle,
      color: "bg-blue-600",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Completed Complaints",
      value: isLoading ? "-" : completedComplaints,
      change: "+18%",
      trend: "up",
      icon: CheckCircle,
      color: "bg-blue-600",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <div key={index} className="rounded-lg border-0 shadow-lg overflow-hidden bg-white">
          <div className={`${stat.color} rounded-t-lg p-4 text-white`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{stat.title}</h3>
              <div className="bg-white/20 p-2 rounded-full">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className={`p-6 ${stat.lightColor}`}>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold">{isLoading ? <span className="animate-pulse">...</span> : stat.value}</p>
              <div className={`flex items-center ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                {stat.trend === "up" ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                <span className="text-sm font-medium">{stat.change}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Compared to last month</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DashboardStats
