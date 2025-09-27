"use client"

import { useState, useEffect } from "react"
import { Clock, CheckCircle, AlertTriangle, Check, ArrowUp, ArrowDown, Shield } from 'lucide-react'

function DashboardStats() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Fetch the entire sheet using Google Sheets API directly
        const sheetUrl = "https://docs.google.com/spreadsheets/d/1Vn295WmY0o6qh03rYzpCISGfMgT5RViXdYyd_ZNQ2p8/gviz/tq?tqx=out:json&sheet=FMS"
        const response = await fetch(sheetUrl)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch sheet data: ${response.status} ${response.statusText}`)
        }
        
        const text = await response.text()
        
        // Extract the JSON part from the response
        const jsonStart = text.indexOf('{')
        const jsonEnd = text.lastIndexOf('}') + 1
        
        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error("Invalid response format from Google Sheets")
        }
        
        const jsonData = text.substring(jsonStart, jsonEnd)
        const parsedData = JSON.parse(jsonData)
        
        // Process the data
        if (parsedData && parsedData.table && parsedData.table.rows) {
          // Skip the header rows (first 5 rows) - this gives us data starting from row 6
          setData(parsedData.table.rows.slice(1))
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

  // Calculate stats from sheet data - all calculations now count data starting from row 6
  const totalComplaints = data ? data.length : 0

  // Pending complaints: column AJ is not null and column AK is null
  const pendingComplaints = data
    ? data.filter(
        (row) =>
          row.c[35] &&
          row.c[35].v !== null &&
          row.c[35].v !== "" &&
          (!row.c[36] || row.c[36].v === null || row.c[36].v === ""),
      ).length
    : 0

  // Completed complaints: both columns AJ and AK are not null
  const completedComplaints = data
    ? data.filter(
        (row) =>
          row.c[35] &&
          row.c[35].v !== null &&
          row.c[35].v !== "" &&
          row.c[36] &&
          row.c[36].v !== null &&
          row.c[36].v !== "",
      ).length
    : 0

  // Verified complaints: both columns 49 and 50 are not null (have values)
  const verifiedComplaints = data
    ? data.filter(
        (row) =>
          row.c[49] &&
          row.c[49].v !== null &&
          row.c[49].v !== "" &&
          row.c[50] &&
          row.c[50].v !== null &&
          row.c[50].v !== "",
      ).length
    : 0

  // Total Insurances: count rows where column 40 (index 39) has value "Inssurances"
  const totalInsurance = data
    ? data.filter(
        (row) =>
          row.c[39] &&
          row.c[39].v !== null &&
          row.c[39].v !== "" &&
          row.c[39].v === "Insurance"
      ).length
    : 0

  // Mock change percentages (in a real app, you'd calculate these from historical data)
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
    {
      title: "Total Insurance",
      value: isLoading ? "-" : totalInsurance,
      change: "+25%",
      trend: "up",
      icon: Shield,
      color: "bg-blue-600",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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