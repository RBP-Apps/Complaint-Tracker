"use client"

import { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

function AssignComplaintForm({ complaintId, onClose, onSubmit }) {
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    technicianName: "",
    technicianContact: "",
    assigneeName: "",
    assigneeWhatsapp: "",
    location: "",
    complaintDetails: "",
    notes: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Column AA to AI (indices 26 to 34 in 0-indexed system)
      // Create a proper assignment payload
      const assigneeData = {
        assignee: formData.assigneeName, // Column AA (26) - Assigned To
        technicianName: formData.technicianName, // Column AB (27) - Technician Name
        technicianContact: formData.technicianContact, // Column AC (28) - Technician Contact
        assigneeWhatsapp: formData.assigneeWhatsapp, // Column AD (29) - Assignee WhatsApp
        location: formData.location, // Column AE (30) - Location
        complaintDetails: formData.complaintDetails, // Column AF (31) - Complaint Details
        expectedCompletionDate: expectedCompletionDate ? expectedCompletionDate.toLocaleDateString() : "", // Column AG (32) - Expected Completion Date
        notes: formData.notes, // Column AH (33) - Notes
        assignmentTimestamp: new Date().toLocaleString() // Column AI (34) - Assignment Timestamp
      }

      // If onSubmit is provided, call it with the data
      if (onSubmit) {
        await onSubmit(complaintId, assigneeData)
      } else {
        // Fallback to direct Google Sheets API if onSubmit is not provided
        try {
          // Create form data for POST request
          const formDataPayload = new FormData()
          formDataPayload.append('sheetName', 'FMS')
          formDataPayload.append('action', 'update')
          
          // Find the complaint row index (we'll need the actual row index that matches the complaintId)
          // Since this is a fallback, we'll use a hardcoded approach for simplicity
          const rowIndex = parseInt(complaintId.replace('COMP-', '')) + 5 // Rough estimate based on ID
          formDataPayload.append('rowIndex', rowIndex.toString())
          
          // We need to create an array with all columns, filling in only the ones we want to update
          // Assuming 50 columns total, with empty strings for columns we don't want to change
          const rowDataArray = new Array(50).fill('');
          
          // Only fill in columns AA to AI (indices 26 to 34 in 0-indexed system)
          rowDataArray[26] = assigneeData.assignee;
          rowDataArray[27] = assigneeData.technicianName;
          rowDataArray[28] = assigneeData.technicianContact;
          rowDataArray[29] = assigneeData.assigneeWhatsapp;
          rowDataArray[30] = assigneeData.location;
          rowDataArray[31] = assigneeData.complaintDetails;
          rowDataArray[32] = assigneeData.expectedCompletionDate;
          rowDataArray[33] = assigneeData.notes;
          rowDataArray[34] = assigneeData.assignmentTimestamp;
          
          formDataPayload.append('rowData', JSON.stringify(rowDataArray))
          
          // Post the update
          const response = await fetch(
            'https://script.google.com/macros/s/AKfycbzkBpcYMupYQi6gSURT_tqDfeQrGtbS6DwiRvmjw0s2kAIGmHlkjnVJDddXOy0v6ur7rw/exec',
            {
              method: 'POST',
              body: formDataPayload
            }
          )
          
          // Handle response (may be limited due to CORS)
          console.log("Assignment response:", response)
        } catch (error) {
          console.error("Error directly submitting to Google Sheets:", error)
          throw error
        }
      }

      // Show success message
      alert(`Complaint ${complaintId} has been assigned to ${formData.technicianName}.`)
      
      // Close modal
      onClose()
    } catch (error) {
      console.error("Error submitting assignment:", error)
      alert("Failed to assign complaint. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="assigneeName" className="block text-sm font-medium">
          Assignee Name <span className="text-red-500">*</span>
        </label>
        <input
          id="assigneeName"
          name="assigneeName"
          placeholder="Enter assignee name"
          value={formData.assigneeName}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md py-2 px-3"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="technicianName" className="block text-sm font-medium">
          Technician Name <span className="text-red-500">*</span>
        </label>
        <input
          id="technicianName"
          name="technicianName"
          placeholder="Enter technician name"
          value={formData.technicianName}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md py-2 px-3"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="technicianContact" className="block text-sm font-medium">
          Technician Contact <span className="text-red-500">*</span>
        </label>
        <input
          id="technicianContact"
          name="technicianContact"
          placeholder="Enter technician contact"
          value={formData.technicianContact}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md py-2 px-3"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="assigneeWhatsapp" className="block text-sm font-medium">
          Assignee WhatsApp Number
        </label>
        <input
          id="assigneeWhatsapp"
          name="assigneeWhatsapp"
          placeholder="Enter assignee WhatsApp number"
          value={formData.assigneeWhatsapp}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md py-2 px-3"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="location" className="block text-sm font-medium">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          id="location"
          name="location"
          placeholder="Enter location details"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md py-2 px-3"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="complaintDetails" className="block text-sm font-medium">
          Complaint Details <span className="text-red-500">*</span>
        </label>
        <textarea
          id="complaintDetails"
          name="complaintDetails"
          placeholder="Enter complaint details"
          value={formData.complaintDetails}
          onChange={handleChange}
          required
          rows={3}
          className="w-full border border-gray-300 rounded-md py-2 px-3"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="expectedCompletionDate" className="block text-sm font-medium">
          Expected Completion Date <span className="text-red-500">*</span>
        </label>
        <div className="relative w-full">
          <DatePicker
            id="expected-date-picker"
            selected={expectedCompletionDate}
            onChange={(date) => setExpectedCompletionDate(date)}
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
                {expectedCompletionDate ? expectedCompletionDate.toLocaleDateString() : "Select expected completion date"}
              </div>
            }
            wrapperClassName="w-full"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="block text-sm font-medium">
          Notes for Technician
        </label>
        <textarea
          id="notes"
          name="notes"
          placeholder="Enter notes for the technician"
          value={formData.notes}
          onChange={handleChange}
          rows={2}
          className="w-full border border-gray-300 rounded-md py-2 px-3"
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center"
          disabled={isSubmitting}
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
              Assigning...
            </>
          ) : (
            "Assign Complaint"
          )}
        </button>
      </div>
    </form>
  )
}

export default AssignComplaintForm