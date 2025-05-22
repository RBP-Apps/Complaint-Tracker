"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

function NewComplaintForm() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState(null)
  const [complaintDate, setComplaintDate] = useState(null)
  const [serialNumber, setSerialNumber] = useState('')
  
  // States for dropdown options from master sheet
  const [modeOfCallOptions, setModeOfCallOptions] = useState([])
  const [acdcOptions, setAcdcOptions] = useState([])
  const [priorityOptions, setPriorityOptions] = useState([])
  const [insuranceTypeOptions, setInsuranceTypeOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    head: "",
    companyName: "",
    modeOfCall: "",
    idNumber: "",
    projectName: "",
    complaintNumber: "",
    beneficiaryName: "",
    contactNumber: "",
    village: "",
    block: "",
    district: "",
    product: "",
    make: "",
    systemVoltage: "",
    rating: "",
    qty: "",
    acdc: "",
    natureOfComplaint: "",
    priority: "",
    insuranceType: "",
  })

  // Fetch dropdown options from the master sheet
  const fetchDropdownOptions = async () => {
    try {
      setIsLoading(true)
      
      // URL to your Google Sheet - using the visualization API to get the data
      // Make sure to replace the spreadsheet ID with your actual spreadsheet ID
      // and set the sheet name to your master dropdown sheet
      const sheetUrl = "https://docs.google.com/spreadsheets/d/1Vn295WmY0o6qh03rYzpCISGfMgT5RViXdYyd_ZNQ2p8/gviz/tq?tqx=out:json&sheet=master"
      
      const response = await fetch(sheetUrl)
      const text = await response.text()
      
      // Extract the JSON part from the response
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}') + 1
      const jsonData = text.substring(jsonStart, jsonEnd)
      
      const data = JSON.parse(jsonData)
      
      // Process the dropdown data
      if (data && data.table && data.table.rows) {
        const modeOfCall = []
        const acdc = []
        const priority = []
        const insuranceType = []
        
        // Extract values from specific columns
        data.table.rows.slice(1).forEach(row => {
          if (row.c) {
            // Column A: Mode of Call
            if (row.c[0] && row.c[0].v !== null && row.c[0].v !== "") {
              modeOfCall.push(row.c[0].v)
            }
            
            // Column B: AC/DC
            if (row.c[1] && row.c[1].v !== null && row.c[1].v !== "") {
              acdc.push(row.c[1].v)
            }
            
            // Column C: Priority
            if (row.c[2] && row.c[2].v !== null && row.c[2].v !== "") {
              priority.push(row.c[2].v)
            }
            
            // Column D: Insurance Type
            if (row.c[3] && row.c[3].v !== null && row.c[3].v !== "") {
              insuranceType.push(row.c[3].v)
            }
          }
        })
        
        // Set the dropdown options
        setModeOfCallOptions(modeOfCall)
        setAcdcOptions(acdc)
        setPriorityOptions(priority)
        setInsuranceTypeOptions(insuranceType)
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error)
      // Fallback options in case of error
      setModeOfCallOptions(['Phone', 'Email', 'In Person', 'Web Form'])
      setAcdcOptions(['AC', 'DC'])
      setPriorityOptions(['Low', 'Medium', 'High', 'Urgent'])
      setInsuranceTypeOptions(['Insuranced', 'Without Insuranced'])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch the last serial number from the sheet
  const fetchLastSerialNumber = async () => {
    try {
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbzkBpcYMupYQi6gSURT_tqDfeQrGtbS6DwiRvmjw0s2kAIGmHlkjnVJDddXOy0v6ur7rw/exec?action=getLastSerialNumber&sheetName=FMS',
        {
          method: 'GET',
          mode: 'no-cors'
        }
      )

      // Since we can't read the response due to no-cors, we'll generate a serial number client-side
      const generateSerialNumber = (lastNumber) => {
        if (!lastNumber) return 'CT-001'
        
        // Extract the numeric part and increment
        const numPart = parseInt(lastNumber.split('-')[1])
        const newNum = numPart + 1
        
        // Pad with zeros to maintain 3-digit format
        return `CT-${newNum.toString().padStart(3, '0')}`
      }

      // For now, generate a serial number 
      // In a real scenario, you'd want to get this from the server response
      const newSerialNumber = generateSerialNumber(null)
      setSerialNumber(newSerialNumber)
    } catch (error) {
      console.error('Error fetching serial number:', error)
      // Fallback generation
      setSerialNumber('CT-001')
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchLastSerialNumber()
    fetchDropdownOptions()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get current timestamp
      const timestamp = new Date().toLocaleString()
      
      // Get submit date (current date)
      const submitDate = new Date().toLocaleDateString()

      // Prepare the row data with specific column mapping
      const rowData = new Array(50).fill(''); // Assuming maximum 50 columns

      // Column 1: Timestamp
      rowData[0] = timestamp;

      // Column 2: Serial Number
      rowData[1] = serialNumber;

      // Column 3: Date (from date picker)
      rowData[2] = date ? date.toLocaleDateString() : '';

      // Column 4: Submit Date
      // rowData[3] = submitDate;

      // Column 5: Head
      rowData[3] = formData.head;

      // Column 6: Company Name
      rowData[4] = formData.companyName;

      // Column 7: Mode of Call
      rowData[5] = formData.modeOfCall;

      // Column 8: ID Number
      rowData[6] = formData.idNumber;

      // Column 9: Project Name
      rowData[7] = formData.projectName;

      // Column 10: Complaint Number
      rowData[8] = formData.complaintNumber;

      // Column 11: Complaint Date
      rowData[9] = complaintDate ? complaintDate.toLocaleDateString() : '';

      // Continue mapping other fields to specific columns as needed
      rowData[10] = formData.beneficiaryName;
      rowData[11] = formData.contactNumber;
      rowData[12] = formData.village;
      rowData[13] = formData.block;
      rowData[14] = formData.district;
      rowData[15] = formData.product;
      rowData[16] = formData.make;
      rowData[17] = formData.systemVoltage;
      rowData[18] = formData.rating;
      rowData[19] = formData.qty;
      rowData[20] = formData.acdc;
      rowData[21] = formData.priority;
      rowData[22] = formData.insuranceType;
      rowData[23] = formData.natureOfComplaint;

      // Prepare the payload for Google Apps Script
      const payload = {
        sheetName: 'FMS',
        action: 'insert',
        rowData: JSON.stringify(rowData)
      }

      // Submit data to Google Apps Script
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbzkBpcYMupYQi6gSURT_tqDfeQrGtbS6DwiRvmjw0s2kAIGmHlkjnVJDddXOy0v6ur7rw/exec',
        {
          method: 'POST',
          mode: 'no-cors', // Note: this prevents getting the response body
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: Object.keys(payload)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}`)
            .join('&')
        }
      )

      // Simulate successful submission (since no-cors prevents proper response handling)
      setTimeout(() => {
        setIsSubmitting(false)
        alert("Complaint created successfully")
        navigate("/dashboard/assign-complaint")
      }, 1500)

    } catch (error) {
      console.error('Submission error:', error)
      setIsSubmitting(false)
      alert("Failed to create complaint. Please try again.")
    }
  }

  return (
    <div className="rounded-lg border-0 shadow-md bg-white">
    <div className="p-4 sm:p-6">
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading form data...</span>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium">
              Date
            </label>
            <div className="relative w-full">
              <DatePicker
                id="date-picker"
                selected={date}
                onChange={(date) => setDate(date)}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
                customInput={
                  <div className="w-full flex justify-start items-center text-left border border-gray-300 rounded-md py-2 px-3 bg-white cursor-pointer" style={{width: '100%'}}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    {date ? date.toLocaleDateString() : "Select date"}
                  </div>
                }
                wrapperClassName="w-full"
              />
            </div>
          </div>

            <div className="space-y-2">
              <label htmlFor="head" className="block text-sm font-medium">
                Head
              </label>
              <input
                id="head"
                name="head"
                placeholder="Enter head"
                value={formData.head}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="companyName" className="block text-sm font-medium">
                Company Name
              </label>
              <input
                id="companyName"
                name="companyName"
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="modeOfCall" className="block text-sm font-medium">
                Mode Of Call
              </label>
              <select
                id="modeOfCall"
                name="modeOfCall"
                value={formData.modeOfCall}
                onChange={(e) => handleSelectChange("modeOfCall", e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              >
                <option value="">Select mode of call</option>
                {modeOfCallOptions.map((option, index) => (
                  <option key={`mode-${index}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="idNumber" className="block text-sm font-medium">
                ID Number
              </label>
              <input
                id="idNumber"
                name="idNumber"
                placeholder="Enter ID number"
                value={formData.idNumber}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="projectName" className="block text-sm font-medium">
                Project Name
              </label>
              <input
                id="projectName"
                name="projectName"
                placeholder="Enter project name"
                value={formData.projectName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="complaintNumber" className="block text-sm font-medium">
                Complaint Number
              </label>
              <input
                id="complaintNumber"
                name="complaintNumber"
                placeholder="Enter complaint number"
                value={formData.complaintNumber}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="complaintDate" className="block text-sm font-medium">
                Complaint Date
              </label>
              <div className="relative w-full">
                <DatePicker
                  id="complaint-date-picker"
                  selected={complaintDate}
                  onChange={(date) => setComplaintDate(date)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                  customInput={
                    <div className="w-full flex justify-start items-center text-left border border-gray-300 rounded-md py-2 px-3 bg-white cursor-pointer" style={{width: '100%'}}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-4 w-4"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                      </svg>
                      {complaintDate ? complaintDate.toLocaleDateString() : "Select complaint date"}
                    </div>
                  }
                  wrapperClassName="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="beneficiaryName" className="block text-sm font-medium">
                Beneficiary Name
              </label>
              <input
                id="beneficiaryName"
                name="beneficiaryName"
                placeholder="Enter beneficiary name"
                value={formData.beneficiaryName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contactNumber" className="block text-sm font-medium">
                Contact Number
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                placeholder="Enter contact number"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="village" className="block text-sm font-medium">
                Village
              </label>
              <input
                id="village"
                name="village"
                placeholder="Enter village"
                value={formData.village}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="block" className="block text-sm font-medium">
                Block
              </label>
              <input
                id="block"
                name="block"
                placeholder="Enter block"
                value={formData.block}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="district" className="block text-sm font-medium">
                District
              </label>
              <input
                id="district"
                name="district"
                placeholder="Enter district"
                value={formData.district}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="product" className="block text-sm font-medium">
                Product
              </label>
              <input
                id="product"
                name="product"
                placeholder="Enter product"
                value={formData.product}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="make" className="block text-sm font-medium">
                Make
              </label>
              <input
                id="make"
                name="make"
                placeholder="Enter make"
                value={formData.make}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="systemVoltage" className="block text-sm font-medium">
                System Voltage
              </label>
              <input
                id="systemVoltage"
                name="systemVoltage"
                placeholder="Enter system voltage"
                value={formData.systemVoltage}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="rating" className="block text-sm font-medium">
                Rating
              </label>
              <input
                id="rating"
                name="rating"
                placeholder="Enter rating"
                value={formData.rating}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="qty" className="block text-sm font-medium">
                Qty
              </label>
              <input
                id="qty"
                name="qty"
                placeholder="Enter quantity"
                value={formData.qty}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="acdc" className="block text-sm font-medium">
                AC/DC
              </label>
              <select
                id="acdc"
                name="acdc"
                value={formData.acdc}
                onChange={(e) => handleSelectChange("acdc", e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              >
                <option value="">Select AC/DC</option>
                {acdcOptions.map((option, index) => (
                  <option key={`acdc-${index}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="block text-sm font-medium">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={(e) => handleSelectChange("priority", e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              >
                <option value="">Select priority</option>
                {priorityOptions.map((option, index) => (
                  <option key={`priority-${index}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="insuranceType" className="block text-sm font-medium">
                Insurance Type
              </label>
              <select
                id="insuranceType"
                name="insuranceType"
                value={formData.insuranceType}
                onChange={(e) => handleSelectChange("insuranceType", e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              >
                <option value="">Select insurance type</option>
                {insuranceTypeOptions.map((option, index) => (
                  <option key={`insurance-${index}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="natureOfComplaint" className="block text-sm font-medium">
              Nature Of Complaint
            </label>
            <textarea
              id="natureOfComplaint"
              name="natureOfComplaint"
              placeholder="Enter detailed description of the complaint"
              value={formData.natureOfComplaint}
              onChange={handleChange}
              rows={4}
              required
              className="w-full border border-gray-300 rounded-md py-2 px-3"
            />
          </div>

          <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Creating Complaint...
                </>
              ) : (
                "Create Complaint"
              )}
            </button>
        </form>
      )}
      </div>
    </div>
  )
}

export default NewComplaintForm