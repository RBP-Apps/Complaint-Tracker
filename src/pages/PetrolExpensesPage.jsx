"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../components/DashboardLayout"
import { Plus, X, Calendar, User, Navigation, FileText, Loader, Search } from "react-feather"

function PetrolExpensesPage() {
  const [showForm, setShowForm] = useState(false)
  const [expenses, setExpenses] = useState([])
  const [filteredExpenses, setFilteredExpenses] = useState([]) // For filtered results
  const [searchQuery, setSearchQuery] = useState("") // Search query state
  const [formData, setFormData] = useState({
    date: "",
    technicianName: "",
    openingKm: "",
    closingKm: "",
    totalKm: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [technicians, setTechnicians] = useState([]) // Changed from static array to state
  const [isTechniciansLoading, setIsTechniciansLoading] = useState(false) // Loading state for technicians

  // Google Apps Script Web App URL - Replace with your actual deployed script URL
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzkBpcYMupYQi6gSURT_tqDfeQrGtbS6DwiRvmjw0s2kAIGmHlkjnVJDddXOy0v6ur7rw/exec"

  // Function to format date string to dd/mm/yyyy
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
    // Handle Google Sheets format like "5/22/2025, 2:32:51 PM"
    else if (typeof dateValue === 'string' && dateValue.includes('/') && dateValue.includes(',')) {
      date = new Date(dateValue);
    }
    // Handle Google Sheets Date constructor format like "Date(2025,4,21)" or "Date(2025,4,22,14,32,51)"
    else if (typeof dateValue === 'string' && dateValue.startsWith('Date(')) {
      // Extract the date parts from "Date(2025,4,21)" or "Date(2025,4,22,14,32,51)" format
      const match = dateValue.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/);
      if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]); // Month is 0-indexed in this format
        const day = parseInt(match[3]);
        // Optional time components
        const hours = match[4] ? parseInt(match[4]) : 0;
        const minutes = match[5] ? parseInt(match[5]) : 0;
        const seconds = match[6] ? parseInt(match[6]) : 0;
        date = new Date(year, month, day, hours, minutes, seconds);
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

  // Function to fetch technicians from Master sheet column F
  const fetchTechnicians = async () => {
    setIsTechniciansLoading(true)
    
    try {
      // Fetch the Master sheet using Google Sheets API directly
      const sheetUrl = "https://docs.google.com/spreadsheets/d/1Vn295WmY0o6qh03rYzpCISGfMgT5RViXdYyd_ZNQ2p8/gviz/tq?tqx=out:json&sheet=Master"
      const response = await fetch(sheetUrl)
      const text = await response.text()
      
      // Extract the JSON part from the response
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}') + 1
      const jsonData = text.substring(jsonStart, jsonEnd)
      
      const data = JSON.parse(jsonData)
      
      // Process the technicians data from column F
      if (data && data.table && data.table.rows) {
        const techniciansData = []
        
        // Process all rows and extract column F (index 5)
        data.table.rows.slice(1).forEach((row) => {
          if (row.c && row.c[5] && row.c[5].v) { // Column F is index 5 (0-based)
            const technicianName = row.c[5].v.toString().trim()
            // Only add non-empty, unique technician names
            if (technicianName && !techniciansData.includes(technicianName)) {
              techniciansData.push(technicianName)
            }
          }
        })
        
        // Sort technicians alphabetically
        setTechnicians(techniciansData.sort())
      } else {
        setTechnicians([])
      }
    } catch (err) {
      console.error("Error fetching technicians:", err)
      // Fallback to empty array if fetch fails
      setTechnicians([])
    } finally {
      setIsTechniciansLoading(false)
    }
  }

  // Load expenses from Google Sheets on component mount
  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch the Petrol Expenses sheet using Google Sheets API directly
        const sheetUrl = "https://docs.google.com/spreadsheets/d/1Vn295WmY0o6qh03rYzpCISGfMgT5RViXdYyd_ZNQ2p8/gviz/tq?tqx=out:json&sheet=Petrol%20Expenses"
        const response = await fetch(sheetUrl)
        const text = await response.text()
        
        // Extract the JSON part from the response
        const jsonStart = text.indexOf('{')
        const jsonEnd = text.lastIndexOf('}') + 1
        const jsonData = text.substring(jsonStart, jsonEnd)
        
        const data = JSON.parse(jsonData)
        
        // Process the expenses data
        if (data && data.table && data.table.rows) {
          const expensesData = []
          
          // Skip the header row and process the data rows
          data.table.rows.slice(0).forEach((row, index) => {
            if (row.c && row.c[1]) { // Check if row has data (at least date column)
              // Format timestamp (Column A) - ISO format to dd/mm/yyyy
              let timestampValue = row.c[0] ? row.c[0].v : "";
              
              // Format expense date (Column B) - date format to dd/mm/yyyy
              let expenseDateValue = row.c[1] ? row.c[1].v : "";
              expenseDateValue = formatDateString(expenseDateValue);
              
              const expense = {
                id: index + 1,
                createdAt: timestampValue, // Column A (timestamp)
                date: expenseDateValue, // Column B (formatted date)
                technicianName: row.c[2] ? row.c[2].v : "", // Column C
                openingKm: row.c[3] ? parseFloat(row.c[3].v) || 0 : 0, // Column D
                closingKm: row.c[4] ? parseFloat(row.c[4].v) || 0 : 0, // Column E
                totalKm: row.c[5] ? parseFloat(row.c[5].v) || 0 : 0 // Column F
              }
              
              expensesData.push(expense)
            }
          })
          
          // Reverse to show newest first
          setExpenses(expensesData.reverse())
          setFilteredExpenses(expensesData) // Initialize filtered expenses
        } else {
          setExpenses([])
          setFilteredExpenses([])
        }
      } catch (err) {
        console.error("Error fetching expenses:", err)
        setError(err.message)
        setExpenses([])
        setFilteredExpenses([])
      } finally {
        setIsLoading(false)
      }
    }
    
    // Fetch both expenses and technicians
    fetchExpenses()
    fetchTechnicians()
  }, [])

  // Filter expenses based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredExpenses(expenses)
    } else {
      const query = searchQuery.toLowerCase().trim()
      const filtered = expenses.filter((expense) => {
        return (
          expense.date.toLowerCase().includes(query) ||
          expense.technicianName.toLowerCase().includes(query) ||
          expense.openingKm.toString().includes(query) ||
          expense.closingKm.toString().includes(query) ||
          expense.totalKm.toString().includes(query) ||
          formatDateString(expense.createdAt).toLowerCase().includes(query)
        )
      })
      setFilteredExpenses(filtered)
    }
  }, [searchQuery, expenses])

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
  }

  // Calculate total km when opening or closing km changes
  useEffect(() => {
    const opening = Number.parseFloat(formData.openingKm) || 0
    const closing = Number.parseFloat(formData.closingKm) || 0
    const total = closing - opening
    setFormData((prev) => ({
      ...prev,
      totalKm: total > 0 ? total : 0,
    }))
  }, [formData.openingKm, formData.closingKm])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.date || !formData.technicianName || !formData.openingKm || !formData.closingKm) {
      alert("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    if (Number.parseFloat(formData.closingKm) <= Number.parseFloat(formData.openingKm)) {
      alert("Closing KM must be greater than Opening KM")
      setIsSubmitting(false)
      return
    }

    try {
      // Prepare expense data
      const expenseData = {
        date: formData.date,
        technicianName: formData.technicianName,
        openingKm: formData.openingKm,
        closingKm: formData.closingKm,
        totalKm: formData.totalKm
      }

      // Create row data for Google Sheets
      const timestamp = new Date().toISOString()
      const rowData = [
        timestamp,
        expenseData.date,
        expenseData.technicianName,
        expenseData.openingKm,
        expenseData.closingKm,
        expenseData.totalKm
      ]

      // Submit to Google Sheets
      const submitFormData = new FormData()
      submitFormData.append('action', 'insert')
      submitFormData.append('sheetName', 'Petrol Expenses')
      submitFormData.append('rowData', JSON.stringify(rowData))

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: submitFormData
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to add expense')
      }

      // Add the new expense to local state
      const newExpense = {
        id: Date.now(),
        ...expenseData,
        createdAt: timestamp,
      }

      const updatedExpenses = [newExpense, ...expenses]
      setExpenses(updatedExpenses)
      setFilteredExpenses(updatedExpenses) // Update filtered expenses too

      // Reset form and close
      setFormData({
        date: "",
        technicianName: "",
        openingKm: "",
        closingKm: "",
        totalKm: 0,
      })
      setShowForm(false)
      alert("Expense added successfully!")
    } catch (err) {
      console.error("Error submitting expense:", err)
      alert("Failed to add expense: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      date: "",
      technicianName: "",
      openingKm: "",
      closingKm: "",
      totalKm: 0,
    })
    setShowForm(false)
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Petrol Expenses</h1>
            <p className="text-gray-600">Track and manage petrol expenses for technicians</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Expenses
          </button>
        </div>

        {/* Add Expense Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Add Petrol Expense</h2>
                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Technician Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    Technician Name *
                  </label>
                  <select
                    name="technicianName"
                    value={formData.technicianName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isTechniciansLoading}
                  >
                    <option value="">
                      {isTechniciansLoading ? "Loading technicians..." : "Select Technician"}
                    </option>
                    {technicians.map((tech, index) => (
                      <option key={index} value={tech}>
                        {tech}
                      </option>
                    ))}
                  </select>
                  {isTechniciansLoading && (
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Loader className="h-3 w-3 animate-spin mr-1" />
                      Loading technicians from Master sheet...
                    </div>
                  )}
                </div>

                {/* Opening KM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Navigation className="h-4 w-4 inline mr-1" />
                    Opening KM *
                  </label>
                  <input
                    type="number"
                    name="openingKm"
                    value={formData.openingKm}
                    onChange={handleInputChange}
                    placeholder="Enter opening kilometers"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                    step="0.1"
                  />
                </div>

                {/* Closing KM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Navigation className="h-4 w-4 inline mr-1" />
                    Closing KM *
                  </label>
                  <input
                    type="number"
                    name="closingKm"
                    value={formData.closingKm}
                    onChange={handleInputChange}
                    placeholder="Enter closing kilometers"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                    step="0.1"
                  />
                </div>

                {/* Total KM (Auto-calculated) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total KM</label>
                  <input
                    type="number"
                    value={formData.totalKm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                    disabled
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Automatically calculated (Closing KM - Opening KM)</p>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Expense"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

         {/* Summary Stats */}
         {expenses.length > 0 && !isLoading && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Entries</p>
                  <p className="text-2xl font-semibold text-gray-900">{expenses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Navigation className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Distance</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {expenses.reduce((sum, expense) => sum + expense.totalKm, 0).toFixed(1)} km
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Technicians</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {new Set(expenses.map((expense) => expense.technicianName)).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Search className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Filtered Results</p>
                  <p className="text-2xl font-semibold text-gray-900">{filteredExpenses.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading expenses...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Expenses History Table */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">Expenses History</h2>
                
                {/* Search Box */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by date, technician, km values..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Search Results Info */}
              {searchQuery && (
                <div className="mt-3 text-sm text-gray-600">
                  {filteredExpenses.length === 0 ? (
                    <span className="text-red-600">No results found for "{searchQuery}"</span>
                  ) : (
                    <span>
                      Showing {filteredExpenses.length} of {expenses.length} entries
                      {filteredExpenses.length !== expenses.length && (
                        <span className="ml-2 text-blue-600">
                          (filtered by "{searchQuery}")
                        </span>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>

            {expenses.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses recorded</h3>
                <p className="text-gray-500 mb-4">Start by adding your first petrol expense entry.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add First Expense
                </button>
              </div>
            ) : filteredExpenses.length === 0 && searchQuery ? (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 mb-4">
                  No expenses match your search for "{searchQuery}"
                </p>
                <button
                  onClick={clearSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Technician
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opening KM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Closing KM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total KM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{expense.technicianName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {Number.parseFloat(expense.openingKm).toFixed(1)} km
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {Number.parseFloat(expense.closingKm).toFixed(1)} km
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {expense.totalKm.toFixed(1)} km
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateString(expense.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default PetrolExpensesPage