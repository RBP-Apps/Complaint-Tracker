// // "use client"

// // import { useState, useEffect } from "react"
// // import { useNavigate } from "react-router-dom"
// // import DatePicker from "react-datepicker"
// // import "react-datepicker/dist/react-datepicker.css"

// // function NewComplaintForm() {
// //   const navigate = useNavigate()
// //   const [isSubmitting, setIsSubmitting] = useState(false)
// //   const [complaintDate, setComplaintDate] = useState(null)
// //   const [serialNumber, setSerialNumber] = useState('')
  
// //   // States for dropdown options from master sheet
// //   const [companyNameOptions, setCompanyNameOptions] = useState([])
// //   const [modeOfCallOptions, setModeOfCallOptions] = useState([])
// //   const [projectNameOptions, setProjectNameOptions] = useState([])
// //   const [districtOptions, setDistrictOptions] = useState([])
// //   const [technicianNameOptions, setTechnicianNameOptions] = useState([])
// //   const [technicianContactOptions, setTechnicianContactOptions] = useState([])
// //   const [insuranceTypeOptions, setInsuranceTypeOptions] = useState([])
// //   const [isLoading, setIsLoading] = useState(true)
// //   const [technicianMapping, setTechnicianMapping] = useState([])

// //   const [formData, setFormData] = useState({
// //     companyName: "",
// //     modeOfCall: "",
// //     idNumber: "",
// //     projectName: "",
// //     complaintNumber: "",
// //     beneficiaryName: "",
// //     contactNumber: "",
// //     village: "",
// //     block: "",
// //     district: "",
// //     product: "",
// //     make: "",
// //     rating: "",
// //     qty: "",
// //     insuranceType: "",
// //     natureOfComplaint: "",
// //     technicianName: "",
// //     technicianContact: "",
// //     assigneeWhatsapp: "",
// //   })


// // // Fetch dropdown options from the master sheet
// // const fetchDropdownOptions = async () => {
// //   try {
// //     setIsLoading(true)
    
// //     const sheetUrl = "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=master"
// //     const loginSheetUrl = "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=Login"
    
// //     const [masterResponse, loginResponse] = await Promise.all([
// //       fetch(sheetUrl),
// //       fetch(loginSheetUrl)
// //     ])
    
// //     const masterText = await masterResponse.text()
// //     const loginText = await loginResponse.text()
    
// //     // Extract the JSON part from the responses
// //     const masterJsonStart = masterText.indexOf('{')
// //     const masterJsonEnd = masterText.lastIndexOf('}') + 1
// //     const masterData = JSON.parse(masterText.substring(masterJsonStart, masterJsonEnd))
    
// //     const loginJsonStart = loginText.indexOf('{')
// //     const loginJsonEnd = loginText.lastIndexOf('}') + 1
// //     const loginData = JSON.parse(loginText.substring(loginJsonStart, loginJsonEnd))

// //     // Process the dropdown data from master sheet
// //     if (masterData && masterData.table && masterData.table.rows) {
// //       const companyNames = []
// //       const modeOfCall = []
// //       const projectNames = []
// //       const districts = []
// //       const insuranceTypes = []
      
// //       masterData.table.rows.forEach((row, index) => {
// //         if (row.c) {
// //           // Column A: Company Name
// //           if (row.c[0] && row.c[0].v !== null && row.c[0].v !== "" && row.c[0].v !== "Company Name") {
// //             companyNames.push(row.c[0].v)
// //           }
          
// //           // Column B: Mode of Call
// //           if (row.c[1] && row.c[1].v !== null && row.c[1].v !== "" && row.c[1].v !== "Mode Of Call") {
// //             modeOfCall.push(row.c[1].v)
// //           }
          
// //           // Column C: Project Name
// //           if (row.c[2] && row.c[2].v !== null && row.c[2].v !== "" && row.c[2].v !== "Project Name") {
// //             projectNames.push(row.c[2].v)
// //           }
          
// //           // Column D: District
// //           if (row.c[3] && row.c[3].v !== null && row.c[3].v !== "" && row.c[3].v !== "District") {
// //             districts.push(row.c[3].v)
// //           }
          
// //           // Column G: Insurance Type
// //           if (row.c[6] && row.c[6].v !== null && row.c[6].v !== "" && row.c[6].v !== "Insurance Type") {
// //             insuranceTypes.push(row.c[6].v)
// //           }
// //         }
// //       })
      
// //       // Remove duplicates and set the dropdown options
// //       setCompanyNameOptions([...new Set(companyNames)])
// //       setModeOfCallOptions([...new Set(modeOfCall)])
// //       setProjectNameOptions([...new Set(projectNames)])
// //       setDistrictOptions([...new Set(districts)])
// //       setInsuranceTypeOptions([...new Set(insuranceTypes)])
// //     }

// //     // Process technician data from Login sheet
// //  // Process technician data from Login sheet
// // if (loginData && loginData.table && loginData.table.rows) {
// //   const technicianNames = []
// //   const technicianContacts = []
// //   const technicianMapping = []
  
// //   // Get current logged-in user from localStorage
// //   const currentUser = localStorage.getItem('currentUser')
// //   const userRole = localStorage.getItem('userRole')
  
// //   console.log("Current logged in user:", currentUser)
// //   console.log("User role:", userRole)
  
// //   loginData.table.rows.forEach((row, index) => {
// //     if (row.c) {
// //       // Column A: Technician Name (from Login sheet)
// //       const techName = row.c[0] && row.c[0].v !== null && row.c[0].v !== "" && row.c[0].v !== "Name" ? row.c[0].v : null
      
// //       // Column E: Role (from Login sheet)
// //       const role = row.c[4] && row.c[4].v !== null && row.c[4].v !== "" && row.c[4].v !== "Role" ? row.c[4].v.toLowerCase() : null
      
// //       // Column F: Technician Contact (from Login sheet)
// //       const techContact = row.c[5] && row.c[5].v !== null && row.c[5].v !== "" && row.c[5].v !== "Contact" ? row.c[5].v : null
      
// //       if (techName && techContact) {
// //         // If user is admin or regular user, show all technicians
// //         if (userRole === 'admin' || userRole === 'user') {
// //           technicianNames.push(techName)
// //           technicianContacts.push(techContact)
// //           technicianMapping.push({
// //             name: techName,
// //             contact: techContact
// //           })
// //         } 
// //         // If role is 'tech', show only their own name
// //         else if (userRole === 'tech' && role === 'tech' && currentUser && techName.toLowerCase() === currentUser.toLowerCase()) {
// //           technicianNames.push(techName)
// //           technicianContacts.push(techContact)
// //           technicianMapping.push({
// //             name: techName,
// //             contact: techContact
// //           })
          
// //           // Auto-fill the form with tech's data
// //           setFormData(prev => ({
// //             ...prev,
// //             technicianName: techName,
// //             technicianContact: techContact
// //           }))
// //         }
// //       }
// //     }
// //   })
  
// //   // Remove duplicates and set technician options
// //   setTechnicianNameOptions([...new Set(technicianNames)])
// //   setTechnicianContactOptions([...new Set(technicianContacts)])
// //   setTechnicianMapping(technicianMapping)
  
// //   console.log("Technician mapping loaded:", technicianMapping)
// //   console.log("User role:", userRole)
// //   console.log("Current user:", currentUser)
// // }
// //   } catch (error) {
// //     console.error('Error fetching dropdown options:', error)
// //     // Fallback options
// //     const fallbackMapping = [
// //       { name: 'Technician 1', contact: '9876543210' },
// //       { name: 'Technician 2', contact: '9876543211' },
// //       { name: 'Technician 3', contact: '9876543212' }
// //     ]
    
// //     setTechnicianNameOptions(['Technician 1', 'Technician 2', 'Technician 3'])
// //     setTechnicianContactOptions(['9876543210', '9876543211', '9876543212'])
// //     setTechnicianMapping(fallbackMapping)
// //   } finally {
// //     setIsLoading(false)
// //   }
// // }


// //   // Fetch the last serial number from the sheet - यही function पहले जैसा है
// //   const fetchLastSerialNumber = async () => {
// //     try {
// //       const scriptUrl = `https://script.google.com/a/macros/rbpindia.com/s/AKfycbwnIMOzsFbniWnPFhl3lzE-2W0l6lD23keuz57-ldS_umSXIJqpEK-qxLE6eM0s7drqrQ/exec?action=getLastSerialNumber&sheetName=FMS`
      
// //       console.log('Fetching from:', scriptUrl)
      
// //       const response = await fetch(scriptUrl, {
// //         method: 'GET',
// //         headers: {
// //           'Accept': 'application/json',
// //         }
// //       })
      
// //       if (!response.ok) {
// //         throw new Error(`HTTP error! status: ${response.status}`)
// //       }
      
// //       const responseText = await response.text()
// //       console.log('Raw response:', responseText)
      
// //       let data
// //       try {
// //         data = JSON.parse(responseText)
// //       } catch (parseError) {
// //         console.error('JSON parse error:', parseError)
// //         throw new Error("Response is not valid JSON")
// //       }
      
// //       console.log('Parsed data:', data)
      
// //       if (data.success && typeof data.lastSerialNumber !== 'undefined') {
// //         const lastNumber = data.lastSerialNumber
// //         let newSerialNumber
        
// //         if (lastNumber && lastNumber.toString().includes('SSY-')) {
// //           const numPart = parseInt(lastNumber.toString().split('-')[1])
// //           if (!isNaN(numPart)) {
// //             newSerialNumber = `SSY-${(numPart + 1).toString().padStart(3, '0')}`
// //           } else {
// //             newSerialNumber = 'SSY-001'
// //           }
// //         } else {
// //           newSerialNumber = 'SSY-001'
// //         }
        
// //         console.log('Generated serial number:', newSerialNumber)
// //         setSerialNumber(newSerialNumber)
// //         localStorage.setItem('lastSerialNumber', newSerialNumber)
// //         return
// //       }
      
// //       throw new Error(data.error || "Failed to get serial number from response")
// //     } catch (error) {
// //       console.error('Error fetching serial number:', error)
// //       console.log('Falling back to localStorage')
      
// //       // Fallback - use localStorage
// //       const lastNumber = localStorage.getItem('lastSerialNumber')
// //       let newSerialNumber
      
// //       if (lastNumber && lastNumber.includes('SSY-')) {
// //         const numPart = parseInt(lastNumber.split('-')[1])
// //         if (!isNaN(numPart)) {
// //           newSerialNumber = `SSY-${(numPart + 1).toString().padStart(3, '0')}`
// //         } else {
// //           newSerialNumber = 'SSY-001'
// //         }
// //       } else {
// //         newSerialNumber = 'SSY-001'
// //       }
      
// //       console.log('Fallback serial number:', newSerialNumber)
// //       setSerialNumber(newSerialNumber)
// //       localStorage.setItem('lastSerialNumber', newSerialNumber)
// //     }
// //   }

// //   // Fetch data on component mount
// //   useEffect(() => {
// //     fetchLastSerialNumber()
// //     fetchDropdownOptions()
// //   }, [])

// //   const handleChange = (e) => {
// //     const { name, value } = e.target
// //     setFormData((prev) => ({ ...prev, [name]: value }))
// //   }

// //  const handleSelectChange = (name, value) => {
// //   setFormData((prev) => ({ ...prev, [name]: value }))
  
// //   // NEW: Auto-fill technician contact when technician name is selected
// //   if (name === 'technicianName' && value) {
// //     const selectedTechnician = technicianMapping.find(tech => tech.name === value)
// //     if (selectedTechnician) {
// //       setFormData((prev) => ({ 
// //         ...prev, 
// //         [name]: value,
// //         technicianContact: selectedTechnician.contact
// //       }))
// //       console.log(`Auto-filled contact: ${selectedTechnician.contact} for technician: ${value}`)
// //     }
// //   }
// // }


// //  const handleSubmit = async (e) => {
// //   e.preventDefault()
// //   setIsSubmitting(true)
  
// //   try {
// //     // Get current timestamp
// //     const timestamp = new Date().toLocaleString('en-US', {
// //       year: 'numeric',
// //       month: '2-digit',
// //       day: '2-digit',
// //       hour: '2-digit',
// //       minute: '2-digit',
// //       second: '2-digit',
// //       hour12: true
// //     })
    
// //     // Validate required fields
// //     if (!serialNumber) {
// //       throw new Error('Serial number not generated. Please refresh the page.')
// //     }
    
// //     if (!complaintDate) {
// //       throw new Error('Please select complaint date')
// //     }
    
// //     // आपके sheet structure के अनुसार correct column mapping
// //     const rowData = new Array(60).fill('')

// //     // Based on your image - यह आपकी इमेज के अनुसार सही column mapping है:
// //     // Column A: Timestamp
// //     rowData[0] = timestamp

// //     // Column B: Complaint ID (Serial Number) 
// //     rowData[1] = serialNumber

// //     // Column C: Company Name
// //     rowData[2] = formData.companyName

// //     // Column D: Mode Of Call
// //     rowData[3] = formData.modeOfCall

// //     // Column E: ID Number
// //     rowData[4] = formData.idNumber

// //     // Column F: Project Name
// //     rowData[5] = formData.projectName

// //     // Column G: Complaint Number
// //     rowData[6] = formData.complaintNumber

// //     // Column H: Complaint Date
// //     rowData[7] = complaintDate.toLocaleDateString('en-US')

// //     // Column I: Beneficiary Name
// //     rowData[8] = formData.beneficiaryName

// //     // Column J: Contact Number
// //     rowData[9] = formData.contactNumber

// //     // Column K: Village
// //     rowData[10] = formData.village

// //     // Column L: Block
// //     rowData[11] = formData.block

// //     // Column M: District
// //     rowData[12] = formData.district

// //     // Column N: Product
// //     rowData[13] = formData.product

// //     // Column O: Make
// //     rowData[14] = formData.make

// //     // Column P: Rating
// //     rowData[15] = formData.rating

// //     // Column Q: Qty
// //     rowData[16] = formData.qty

// //     // Column R: Insurance Type
// //     rowData[17] = formData.insuranceType

// //     // Column S: Nature Of Complaint
// //     rowData[18] = formData.natureOfComplaint

// //     // Column T: Technician Name
// //     rowData[19] = formData.technicianName

// //     // Column U: Technician Contact
// //     rowData[20] = formData.technicianContact

// //     // Column V: Assignee Whatsapp Number
// //     rowData[21] = formData.assigneeWhatsapp

// //     console.log('=== SUBMISSION START ===')
// //     console.log('Timestamp:', timestamp)
// //     console.log('Serial Number:', serialNumber)
// //     console.log('Total columns in rowData:', rowData.length)
// //     console.log('First 22 columns:', rowData.slice(0, 22))

// //     // Submit data using FormData (works with doPost)
// //     const formDataToSend = new FormData()
// //     formDataToSend.append('action', 'insertFMS')
// //     formDataToSend.append('sheetName', 'FMS')
// //     formDataToSend.append('rowData', JSON.stringify(rowData))

// //     console.log('Submitting to Google Apps Script...')
// //     console.log('Action: insertFMS')
// //     console.log('Sheet: FMS')

// //     const response = await fetch(
// //       'https://script.google.com/a/macros/rbpindia.com/s/AKfycbwnIMOzsFbniWnPFhl3lzE-2W0l6lD23keuz57-ldS_umSXIJqpEK-qxLE6eM0s7drqrQ/exec',
// //       {
// //         method: 'POST',
// //         body: formDataToSend,
// //         redirect: 'follow'
// //       }
// //     )
    
// //     console.log('Response status:', response.status)
// //     console.log('Response ok:', response.ok)
    
// //     const responseText = await response.text()
// //     console.log('Raw response:', responseText)
    
// //     let result
// //     try {
// //       result = JSON.parse(responseText)
// //       console.log('Parsed result:', result)
      
// //       if (result.success) {
// //         console.log('✅ SUCCESS - Data inserted')
// //         console.log('Complaint ID:', result.complaintId)
// //         console.log('Row Number:', result.rowNumber)
// //       } else {
// //         console.log('❌ FAILED - Server returned error')
// //         console.log('Error:', result.error)
// //         throw new Error(result.error || 'Server returned failure')
// //       }
// //     } catch (parseError) {
// //       console.log('⚠️ Could not parse JSON response')
// //       console.log('Parse error:', parseError.message)
// //       // If response is not JSON, check if it's HTML redirect (success case)
// //       if (responseText.includes('<!DOCTYPE') || response.ok) {
// //         result = { success: true }
// //         console.log('Treating as success (HTML redirect detected)')
// //       } else {
// //         throw new Error('Invalid response from server')
// //       }
// //     }
    
// //     console.log('=== SUBMISSION END ===')
    
// //     setIsSubmitting(false)
// //     alert(`Complaint created successfully!\n\nComplaint ID: ${serialNumber}\nTimestamp: ${timestamp}`)
    
// //     // Reset form
// //     setFormData({
// //       companyName: "",
// //       modeOfCall: "",
// //       idNumber: "",
// //       projectName: "",
// //       complaintNumber: "",
// //       beneficiaryName: "",
// //       contactNumber: "",
// //       village: "",
// //       block: "",
// //       district: "",
// //       product: "",
// //       make: "",
// //       rating: "",
// //       qty: "",
// //       insuranceType: "",
// //       natureOfComplaint: "",
// //       technicianName: "",
// //       technicianContact: "",
// //       assigneeWhatsapp: "",
// //     })
// //     setComplaintDate(null)
    
// //     // Fetch new serial number for next complaint
// //     console.log('Fetching new serial number...')
// //     await fetchLastSerialNumber()
    


// //   } catch (error) {
// //     console.error('❌ SUBMISSION ERROR:', error)
// //     console.error('Error message:', error.message)
// //     console.error('Error stack:', error.stack)
// //     setIsSubmitting(false)
// //     alert(`Failed to create complaint!\n\nError: ${error.message}\n\nPlease check the console and try again.`)
// //   }
// // }

// //   return (
// //     <div className="rounded-lg border-0 shadow-md bg-white">
// //       <div className="p-4 sm:p-6">
// //         {isLoading ? (
// //           <div className="flex justify-center items-center h-24">
// //             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
// //             <span className="ml-2">Loading form data...</span>
// //           </div>
// //         ) : (
// //           <form onSubmit={handleSubmit} className="space-y-6">
// //             {/* Display current serial number */}
// //             {/* <div className="bg-gray-50 p-3 rounded-md">
// //               <p className="text-sm text-gray-600">
// //                 <strong>Complaint ID:</strong> {serialNumber || 'Loading...'}
// //               </p>
// //             </div> */}

// //             <div className="grid gap-6 md:grid-cols-3">
              
// //               <div className="space-y-2">
// //                 <label htmlFor="companyName" className="block text-sm font-medium">
// //                   Company Name *
// //                 </label>
// //                 <select
// //                   id="companyName"
// //                   name="companyName"
// //                   value={formData.companyName}
// //                   onChange={(e) => handleSelectChange("companyName", e.target.value)}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 >
// //                   <option value="">Select company name</option>
// //                   {companyNameOptions.map((option, index) => (
// //                     <option key={`company-${index}`} value={option}>
// //                       {option}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="modeOfCall" className="block text-sm font-medium">
// //                   Mode Of Call *
// //                 </label>
// //                 <select
// //                   id="modeOfCall"
// //                   name="modeOfCall"
// //                   value={formData.modeOfCall}
// //                   onChange={(e) => handleSelectChange("modeOfCall", e.target.value)}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 >
// //                   <option value="">Select mode of call</option>
// //                   {modeOfCallOptions.map((option, index) => (
// //                     <option key={`mode-${index}`} value={option}>
// //                       {option}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="idNumber" className="block text-sm font-medium">
// //                   ID Number *
// //                 </label>
// //                 <input
// //                   id="idNumber"
// //                   name="idNumber"
// //                   placeholder="Enter ID number"
// //                   value={formData.idNumber}
// //                   onChange={handleChange}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="projectName" className="block text-sm font-medium">
// //                   Project Name *
// //                 </label>
// //                 <select
// //                   id="projectName"
// //                   name="projectName"
// //                   value={formData.projectName}
// //                   onChange={(e) => handleSelectChange("projectName", e.target.value)}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 >
// //                   <option value="">Select project name</option>
// //                   {projectNameOptions.map((option, index) => (
// //                     <option key={`project-${index}`} value={option}>
// //                       {option}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="complaintNumber" className="block text-sm font-medium">
// //                   Complaint Number *
// //                 </label>
// //                 <input
// //                   id="complaintNumber"
// //                   name="complaintNumber"
// //                   placeholder="Enter complaint number"
// //                   value={formData.complaintNumber}
// //                   onChange={handleChange}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="complaintDate" className="block text-sm font-medium">
// //                   Complaint Date *
// //                 </label>
// //                 <div className="relative w-full">
// //                   <DatePicker
// //                     id="complaint-date-picker"
// //                     selected={complaintDate}
// //                     onChange={(date) => setComplaintDate(date)}
// //                     className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                     customInput={
// //                       <div className="w-full flex justify-start items-center text-left border border-gray-300 rounded-md py-2 px-3 bg-white cursor-pointer" style={{width: '100%'}}>
// //                         <svg
// //                           xmlns="http://www.w3.org/2000/svg"
// //                           className="mr-2 h-4 w-4"
// //                           width="24"
// //                           height="24"
// //                           viewBox="0 0 24 24"
// //                           fill="none"
// //                           stroke="currentColor"
// //                           strokeWidth="2"
// //                           strokeLinecap="round"
// //                           strokeLinejoin="round"
// //                         >
// //                           <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
// //                           <line x1="16" x2="16" y1="2" y2="6" />
// //                           <line x1="8" x2="8" y1="2" y2="6" />
// //                           <line x1="3" x2="21" y1="10" y2="10" />
// //                         </svg>
// //                         {complaintDate ? complaintDate.toLocaleDateString() : "Select complaint date"}
// //                       </div>
// //                     }
// //                     wrapperClassName="w-full"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="beneficiaryName" className="block text-sm font-medium">
// //                   Beneficiary Name *
// //                 </label>
// //                 <input
// //                   id="beneficiaryName"
// //                   name="beneficiaryName"
// //                   placeholder="Enter beneficiary name"
// //                   value={formData.beneficiaryName}
// //                   onChange={handleChange}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="contactNumber" className="block text-sm font-medium">
// //                   Contact Number *
// //                 </label>
// //                 <input
// //                   id="contactNumber"
// //                   name="contactNumber"
// //                   placeholder="Enter contact number"
// //                   value={formData.contactNumber}
// //                   onChange={handleChange}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="village" className="block text-sm font-medium">
// //                   Village *
// //                 </label>
// //                 <input
// //                   id="village"
// //                   name="village"
// //                   placeholder="Enter village"
// //                   value={formData.village}
// //                   onChange={handleChange}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="block" className="block text-sm font-medium">
// //                   Block *
// //                 </label>
// //                 <input
// //                   id="block"
// //                   name="block"
// //                   placeholder="Enter block"
// //                   value={formData.block}
// //                   onChange={handleChange}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="district" className="block text-sm font-medium">
// //                   District *
// //                 </label>
// //                 <select
// //                   id="district"
// //                   name="district"
// //                   value={formData.district}
// //                   onChange={(e) => handleSelectChange("district", e.target.value)}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 >
// //                   <option value="">Select district</option>
// //                   {districtOptions.map((option, index) => (
// //                     <option key={`district-${index}`} value={option}>
// //                       {option}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="product" className="block text-sm font-medium">
// //                   Product *
// //                 </label>
// //                 <input
// //                   id="product"
// //                   name="product"
// //                   placeholder="Enter product"
// //                   value={formData.product}
// //                   onChange={handleChange}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="make" className="block text-sm font-medium">
// //                   Make *
// //                 </label>
// //                 <input
// //                   id="make"
// //                   name="make"
// //                   placeholder="Enter make"
// //                   value={formData.make}
// //                   onChange={handleChange}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="rating" className="block text-sm font-medium">
// //                   Rating *
// //                 </label>
// //                 <input
// //                   id="rating"
// //                   name="rating"
// //                   placeholder="Enter rating"
// //                   value={formData.rating}
// //                   onChange={handleChange}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="qty" className="block text-sm font-medium">
// //                   Qty *
// //                 </label>
// //                 <input
// //                   id="qty"
// //                   name="qty"
// //                   placeholder="Enter quantity"
// //                   value={formData.qty}
// //                   onChange={handleChange}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 />
// //               </div>

// //               { <div className="space-y-2">
// //                 <label htmlFor="insuranceType" className="block text-sm font-medium">
// //                   Insurance Type *
// //                 </label>
// //                 <select
// //                   id="insuranceType"
// //                   name="insuranceType"
// //                   value={formData.insuranceType}
// //                   onChange={(e) => handleSelectChange("insuranceType", e.target.value)}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 >
// //                   <option value="">Select insurance type</option>
// //                   {insuranceTypeOptions.map((option, index) => (
// //                     <option key={`insurance-${index}`} value={option}>
// //                       {option}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div> }

// //               <div className="space-y-2">
// //                 <label htmlFor="technicianName" className="block text-sm font-medium">
// //                   Technician Name *
// //                 </label>
// //                 <select
// //                   id="technicianName"
// //                   name="technicianName"
// //                   value={formData.technicianName}
// //                   onChange={(e) => handleSelectChange("technicianName", e.target.value)}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 >
// //                   <option value="">Select technician name</option>
// //                   {technicianNameOptions.map((option, index) => (
// //                     <option key={`technician-name-${index}`} value={option}>
// //                       {option}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="technicianContact" className="block text-sm font-medium">
// //                   Technician Contact *
// //                 </label>
// //                 <select
// //                   id="technicianContact"
// //                   name="technicianContact"
// //                   value={formData.technicianContact}
// //                   onChange={(e) => handleSelectChange("technicianContact", e.target.value)}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 >
// //                   <option value="">Select technician contact</option>
// //                   {technicianContactOptions.map((option, index) => (
// //                     <option key={`technician-contact-${index}`} value={option}>
// //                       {option}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               <div className="space-y-2">
// //                 <label htmlFor="assigneeWhatsapp" className="block text-sm font-medium">
// //                   Assignee WhatsApp Number *
// //                 </label>
// //                 <input
// //                   id="assigneeWhatsapp"
// //                   name="assigneeWhatsapp"
// //                   placeholder="Enter assignee WhatsApp number"
// //                   value={formData.assigneeWhatsapp}
// //                   onChange={handleChange}
// //                   required
// //                   className="w-full border border-gray-300 rounded-md py-2 px-3"
// //                 />
// //               </div>
// //             </div>

// //             <div className="space-y-2">
// //               <label htmlFor="natureOfComplaint" className="block text-sm font-medium">
// //                 Nature Of Complaint *
// //               </label>
// //               <textarea
// //                 id="natureOfComplaint"
// //                 name="natureOfComplaint"
// //                 placeholder="Enter detailed description of the complaint"
// //                 value={formData.natureOfComplaint}
// //                 onChange={handleChange}
// //                 rows={4}
// //                 required
// //                 className="w-full border border-gray-300 rounded-md py-2 px-3"
// //               />
// //             </div>

// //             <button
// //               type="submit"
// //               disabled={isSubmitting}
// //               className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md flex items-center justify-center"
// //             >
// //               {isSubmitting ? (
// //                 <>
// //                   <svg
// //                     className="mr-2 h-4 w-4 animate-spin"
// //                     xmlns="http://www.w3.org/2000/svg"
// //                     width="24"
// //                     height="24"
// //                     viewBox="0 0 24 24"
// //                     fill="none"
// //                     stroke="currentColor"
// //                     strokeWidth="2"
// //                     strokeLinecap="round"
// //                     strokeLinejoin="round"
// //                   >
// //                     <path d="M21 12a9 9 0 1 1-6.219-8.56" />
// //                   </svg>
// //                   Creating Complaint...
// //                 </>
// //               ) : (
// //                 "Create Complaint"
// //               )}
// //             </button>
// //           </form>
// //         )}
// //       </div>
// //     </div>
// //   )
// // }

// // export default NewComplaintForm

// "use client"

// import { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import DatePicker from "react-datepicker"
// import "react-datepicker/dist/react-datepicker.css"

// function NewComplaintForm() {
//   const navigate = useNavigate()
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [complaintDate, setComplaintDate] = useState(null)
//   const [challanDate, setChallanDate] = useState(null)
//   const [closeDate, setCloseDate] = useState(null)
//   const [serialNumber, setSerialNumber] = useState('')
  
//   // States for dropdown options from master sheet
//   const [companyNameOptions, setCompanyNameOptions] = useState([])
//   const [districtOptions, setDistrictOptions] = useState([])
//   const [technicianNameOptions, setTechnicianNameOptions] = useState([])
//   const [technicianContactOptions, setTechnicianContactOptions] = useState([])
//   const [insuranceTypeOptions, setInsuranceTypeOptions] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [technicianMapping, setTechnicianMapping] = useState([])

//   const [formData, setFormData] = useState({
//     companyName: "",
//     modeOfCall: "",
//     idNumber: "",
//     projectName: "",
//     complaintNumber: "",
//     beneficiaryName: "",
//     contactNumber: "",
//     village: "",
//     block: "",
//     district: "",
//     product: "",
//     make: "",
//     rating: "",
//     qty: "",
//     controllerRidNo: "",
//     productSlNo: "",
//     insuranceType: "",
//     natureOfComplaint: "",
//     technicianName: "",
//     technicianContact: "",
//     assigneeWhatsapp: "",
//     challanNo: "", // New field added
//   })

// // Fetch dropdown options from the master sheet
// const fetchDropdownOptions = async () => {
//   try {
//     setIsLoading(true)
    
//     const sheetUrl = "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=master"
//     const loginSheetUrl = "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=Login"
    
//     const [masterResponse, loginResponse] = await Promise.all([
//       fetch(sheetUrl),
//       fetch(loginSheetUrl)
//     ])
    
//     const masterText = await masterResponse.text()
//     const loginText = await loginResponse.text()
    
//     // Extract the JSON part from the responses
//     const masterJsonStart = masterText.indexOf('{')
//     const masterJsonEnd = masterText.lastIndexOf('}') + 1
//     const masterData = JSON.parse(masterText.substring(masterJsonStart, masterJsonEnd))
    
//     const loginJsonStart = loginText.indexOf('{')
//     const loginJsonEnd = loginText.lastIndexOf('}') + 1
//     const loginData = JSON.parse(loginText.substring(loginJsonStart, loginJsonEnd))

//     // Process the dropdown data from master sheet
//     if (masterData && masterData.table && masterData.table.rows) {
//       const companyNames = []
//       const districts = []
//       const insuranceTypes = []
      
//       masterData.table.rows.forEach((row, index) => {
//         if (row.c) {
//           // Column A: Company Name
//           if (row.c[0] && row.c[0].v !== null && row.c[0].v !== "" && row.c[0].v !== "Company Name") {
//             companyNames.push(row.c[0].v)
//           }
          
//           // Column D: District
//           if (row.c[3] && row.c[3].v !== null && row.c[3].v !== "" && row.c[3].v !== "District") {
//             districts.push(row.c[3].v)
//           }
          
//           // Column G: Insurance Type
//           if (row.c[6] && row.c[6].v !== null && row.c[6].v !== "" && row.c[6].v !== "Insurance Type") {
//             insuranceTypes.push(row.c[6].v)
//           }
//         }
//       })
      
//       // Remove duplicates and set the dropdown options
//       setCompanyNameOptions([...new Set(companyNames)])
//       setDistrictOptions([...new Set(districts)])
//       setInsuranceTypeOptions([...new Set(insuranceTypes)])
//     }

//     // Process technician data from Login sheet
//     if (loginData && loginData.table && loginData.table.rows) {
//       const technicianNames = []
//       const technicianContacts = []
//       const technicianMapping = []
      
//       // Get current logged-in user from localStorage
//       const currentUser = localStorage.getItem('currentUser')
//       const userRole = localStorage.getItem('userRole')
      
//       console.log("Current logged in user:", currentUser)
//       console.log("User role:", userRole)
      
//       loginData.table.rows.forEach((row, index) => {
//         if (row.c) {
//           // Column A: Technician Name (from Login sheet)
//           const techName = row.c[0] && row.c[0].v !== null && row.c[0].v !== "" && row.c[0].v !== "Name" ? row.c[0].v : null
          
//           // Column E: Role (from Login sheet)
//           const role = row.c[4] && row.c[4].v !== null && row.c[4].v !== "" && row.c[4].v !== "Role" ? row.c[4].v.toLowerCase() : null
          
//           // Column F: Technician Contact (from Login sheet)
//           const techContact = row.c[5] && row.c[5].v !== null && row.c[5].v !== "" && row.c[5].v !== "Contact" ? row.c[5].v : null
          
//           if (techName && techContact) {
//             // If user is admin or regular user, show all technicians
//             if (userRole === 'admin' || userRole === 'user') {
//               technicianNames.push(techName)
//               technicianContacts.push(techContact)
//               technicianMapping.push({
//                 name: techName,
//                 contact: techContact
//               })
//             } 
//             // If role is 'tech', show only their own name
//             else if (userRole === 'tech' && role === 'tech' && currentUser && techName.toLowerCase() === currentUser.toLowerCase()) {
//               technicianNames.push(techName)
//               technicianContacts.push(techContact)
//               technicianMapping.push({
//                 name: techName,
//                 contact: techContact
//               })
              
//               // Auto-fill the form with tech's data
//               setFormData(prev => ({
//                 ...prev,
//                 technicianName: techName,
//                 technicianContact: techContact
//               }))
//             }
//           }
//         }
//       })
      
//       // Remove duplicates and set technician options
//       setTechnicianNameOptions([...new Set(technicianNames)])
//       setTechnicianContactOptions([...new Set(technicianContacts)])
//       setTechnicianMapping(technicianMapping)
      
//       console.log("Technician mapping loaded:", technicianMapping)
//       console.log("User role:", userRole)
//       console.log("Current user:", currentUser)
//     }
//   } catch (error) {
//     console.error('Error fetching dropdown options:', error)
//     // Fallback options
//     const fallbackMapping = [
//       { name: 'Technician 1', contact: '9876543210' },
//       { name: 'Technician 2', contact: '9876543211' },
//       { name: 'Technician 3', contact: '9876543212' }
//     ]
    
//     setTechnicianNameOptions(['Technician 1', 'Technician 2', 'Technician 3'])
//     setTechnicianContactOptions(['9876543210', '9876543211', '9876543212'])
//     setTechnicianMapping(fallbackMapping)
//   } finally {
//     setIsLoading(false)
//   }
// }

//   // Fetch the last serial number from the sheet - CT format के साथ
//   const fetchLastSerialNumber = async () => {
//     try {
//       const scriptUrl = `https://script.google.com/a/macros/rbpindia.com/s/AKfycbwnIMOzsFbniWnPFhl3lzE-2W0l6lD23keuz57-ldS_umSXIJqpEK-qxLE6eM0s7drqrQ/exec?action=getLastSerialNumber&sheetName=FMS`
      
//       console.log('Fetching from:', scriptUrl)
      
//       const response = await fetch(scriptUrl, {
//         method: 'GET',
//         headers: {
//           'Accept': 'application/json',
//         }
//       })
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }
      
//       const responseText = await response.text()
//       console.log('Raw response:', responseText)
      
//       let data
//       try {
//         data = JSON.parse(responseText)
//       } catch (parseError) {
//         console.error('JSON parse error:', parseError)
//         throw new Error("Response is not valid JSON")
//       }
      
//       console.log('Parsed data:', data)
      
//       if (data.success && typeof data.lastSerialNumber !== 'undefined') {
//         const lastNumber = data.lastSerialNumber
//         let newSerialNumber
        
//         // CT format के लिए बदलाव
//         if (lastNumber && lastNumber.toString().includes('CT-')) {
//           const numPart = parseInt(lastNumber.toString().split('-')[1])
//           if (!isNaN(numPart)) {
//             newSerialNumber = `CT-${(numPart + 1).toString().padStart(3, '0')}`
//           } else {
//             newSerialNumber = 'CT-001'
//           }
//         } else {
//           newSerialNumber = 'CT-001'
//         }
        
//         console.log('Generated serial number:', newSerialNumber)
//         setSerialNumber(newSerialNumber)
//         localStorage.setItem('lastSerialNumber', newSerialNumber)
//         return
//       }
      
//       throw new Error(data.error || "Failed to get serial number from response")
//     } catch (error) {
//       console.error('Error fetching serial number:', error)
//       console.log('Falling back to localStorage')
      
//       // Fallback - use localStorage
//       const lastNumber = localStorage.getItem('lastSerialNumber')
//       let newSerialNumber
      
//       if (lastNumber && lastNumber.includes('CT-')) {
//         const numPart = parseInt(lastNumber.split('-')[1])
//         if (!isNaN(numPart)) {
//           newSerialNumber = `CT-${(numPart + 1).toString().padStart(3, '0')}`
//         } else {
//           newSerialNumber = 'CT-001'
//         }
//       } else {
//         newSerialNumber = 'CT-001'
//       }
      
//       console.log('Fallback serial number:', newSerialNumber)
//       setSerialNumber(newSerialNumber)
//       localStorage.setItem('lastSerialNumber', newSerialNumber)
//     }
//   }

//   // Fetch data on component mount
//   useEffect(() => {
//     fetchLastSerialNumber()
//     fetchDropdownOptions()
//   }, [])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//  const handleSelectChange = (name, value) => {
//   setFormData((prev) => ({ ...prev, [name]: value }))
  
//   // AUTO-FILL technician contact when technician name is selected
//   if (name === 'technicianName' && value) {
//     const selectedTechnician = technicianMapping.find(tech => tech.name === value)
//     if (selectedTechnician) {
//       setFormData((prev) => ({ 
//         ...prev, 
//         [name]: value,
//         technicianContact: selectedTechnician.contact
//       }))
//       console.log(`Auto-filled contact: ${selectedTechnician.contact} for technician: ${value}`)
//     }
//   }
// }

//  const handleSubmit = async (e) => {
//   e.preventDefault()
//   setIsSubmitting(true)
  
//   try {
//     // Get current timestamp
//     const timestamp = new Date().toLocaleString('en-US', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//       hour12: true
//     })
    
//     // Validate only essential fields (no more mandatory validation for all fields)
//     if (!serialNumber) {
//       throw new Error('Serial number not generated. Please refresh the page.')
//     }
    
//     // आपके sheet structure के अनुसार correct column mapping
//     const rowData = new Array(60).fill('')

//     // Based on your image - यह आपकी इमेज के अनुसार सही column mapping है:
//     // Column A: Timestamp
//     rowData[0] = timestamp

//     // Column B: Complaint ID (Serial Number) 
//     rowData[1] = serialNumber

//     // Column C: Company Name
//     rowData[2] = formData.companyName

//     // Column D: Mode Of Call (अब input field है)
//     rowData[3] = formData.modeOfCall

//     // Column E: ID Number
//     rowData[4] = formData.idNumber

//     // Column F: Project Name (अब input field है)
//     rowData[5] = formData.projectName

//     // Column G: Complaint Number
//     rowData[6] = formData.complaintNumber

//     // Column H: Complaint Date
//     rowData[7] = complaintDate ? complaintDate.toLocaleDateString('en-US') : ''

//     // Column I: Beneficiary Name
//     rowData[8] = formData.beneficiaryName

//     // Column J: Contact Number
//     rowData[9] = formData.contactNumber

//     // Column K: Village
//     rowData[10] = formData.village

//     // Column L: Block
//     rowData[11] = formData.block

//     // Column M: District
//     rowData[12] = formData.district

//     // Column N: Product
//     rowData[13] = formData.product

//     // Column O: Make
//     rowData[14] = formData.make

//     // Column P: Rating
//     rowData[15] = formData.rating

//     // Column Q: Qty
//     rowData[16] = formData.qty

//     // Column R: Insurance Type
//     rowData[17] = formData.insuranceType

//     // Column S: Nature Of Complaint
//     rowData[18] = formData.natureOfComplaint

//     // Column T: Technician Name
//     rowData[19] = formData.technicianName

//     // Column U: Technician Contact
//     rowData[20] = formData.technicianContact

//     // Column V: Assignee Whatsapp Number
//     rowData[21] = formData.assigneeWhatsapp

//     // NEW FIELDS - Column AB: Controller RID No (index 27)
//     rowData[27] = formData.controllerRidNo

//     // NEW FIELDS - Column AC: Product SL No (index 28)
//     rowData[28] = formData.productSlNo

//     // NEW FIELDS - Column AD: Challan Date (index 29)
//     rowData[29] = challanDate ? challanDate.toLocaleDateString('en-US') : ''

//     // NEW FIELDS - Column AE: Close Date (index 30)
//     rowData[30] = closeDate ? closeDate.toLocaleDateString('en-US') : ''

//     // NEW FIELD - Column AF: Challan No (index 31)
//     rowData[31] = formData.challanNo

//     console.log('=== SUBMISSION START ===')
//     console.log('Timestamp:', timestamp)
//     console.log('Serial Number:', serialNumber)
//     console.log('Total columns in rowData:', rowData.length)
//     console.log('First 32 columns:', rowData.slice(0, 32))

//     // Submit data using FormData (works with doPost)
//     const formDataToSend = new FormData()
//     formDataToSend.append('action', 'insertFMS')
//     formDataToSend.append('sheetName', 'FMS')
//     formDataToSend.append('rowData', JSON.stringify(rowData))

//     console.log('Submitting to Google Apps Script...')
//     console.log('Action: insertFMS')
//     console.log('Sheet: FMS')

//     const response = await fetch(
//       'https://script.google.com/a/macros/rbpindia.com/s/AKfycbwnIMOzsFbniWnPFhl3lzE-2W0l6lD23keuz57-ldS_umSXIJqpEK-qxLE6eM0s7drqrQ/exec',
//       {
//         method: 'POST',
//         body: formDataToSend,
//         redirect: 'follow'
//       }
//     )
    
//     console.log('Response status:', response.status)
//     console.log('Response ok:', response.ok)
    
//     const responseText = await response.text()
//     console.log('Raw response:', responseText)
    
//     let result
//     try {
//       result = JSON.parse(responseText)
//       console.log('Parsed result:', result)
      
//       if (result.success) {
//         console.log('✅ SUCCESS - Data inserted')
//         console.log('Complaint ID:', result.complaintId)
//         console.log('Row Number:', result.rowNumber)
//       } else {
//         console.log('❌ FAILED - Server returned error')
//         console.log('Error:', result.error)
//         throw new Error(result.error || 'Server returned failure')
//       }
//     } catch (parseError) {
//       console.log('⚠️ Could not parse JSON response')
//       console.log('Parse error:', parseError.message)
//       // If response is not JSON, check if it's HTML redirect (success case)
//       if (responseText.includes('<!DOCTYPE') || response.ok) {
//         result = { success: true }
//         console.log('Treating as success (HTML redirect detected)')
//       } else {
//         throw new Error('Invalid response from server')
//       }
//     }
    
//     console.log('=== SUBMISSION END ===')
    
//     setIsSubmitting(false)
//     alert(`Complaint created successfully!\n\nComplaint ID: ${serialNumber}\nTimestamp: ${timestamp}`)
    
//     // Reset form
//     setFormData({
//       companyName: "",
//       modeOfCall: "",
//       idNumber: "",
//       projectName: "",
//       complaintNumber: "",
//       beneficiaryName: "",
//       contactNumber: "",
//       village: "",
//       block: "",
//       district: "",
//       product: "",
//       make: "",
//       rating: "",
//       qty: "",
//       controllerRidNo: "",
//       productSlNo: "",
//       insuranceType: "",
//       natureOfComplaint: "",
//       technicianName: "",
//       technicianContact: "",
//       assigneeWhatsapp: "",
//       challanNo: "", // Reset new field
//     })
//     setComplaintDate(null)
//     setChallanDate(null)
//     setCloseDate(null)
    
//     // Fetch new serial number for next complaint
//     console.log('Fetching new serial number...')
//     await fetchLastSerialNumber()

//   } catch (error) {
//     console.error('❌ SUBMISSION ERROR:', error)
//     console.error('Error message:', error.message)
//     console.error('Error stack:', error.stack)
//     setIsSubmitting(false)
//     alert(`Failed to create complaint!\n\nError: ${error.message}\n\nPlease check the console and try again.`)
//   }
// }

//   return (
//     <div className="rounded-lg border-0 shadow-md bg-white">
//       <div className="p-4 sm:p-6">
//         {isLoading ? (
//           <div className="flex justify-center items-center h-24">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//             <span className="ml-2">Loading form data...</span>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid gap-6 md:grid-cols-3">
              
//               <div className="space-y-2">
//                 <label htmlFor="companyName" className="block text-sm font-medium">
//                   Company Name
//                 </label>
//                 <select
//                   id="companyName"
//                   name="companyName"
//                   value={formData.companyName}
//                   onChange={(e) => handleSelectChange("companyName", e.target.value)}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 >
//                   <option value="">Select company name</option>
//                   {companyNameOptions.map((option, index) => (
//                     <option key={`company-${index}`} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Mode Of Call - अब input field है */}
//               <div className="space-y-2">
//                 <label htmlFor="modeOfCall" className="block text-sm font-medium">
//                   Mode Of Call
//                 </label>
//                 <input
//                   id="modeOfCall"
//                   name="modeOfCall"
//                   placeholder="Enter mode of call"
//                   value={formData.modeOfCall}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="idNumber" className="block text-sm font-medium">
//                   ID Number
//                 </label>
//                 <input
//                   id="idNumber"
//                   name="idNumber"
//                   placeholder="Enter ID number"
//                   value={formData.idNumber}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               {/* Project Name - अब input field है */}
//               <div className="space-y-2">
//                 <label htmlFor="projectName" className="block text-sm font-medium">
//                   Project Name
//                 </label>
//                 <input
//                   id="projectName"
//                   name="projectName"
//                   placeholder="Enter project name"
//                   value={formData.projectName}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="complaintNumber" className="block text-sm font-medium">
//                   Complaint Number
//                 </label>
//                 <input
//                   id="complaintNumber"
//                   name="complaintNumber"
//                   placeholder="Enter complaint number"
//                   value={formData.complaintNumber}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="complaintDate" className="block text-sm font-medium">
//                   Complaint Date
//                 </label>
//                 <div className="relative w-full">
//                   <DatePicker
//                     id="complaint-date-picker"
//                     selected={complaintDate}
//                     onChange={(date) => setComplaintDate(date)}
//                     className="w-full border border-gray-300 rounded-md py-2 px-3"
//                     customInput={
//                       <div className="w-full flex justify-start items-center text-left border border-gray-300 rounded-md py-2 px-3 bg-white cursor-pointer" style={{width: '100%'}}>
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           className="mr-2 h-4 w-4"
//                           width="24"
//                           height="24"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         >
//                           <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
//                           <line x1="16" x2="16" y1="2" y2="6" />
//                           <line x1="8" x2="8" y1="2" y2="6" />
//                           <line x1="3" x2="21" y1="10" y2="10" />
//                         </svg>
//                         {complaintDate ? complaintDate.toLocaleDateString() : "Select complaint date"}
//                       </div>
//                     }
//                     wrapperClassName="w-full"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="beneficiaryName" className="block text-sm font-medium">
//                   Beneficiary Name
//                 </label>
//                 <input
//                   id="beneficiaryName"
//                   name="beneficiaryName"
//                   placeholder="Enter beneficiary name"
//                   value={formData.beneficiaryName}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="contactNumber" className="block text-sm font-medium">
//                   Contact Number
//                 </label>
//                 <input
//                   id="contactNumber"
//                   name="contactNumber"
//                   placeholder="Enter contact number"
//                   value={formData.contactNumber}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="village" className="block text-sm font-medium">
//                   Village
//                 </label>
//                 <input
//                   id="village"
//                   name="village"
//                   placeholder="Enter village"
//                   value={formData.village}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="block" className="block text-sm font-medium">
//                   Block
//                 </label>
//                 <input
//                   id="block"
//                   name="block"
//                   placeholder="Enter block"
//                   value={formData.block}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="district" className="block text-sm font-medium">
//                   District
//                 </label>
//                 <select
//                   id="district"
//                   name="district"
//                   value={formData.district}
//                   onChange={(e) => handleSelectChange("district", e.target.value)}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 >
//                   <option value="">Select district</option>
//                   {districtOptions.map((option, index) => (
//                     <option key={`district-${index}`} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="product" className="block text-sm font-medium">
//                   Product
//                 </label>
//                 <input
//                   id="product"
//                   name="product"
//                   placeholder="Enter product"
//                   value={formData.product}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="make" className="block text-sm font-medium">
//                   Make
//                 </label>
//                 <input
//                   id="make"
//                   name="make"
//                   placeholder="Enter make"
//                   value={formData.make}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="rating" className="block text-sm font-medium">
//                   Rating
//                 </label>
//                 <input
//                   id="rating"
//                   name="rating"
//                   placeholder="Enter rating"
//                   value={formData.rating}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="qty" className="block text-sm font-medium">
//                   Qty
//                 </label>
//                 <input
//                   id="qty"
//                   name="qty"
//                   placeholder="Enter quantity"
//                   value={formData.qty}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               {/* NEW FIELD: Controller RID No */}
//               <div className="space-y-2">
//                 <label htmlFor="controllerRidNo" className="block text-sm font-medium">
//                   Controller RID No
//                 </label>
//                 <input
//                   id="controllerRidNo"
//                   name="controllerRidNo"
//                   placeholder="Enter controller RID number"
//                   value={formData.controllerRidNo}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               {/* NEW FIELD: Product SL No */}
//               <div className="space-y-2">
//                 <label htmlFor="productSlNo" className="block text-sm font-medium">
//                   Product SL No
//                 </label>
//                 <input
//                   id="productSlNo"
//                   name="productSlNo"
//                   placeholder="Enter product serial number"
//                   value={formData.productSlNo}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="insuranceType" className="block text-sm font-medium">
//                   Insurance Type
//                 </label>
//                 <select
//                   id="insuranceType"
//                   name="insuranceType"
//                   value={formData.insuranceType}
//                   onChange={(e) => handleSelectChange("insuranceType", e.target.value)}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 >
//                   <option value="">Select insurance type</option>
//                   {insuranceTypeOptions.map((option, index) => (
//                     <option key={`insurance-${index}`} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="technicianName" className="block text-sm font-medium">
//                   Technician Name
//                 </label>
//                 <select
//                   id="technicianName"
//                   name="technicianName"
//                   value={formData.technicianName}
//                   onChange={(e) => handleSelectChange("technicianName", e.target.value)}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 >
//                   <option value="">Select technician name</option>
//                   {technicianNameOptions.map((option, index) => (
//                     <option key={`technician-name-${index}`} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="technicianContact" className="block text-sm font-medium">
//                   Technician Contact
//                 </label>
//                 <select
//                   id="technicianContact"
//                   name="technicianContact"
//                   value={formData.technicianContact}
//                   onChange={(e) => handleSelectChange("technicianContact", e.target.value)}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 >
//                   <option value="">Select technician contact</option>
//                   {technicianContactOptions.map((option, index) => (
//                     <option key={`technician-contact-${index}`} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="assigneeWhatsapp" className="block text-sm font-medium">
//                   Assignee WhatsApp Number
//                 </label>
//                 <input
//                   id="assigneeWhatsapp"
//                   name="assigneeWhatsapp"
//                   placeholder="Enter assignee WhatsApp number"
//                   value={formData.assigneeWhatsapp}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               {/* NEW FIELD: Challan Date */}
//               <div className="space-y-2">
//                 <label htmlFor="challanDate" className="block text-sm font-medium">
//                   Challan Date
//                 </label>
//                 <div className="relative w-full">
//                   <DatePicker
//                     id="challan-date-picker"
//                     selected={challanDate}
//                     onChange={(date) => setChallanDate(date)}
//                     className="w-full border border-gray-300 rounded-md py-2 px-3"
//                     customInput={
//                       <div className="w-full flex justify-start items-center text-left border border-gray-300 rounded-md py-2 px-3 bg-white cursor-pointer" style={{width: '100%'}}>
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           className="mr-2 h-4 w-4"
//                           width="24"
//                           height="24"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         >
//                           <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
//                           <line x1="16" x2="16" y1="2" y2="6" />
//                           <line x1="8" x2="8" y1="2" y2="6" />
//                           <line x1="3" x2="21" y1="10" y2="10" />
//                         </svg>
//                         {challanDate ? challanDate.toLocaleDateString() : "Select challan date"}
//                       </div>
//                     }
//                     wrapperClassName="w-full"
//                   />
//                 </div>
//               </div>

//               {/* NEW FIELD: Close Date */}
//               <div className="space-y-2">
//                 <label htmlFor="closeDate" className="block text-sm font-medium">
//                   Close Date
//                 </label>
//                 <div className="relative w-full">
//                   <DatePicker
//                     id="close-date-picker"
//                     selected={closeDate}
//                     onChange={(date) => setCloseDate(date)}
//                     className="w-full border border-gray-300 rounded-md py-2 px-3"
//                     customInput={
//                       <div className="w-full flex justify-start items-center text-left border border-gray-300 rounded-md py-2 px-3 bg-white cursor-pointer" style={{width: '100%'}}>
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           className="mr-2 h-4 w-4"
//                           width="24"
//                           height="24"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         >
//                           <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
//                           <line x1="16" x2="16" y1="2" y2="6" />
//                           <line x1="8" x2="8" y1="2" y2="6" />
//                           <line x1="3" x2="21" y1="10" y2="10" />
//                         </svg>
//                         {closeDate ? closeDate.toLocaleDateString() : "Select close date"}
//                       </div>
//                     }
//                     wrapperClassName="w-full"
//                   />
//                 </div>
//               </div>

//               {/* NEW FIELD: Challan No */}
//               <div className="space-y-2">
//                 <label htmlFor="challanNo" className="block text-sm font-medium">
//                   Challan No
//                 </label>
//                 <input
//                   id="challanNo"
//                   name="challanNo"
//                   placeholder="Enter challan number"
//                   value={formData.challanNo}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="natureOfComplaint" className="block text-sm font-medium">
//                 Nature Of Complaint
//               </label>
//               <textarea
//                 id="natureOfComplaint"
//                 name="natureOfComplaint"
//                 placeholder="Enter detailed description of the complaint"
//                 value={formData.natureOfComplaint}
//                 onChange={handleChange}
//                 rows={4}
//                 className="w-full border border-gray-300 rounded-md py-2 px-3"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md flex items-center justify-center"
//             >
//               {isSubmitting ? (
//                 <>
//                   <svg
//                     className="mr-2 h-4 w-4 animate-spin"
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="24"
//                     height="24"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M21 12a9 9 0 1 1-6.219-8.56" />
//                   </svg>
//                   Creating Complaint...
//                 </>
//               ) : (
//                 "Create Complaint"
//               )}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   )
// }

// export default NewComplaintForm


"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

function NewComplaintForm() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [complaintDate, setComplaintDate] = useState(null)
  const [challanDate, setChallanDate] = useState(null)
  const [closeDate, setCloseDate] = useState(null)
  const [serialNumber, setSerialNumber] = useState('')
  
  // States for inline table editing
  const [showForm, setShowForm] = useState(false)
  const [tableData, setTableData] = useState([])
  const [editingRows, setEditingRows] = useState({})
  const [editedData, setEditedData] = useState({})
  const [dataError, setDataError] = useState(null)
  
  // States for dropdown options
  const [companyNameOptions, setCompanyNameOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [technicianNameOptions, setTechnicianNameOptions] = useState([])
  const [technicianContactOptions, setTechnicianContactOptions] = useState([])
  const [insuranceTypeOptions, setInsuranceTypeOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [technicianMapping, setTechnicianMapping] = useState([])

  // Auto-refresh states
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds default

  const [formData, setFormData] = useState({
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
    rating: "",
    qty: "",
    controllerRidNo: "",
    productSlNo: "",
    insuranceType: "",
    natureOfComplaint: "",
    technicianName: "",
    technicianContact: "",
    assigneeWhatsapp: "",
    challanNo: "",
  })

  // ✅ Generate serial number on component mount
  useEffect(() => {
    const generateSerialNumber = () => {
      const now = new Date()
      const year = now.getFullYear().toString().slice(-2)
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const day = now.getDate().toString().padStart(2, '0')
      const hour = now.getHours().toString().padStart(2, '0')
      const minute = now.getMinutes().toString().padStart(2, '0')
      const second = now.getSeconds().toString().padStart(2, '0')
      const serial = `RBPST-${year}${month}${day}${hour}${minute}${second}`
      setSerialNumber(serial)
    }
    
    generateSerialNumber()
  }, [])

  // ✅ COMPLETE Column definitions with ALL form fields
  const tableColumns = [
    { key: 0, label: "Row #", field: "rowNumber", editable: false },
    { key: 1, label: "Timestamp", field: "timestamp", editable: false },
    { key: 2, label: "Complaint ID", field: "complaintId", editable: false },
    { key: 3, label: "Company Name", field: "companyName", editable: true, type: "select" },
    { key: 4, label: "Mode of Call", field: "modeOfCall", editable: true, type: "text" },
    { key: 5, label: "ID Number", field: "idNumber", editable: true, type: "text" },
    { key: 6, label: "Project Name", field: "projectName", editable: true, type: "text" },
    { key: 7, label: "Complaint Number", field: "complaintNumber", editable: true, type: "text" },
    { key: 8, label: "Complaint Date", field: "complaintDate", editable: true, type: "date" },
    { key: 9, label: "Beneficiary Name", field: "beneficiaryName", editable: true, type: "text" },
    { key: 10, label: "Contact Number", field: "contactNumber", editable: true, type: "text" },
    { key: 11, label: "Village", field: "village", editable: true, type: "text" },
    { key: 12, label: "Block", field: "block", editable: true, type: "text" },
    { key: 13, label: "District", field: "district", editable: true, type: "select" },
    { key: 14, label: "Product", field: "product", editable: true, type: "text" },
    { key: 15, label: "Make", field: "make", editable: true, type: "text" },
    { key: 16, label: "Rating", field: "rating", editable: true, type: "text" },
    { key: 17, label: "Qty", field: "qty", editable: true, type: "text" },
    { key: 18, label: "Insurance Type", field: "insuranceType", editable: true, type: "select" },
    { key: 19, label: "Nature of Complaint", field: "natureOfComplaint", editable: true, type: "textarea" },
    { key: 20, label: "Technician Name", field: "technicianName", editable: true, type: "select" },
    { key: 21, label: "Technician Contact", field: "technicianContact", editable: true, type: "select" },
    { key: 22, label: "Assignee WhatsApp", field: "assigneeWhatsapp", editable: true, type: "text" },
    { key: 28, label: "Controller RID No", field: "controllerRidNo", editable: true, type: "text" },
    { key: 29, label: "Product SL No", field: "productSlNo", editable: true, type: "text" },
    { key: 30, label: "Challan Date", field: "challanDate", editable: true, type: "date" },
    { key: 31, label: "Close Date", field: "closeDate", editable: true, type: "date" },
    { key: 32, label: "Challan No", field: "challanNo", editable: true, type: "text" },
  ]

  // Fetch dropdown options from the master sheet
  const fetchDropdownOptions = async () => {
    try {
      setIsLoading(true)
      
      const sheetUrl = "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=master"
      const loginSheetUrl = "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=Login"
      
      const [masterResponse, loginResponse] = await Promise.all([
        fetch(sheetUrl),
        fetch(loginSheetUrl)
      ])
      
      const masterText = await masterResponse.text()
      const loginText = await loginResponse.text()
      
      const masterJsonStart = masterText.indexOf('{')
      const masterJsonEnd = masterText.lastIndexOf('}') + 1
      const masterData = JSON.parse(masterText.substring(masterJsonStart, masterJsonEnd))
      
      const loginJsonStart = loginText.indexOf('{')
      const loginJsonEnd = loginText.lastIndexOf('}') + 1
      const loginData = JSON.parse(loginText.substring(loginJsonStart, loginJsonEnd))

      // Process dropdown data
      if (masterData && masterData.table && masterData.table.rows) {
        const companyNames = []
        const districts = []
        const insuranceTypes = []
        
        masterData.table.rows.forEach((row) => {
          if (row.c) {
            if (row.c[0] && row.c[0].v && row.c[0].v !== "Company Name") {
              companyNames.push(row.c[0].v)
            }
            if (row.c[3] && row.c[3].v && row.c[3].v !== "District") {
              districts.push(row.c[3].v)
            }
            if (row.c[6] && row.c[6].v && row.c[6].v !== "Insurance Type") {
              insuranceTypes.push(row.c[6].v)
            }
          }
        })
        
        setCompanyNameOptions([...new Set(companyNames)])
        setDistrictOptions([...new Set(districts)])
        setInsuranceTypeOptions([...new Set(insuranceTypes)])
      }

      // Process technician data
      if (loginData && loginData.table && loginData.table.rows) {
        const technicianNames = []
        const technicianContacts = []
        const technicianMapping = []
        
        const currentUser = localStorage.getItem('currentUser')
        const userRole = localStorage.getItem('userRole')
        
        loginData.table.rows.forEach((row) => {
          if (row.c) {
            const techName = row.c[0] && row.c[0].v && row.c[0].v !== "Name" ? row.c[0].v : null
            const role = row.c[4] && row.c[4].v && row.c[4].v !== "Role" ? row.c[4].v.toLowerCase() : null
            const techContact = row.c[5] && row.c[5].v && row.c[5].v !== "Contact" ? row.c[5].v : null
            
            if (techName && techContact) {
              if (userRole === 'admin' || userRole === 'user') {
                technicianNames.push(techName)
                technicianContacts.push(techContact)
                technicianMapping.push({ name: techName, contact: techContact })
              } 
              else if (userRole === 'tech' && role === 'tech' && currentUser && techName.toLowerCase() === currentUser.toLowerCase()) {
                technicianNames.push(techName)
                technicianContacts.push(techContact)
                technicianMapping.push({ name: techName, contact: techContact })
                
                setFormData(prev => ({
                  ...prev,
                  technicianName: techName,
                  technicianContact: techContact
                }))
              }
            }
          }
        })
        
        setTechnicianNameOptions([...new Set(technicianNames)])
        setTechnicianContactOptions([...new Set(technicianContacts)])
        setTechnicianMapping(technicianMapping)
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error)
      setDataError('Error loading form options')
    } finally {
      setIsLoading(false)
    }
  }

 const fetchTableData = useCallback(async () => {
  try {
    setDataError(null)
    console.log('Fetching table data from index 6...')
    
    const currentUser = localStorage.getItem('currentUser')
    const userRole = localStorage.getItem('userRole')
    
    const response = await fetch(
      'https://script.google.com/a/macros/rbpindia.com/s/AKfycbwnIMOzsFbniWnPFhl3lzE-2W0l6lD23keuz57-ldS_umSXIJqpEK-qxLE6eM0s7drqrQ/exec?action=getAllData&sheetName=FMS',
      { 
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    )
    
    console.log('Response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const responseText = await response.text()
    console.log('Raw response length:', responseText.length)
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      throw new Error('Invalid JSON response from server')
    }
    
    console.log('Parsed data success:', data.success)
    console.log('Data length:', data.data ? data.data.length : 'No data array')
    
    if (data.success && data.data) {
      let filteredData = data.data
      
      // ✅ ROLE-BASED FILTERING
      if (userRole === 'tech' && currentUser) {
        // Column T (index 20) में technician name match करो
        filteredData = data.data.filter(row => {
          const technicianName = row[20] // Column T = index 20
          return technicianName && technicianName.toLowerCase() === currentUser.toLowerCase()
        })
        console.log(`Tech user filtered data: ${filteredData.length} rows`)
      } else if (userRole === 'admin' || userRole === 'user') {
        // Admin और User को सारा data दिखाओ
        filteredData = data.data
        console.log(`Admin/User full data: ${filteredData.length} rows`)
      }
      
      setTableData(filteredData)
      
      if (filteredData.length === 0) {
        setDataError(userRole === 'tech' 
          ? 'No complaints assigned to you' 
          : 'No complaints found starting from row 7')
      }
    } else {
      throw new Error(data.error || 'Failed to fetch data from server')
    }
  } catch (error) {
    console.error('Error fetching table data:', error)
    setDataError(error.message)
  }
}, [])

  // ✅ AUTO-REFRESH EFFECT - Properly manages intervals
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchTableData()
      }, refreshInterval)
      
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, fetchTableData])

  // Component mount effects
  useEffect(() => {
    const initializeData = async () => {
      await fetchDropdownOptions()
      await fetchTableData()
    }
    
    initializeData()
  }, [fetchTableData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    if (name === 'technicianName' && value) {
      const selectedTechnician = technicianMapping.find(tech => tech.name === value)
      if (selectedTechnician) {
        setFormData((prev) => ({ 
          ...prev, 
          [name]: value,
          technicianContact: selectedTechnician.contact
        }))
      }
    }
  }

  // ✅ FIXED checkbox toggle - proper state management
  const handleEditToggle = (rowIndex) => {
    console.log('Toggle edit for row:', rowIndex)
    
    setEditingRows(prev => {
      const newEditingRows = { ...prev }
      
      if (newEditingRows[rowIndex]) {
        // Turning OFF editing
        delete newEditingRows[rowIndex]
        
        // Clear edited data for this row
        setEditedData(prev => {
          const newEditedData = { ...prev }
          delete newEditedData[rowIndex]
          return newEditedData
        })
        
        console.log('Editing OFF for row:', rowIndex)
      } else {
        // Turning ON editing
        newEditingRows[rowIndex] = true
        
        // Initialize edited data with current row data
        const currentRow = tableData[rowIndex]
        console.log('Initializing edit data for row:', rowIndex, currentRow)
        
        setEditedData(prev => ({
          ...prev,
          [rowIndex]: {
            companyName: currentRow[3] || "",
            modeOfCall: currentRow[4] || "",
            idNumber: currentRow[5] || "",
            projectName: currentRow[6] || "",
            complaintNumber: currentRow[7] || "",
            complaintDate: currentRow[8] ? new Date(currentRow[8]) : null,
            beneficiaryName: currentRow[9] || "",
            contactNumber: currentRow[10] || "",
            village: currentRow[11] || "",
            block: currentRow[12] || "",
            district: currentRow[13] || "",
            product: currentRow[14] || "",
            make: currentRow[15] || "",
            rating: currentRow[16] || "",
            qty: currentRow[17] || "",
            insuranceType: currentRow[18] || "",
            natureOfComplaint: currentRow[19] || "",
            technicianName: currentRow[20] || "",
            technicianContact: currentRow[21] || "",
            assigneeWhatsapp: currentRow[22] || "",
            controllerRidNo: currentRow[28] || "",
            productSlNo: currentRow[29] || "",
            challanDate: currentRow[30] ? new Date(currentRow[30]) : null,
            closeDate: currentRow[31] ? new Date(currentRow[31]) : null,
            challanNo: currentRow[32] || "",
          }
        }))
        
        console.log('Editing ON for row:', rowIndex)
      }
      
      return newEditingRows
    })
  }

  // Handle input change for inline editing
  const handleInlineEdit = (rowIndex, field, value) => {
    console.log('Inline edit:', rowIndex, field, value)
    
    setEditedData(prev => ({
      ...prev,
      [rowIndex]: {
        ...prev[rowIndex],
        [field]: value
      }
    }))
  }

  // ✅ FIXED handleInlineUpdate - Use actual row number from backend (WORKING VERSION)
  const handleInlineUpdate = async (rowIndex) => {
    try {
      setIsSubmitting(true)
      
      const editedRowData = editedData[rowIndex]
      const currentRow = [...tableData[rowIndex]]
      const actualRowNumber = currentRow[0] // First element is actual row number
      
      console.log('Updating row:', actualRowNumber, 'Data:', editedRowData)
      
      // Update the row data with edited values (skip first element which is row number)
      currentRow[3] = editedRowData.companyName
      currentRow[4] = editedRowData.modeOfCall
      currentRow[5] = editedRowData.idNumber
      currentRow[6] = editedRowData.projectName
      currentRow[7] = editedRowData.complaintNumber
      currentRow[8] = editedRowData.complaintDate ? editedRowData.complaintDate.toLocaleDateString('en-US') : ''
      currentRow[9] = editedRowData.beneficiaryName
      currentRow[10] = editedRowData.contactNumber
      currentRow[11] = editedRowData.village
      currentRow[12] = editedRowData.block
      currentRow[13] = editedRowData.district
      currentRow[14] = editedRowData.product
      currentRow[15] = editedRowData.make
      currentRow[16] = editedRowData.rating
      currentRow[17] = editedRowData.qty
      currentRow[18] = editedRowData.insuranceType
      currentRow[19] = editedRowData.natureOfComplaint
      currentRow[20] = editedRowData.technicianName
      currentRow[21] = editedRowData.technicianContact
      currentRow[22] = editedRowData.assigneeWhatsapp
      currentRow[28] = editedRowData.controllerRidNo
      currentRow[29] = editedRowData.productSlNo
      currentRow[30] = editedRowData.challanDate ? editedRowData.challanDate.toLocaleDateString('en-US') : ''
      currentRow[31] = editedRowData.closeDate ? editedRowData.closeDate.toLocaleDateString('en-US') : ''
      currentRow[32] = editedRowData.challanNo

      // Remove the row number from data to send (backend expects data without row number)
      const dataToSend = currentRow.slice(1) // Remove first element (row number)

      // Submit update to Google Sheets using actual row number
      const formDataToSend = new FormData()
      formDataToSend.append('action', 'updateRow')
      formDataToSend.append('sheetName', 'FMS')
      formDataToSend.append('rowIndex', actualRowNumber) // Use actual row number
      formDataToSend.append('rowData', JSON.stringify(dataToSend))

      const response = await fetch(
        'https://script.google.com/a/macros/rbpindia.com/s/AKfycbwnIMOzsFbniWnPFhl3lzE-2W0l6lD23keuz57-ldS_umSXIJqpEK-qxLE6eM0s7drqrQ/exec',
        {
          method: 'POST',
          body: formDataToSend,
          redirect: 'follow'
        }
      )

      const responseText = await response.text()
      console.log('Update response:', responseText)
      
      try {
        const result = JSON.parse(responseText)
        if (result.success) {
          alert('Record updated successfully!')
          
          // Turn off editing for this row
          setEditingRows(prev => {
            const newEditingRows = { ...prev }
            delete newEditingRows[rowIndex]
            return newEditingRows
          })
          
          // Clear edited data for this row
          setEditedData(prev => {
            const newEditedData = { ...prev }
            delete newEditedData[rowIndex]
            return newEditedData
          })
          
          // Refresh table data
          await fetchTableData()
        } else {
          throw new Error(result.error || 'Update failed')
        }
      } catch (parseError) {
        if (response.ok) {
          alert('Record updated successfully!')
          
          // Turn off editing for this row
          setEditingRows(prev => {
            const newEditingRows = { ...prev }
            delete newEditingRows[rowIndex]
            return newEditingRows
          })
          
          await fetchTableData()
        } else {
          throw new Error('Update failed')
        }
      }

    } catch (error) {
      console.error('Update error:', error)
      alert(`Update failed: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ✅ ENHANCED renderEditableCell - All field types support
  const renderEditableCell = (rowIndex, column, value, currentRowData) => {
    if (!editingRows[rowIndex] || !column.editable) {
      // Display mode
      let displayValue = value
      if (column.type === 'date' && value) {
        displayValue = new Date(value).toLocaleDateString()
      }
      
      return (
        <span className="text-xs text-gray-900 px-2 py-1 block">
          {displayValue || '-'}
        </span>
      )
    }

    // Edit mode
    const editValue = editedData[rowIndex]?.[column.field] || value || ''

    switch (column.type) {
      case 'select':
        let options = []
        if (column.field === 'companyName') options = companyNameOptions
        else if (column.field === 'district') options = districtOptions
        else if (column.field === 'insuranceType') options = insuranceTypeOptions
        else if (column.field === 'technicianName') options = technicianNameOptions
        else if (column.field === 'technicianContact') options = technicianContactOptions

        return (
          <select
            value={editValue}
            onChange={(e) => handleInlineEdit(rowIndex, column.field, e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-1 py-1 bg-yellow-50 focus:bg-white focus:border-blue-500"
          >
            <option value="">Select...</option>
            {options.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        )

      case 'date':
        return (
          <DatePicker
            selected={editValue instanceof Date ? editValue : (editValue ? new Date(editValue) : null)}
            onChange={(date) => handleInlineEdit(rowIndex, column.field, date)}
            className="w-full text-xs border border-gray-300 rounded px-1 py-1 bg-yellow-50 focus:bg-white focus:border-blue-500"
            dateFormat="dd/MM/yyyy"
            placeholderText="Select date"
          />
        )

      case 'textarea':
        return (
          <textarea
            value={editValue}
            onChange={(e) => handleInlineEdit(rowIndex, column.field, e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-1 py-1 bg-yellow-50 focus:bg-white focus:border-blue-500"
            rows={2}
            placeholder="Enter details..."
          />
        )

      default:
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => handleInlineEdit(rowIndex, column.field, e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-1 py-1 bg-yellow-50 focus:bg-white focus:border-blue-500"
            placeholder={`Enter ${column.label.toLowerCase()}...`}
          />
        )
    }
  }

  // Add refresh button handler
  const handleRefreshData = async () => {
    setIsLoading(true)
    await fetchTableData()
    setIsLoading(false)
  }

  // Get priority color based on priority value
  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'  
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  // ✅ COMPLETELY FIXED handleSubmit - Uses FormData like working update
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
      
      if (!serialNumber) {
        throw new Error('Serial number not generated. Please refresh the page.')
      }
      
      const rowData = new Array(60).fill('')

      // Column mapping - exactly same as before
      rowData[0] = timestamp
      rowData[1] = serialNumber
      rowData[2] = formData.companyName
      rowData[3] = formData.modeOfCall
      rowData[4] = formData.idNumber
      rowData[5] = formData.projectName
      rowData[6] = formData.complaintNumber
      rowData[7] = complaintDate ? complaintDate.toLocaleDateString('en-US') : ''
      rowData[8] = formData.beneficiaryName
      rowData[9] = formData.contactNumber
      rowData[10] = formData.village
      rowData[11] = formData.block
      rowData[12] = formData.district
      rowData[13] = formData.product
      rowData[14] = formData.make
      rowData[15] = formData.rating
      rowData[16] = formData.qty
      rowData[17] = formData.insuranceType
      rowData[18] = formData.natureOfComplaint
      rowData[19] = formData.technicianName
      rowData[20] = formData.technicianContact
      rowData[21] = formData.assigneeWhatsapp
      rowData[27] = formData.controllerRidNo
      rowData[28] = formData.productSlNo
      rowData[29] = challanDate ? challanDate.toLocaleDateString('en-US') : ''
      rowData[30] = closeDate ? closeDate.toLocaleDateString('en-US') : ''
      rowData[31] = formData.challanNo

      // ✅ SAME METHOD as your working update code
      const formDataToSend = new FormData()
      formDataToSend.append('action', 'insertFMS')
      formDataToSend.append('sheetName', 'FMS')
      formDataToSend.append('rowData', JSON.stringify(rowData))

      // ✅ Add debug logging
      console.log('Submitting new complaint:', {
        serialNumber,
        timestamp,
        rowDataLength: rowData.length,
        action: 'insertFMS'
      })

      const response = await fetch(
        'https://script.google.com/a/macros/rbpindia.com/s/AKfycbwnIMOzsFbniWnPFhl3lzE-2W0l6lD23keuz57-ldS_umSXIJqpEK-qxLE6eM0s7drqrQ/exec',
        {
          method: 'POST',
          body: formDataToSend,
          redirect: 'follow'
        }
      )
      
      console.log('Response status:', response.status)
      const responseText = await response.text()
      console.log('Response text:', responseText.substring(0, 200) + '...')
      
      let result
      try {
        result = JSON.parse(responseText)
        console.log('Parsed result:', result)
      } catch (parseError) {
        console.log('Could not parse JSON, treating as success')
        if (responseText.includes('<!DOCTYPE') || response.ok) {
          result = { success: true }
        } else {
          throw new Error('Invalid response from server')
        }
      }
      
      // ✅ Show success message
      alert(`Complaint created successfully!\n\nComplaint ID: ${serialNumber}\nTimestamp: ${timestamp}`)
      
      // Reset form
      setFormData({
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
        rating: "",
        qty: "",
        controllerRidNo: "",
        productSlNo: "",
        insuranceType: "",
        natureOfComplaint: "",
        technicianName: "",
        technicianContact: "",
        assigneeWhatsapp: "",
        challanNo: "",
      })
      setComplaintDate(null)
      setChallanDate(null)
      setCloseDate(null)
      setShowForm(false)
      
      // Generate new serial number
      const now = new Date()
      const year = now.getFullYear().toString().slice(-2)
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const day = now.getDate().toString().padStart(2, '0')
      const hour = now.getHours().toString().padStart(2, '0')
      const minute = now.getMinutes().toString().padStart(2, '0')
      const second = now.getSeconds().toString().padStart(2, '0')
      setSerialNumber(`RBPST-${year}${month}${day}${hour}${minute}${second}`)
      
      // ✅ Force refresh table data after submission
      setTimeout(async () => {
        console.log('Refreshing table data after submission...')
        await fetchTableData()
      }, 2000)

    } catch (error) {
      console.error('Submission error:', error)
      alert(`Failed to create complaint!\n\nError: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border-0 shadow-md bg-white">
      <div className="p-4 sm:p-6">
      {isLoading ? (
  <div className="flex justify-center items-center h-24">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
  </div>
) : (
          <>
            {/* Header with buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
              <div className="flex flex-wrap gap-2">
            
         
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  {showForm ? 'Hide Form' : 'Add New Complaint'}
                </button>
              </div>
            </div>

          {/* Collapsible Form - WHITE BACKGROUND */}
{showForm && (
  <div className="mb-8 border border-gray-200 rounded-lg p-6 bg-white">
    <h2 className="text-lg font-semibold mb-4">New Complaint Form</h2>
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* REMOVED - Complaint ID field completely removed */}

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <select
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Company</option>
            {companyNameOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Mode of Call - CHANGED TO INPUT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mode of Call *
          </label>
          <input
            type="text"
            name="modeOfCall"
            value={formData.modeOfCall}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Mode of Call"
          />
        </div>

        {/* ID Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID Number
          </label>
          <input
            type="text"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter ID Number"
          />
        </div>

        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Project Name"
          />
        </div>

        {/* Complaint Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complaint Number
          </label>
          <input
            type="text"
            name="complaintNumber"
            value={formData.complaintNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Complaint Number"
          />
        </div>

        {/* Complaint Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complaint Date *
          </label>
          <DatePicker
            selected={complaintDate}
            onChange={(date) => setComplaintDate(date)}
            dateFormat="dd/MM/yyyy"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholderText="Select complaint date"
            required
          />
        </div>

        {/* Beneficiary Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beneficiary Name *
          </label>
          <input
            type="text"
            name="beneficiaryName"
            value={formData.beneficiaryName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Beneficiary Name"
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number *
          </label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Contact Number"
          />
        </div>

        {/* Village */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Village
          </label>
          <input
            type="text"
            name="village"
            value={formData.village}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Village"
          />
        </div>

        {/* Block */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Block
          </label>
          <input
            type="text"
            name="block"
            value={formData.block}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Block"
          />
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            District *
          </label>
          <select
            name="district"
            value={formData.district}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select District</option>
            {districtOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Product */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product
          </label>
          <input
            type="text"
            name="product"
            value={formData.product}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Product"
          />
        </div>

        {/* Make */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Make
          </label>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Make"
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <input
            type="text"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Rating"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="text"
            name="qty"
            value={formData.qty}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Quantity"
          />
        </div>

        {/* Controller RID No */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Controller RID No
          </label>
          <input
            type="text"
            name="controllerRidNo"
            value={formData.controllerRidNo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Controller RID No"
          />
        </div>

        {/* Product SL No */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product SL No
          </label>
          <input
            type="text"
            name="productSlNo"
            value={formData.productSlNo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Product SL No"
          />
        </div>

        {/* Insurance Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Insurance Type
          </label>
          <select
            name="insuranceType"
            value={formData.insuranceType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Insurance Type</option>
            {insuranceTypeOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Technician Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technician Name
          </label>
          <select
            name="technicianName"
            value={formData.technicianName}
            onChange={(e) => handleSelectChange('technicianName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Technician</option>
            {technicianNameOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Technician Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technician Contact
          </label>
          <input
            type="text"
            name="technicianContact"
            value={formData.technicianContact}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
            placeholder="Auto-filled from technician selection"
            readOnly
          />
        </div>

        {/* Assignee WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignee WhatsApp
          </label>
          <input
            type="text"
            name="assigneeWhatsapp"
            value={formData.assigneeWhatsapp}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter WhatsApp Number"
          />
        </div>

        {/* Challan Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Challan Date
          </label>
          <DatePicker
            selected={challanDate}
            onChange={(date) => setChallanDate(date)}
            dateFormat="dd/MM/yyyy"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholderText="Select challan date"
          />
        </div>

        {/* Close Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Close Date
          </label>
          <DatePicker
            selected={closeDate}
            onChange={(date) => setCloseDate(date)}
            dateFormat="dd/MM/yyyy"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholderText="Select close date"
          />
        </div>

        {/* Challan No */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Challan No
          </label>
          <input
            type="text"
            name="challanNo"
            value={formData.challanNo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Challan Number"
          />
        </div>
      </div>

      {/* Nature of Complaint - Full Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nature of Complaint *
        </label>
        <textarea
          name="natureOfComplaint"
          value={formData.natureOfComplaint}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the nature of complaint..."
        />
      </div>

      {/* Form Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Complaint'}
        </button>
      </div>
    </form>
  </div>
)}


            {/* Table with improved UI */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h2 className="text-xl font-semibold">
  Complaints Data ({tableData.length} records
  {localStorage.getItem('userRole') === 'tech' && ' assigned to you'}
  )
</h2>
                {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                  {Object.keys(editingRows).length > 0 && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                      {Object.keys(editingRows).length} rows in edit mode
                    </span>
                  )}
                  {autoRefresh && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                      Auto-refresh: {refreshInterval/1000}s
                    </span>
                  )}
                </div> */}
              </div>
              
           {dataError ? (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-center">
      <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p className="text-red-700">Error: {dataError}</p>
    </div>
    <button 
      onClick={handleRefreshData}
      className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
    >
      Try Again
    </button>
  </div>
) : tableData.length > 0 ? (
  <>
    {/* Desktop Table View - Hidden on mobile */}
    <div className="hidden lg:block overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Edit
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Complaint ID
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Complaint Date
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Company Name
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Mode Of Call
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Technician Name
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Beneficiary Name
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Contact Number
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Village
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                District
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Product
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Nature Of Complaint
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((row, rowIndex) => (
              <tr key={`complaint-${row[2]}-${rowIndex}`} className={`hover:bg-gray-50 ${editingRows[rowIndex] ? 'bg-yellow-50' : ''}`}>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleInlineUpdate(rowIndex)}
                      disabled={!editingRows[rowIndex] || isSubmitting}
                      className={`px-3 py-1 rounded-md text-sm ${
                        !editingRows[rowIndex] || isSubmitting
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => handleEditToggle(rowIndex)}
                      disabled={!editingRows[rowIndex]}
                      className={`px-3 py-1 rounded-md text-sm ${
                        !editingRows[rowIndex]
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-500 hover:bg-gray-600 text-white'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={!!editingRows[rowIndex]}
                    onChange={() => handleEditToggle(rowIndex)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{row[2]}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm">{row[8] ? new Date(row[8]).toLocaleDateString() : '-'}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  {editingRows[rowIndex] ? 
                    renderEditableCell(rowIndex, tableColumns.find(c => c.key === 3), row[3], row) : 
                    row[3] || '-'
                  }
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  {editingRows[rowIndex] ? 
                    renderEditableCell(rowIndex, tableColumns.find(c => c.key === 4), row[4], row) : 
                    row[4] || '-'
                  }
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  {editingRows[rowIndex] ? 
                    renderEditableCell(rowIndex, tableColumns.find(c => c.key === 20), row[20], row) : 
                    row[20] || '-'
                  }
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  {editingRows[rowIndex] ? 
                    renderEditableCell(rowIndex, tableColumns.find(c => c.key === 9), row[9], row) : 
                    row[9] || '-'
                  }
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  {editingRows[rowIndex] ? 
                    renderEditableCell(rowIndex, tableColumns.find(c => c.key === 10), row[10], row) : 
                    row[10] || '-'
                  }
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  {editingRows[rowIndex] ? 
                    renderEditableCell(rowIndex, tableColumns.find(c => c.key === 11), row[11], row) : 
                    row[11] || '-'
                  }
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  {editingRows[rowIndex] ? 
                    renderEditableCell(rowIndex, tableColumns.find(c => c.key === 13), row[13], row) : 
                    row[13] || '-'
                  }
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  {editingRows[rowIndex] ? 
                    renderEditableCell(rowIndex, tableColumns.find(c => c.key === 14), row[14], row) : 
                    row[14] || '-'
                  }
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  {editingRows[rowIndex] ? 
                    renderEditableCell(rowIndex, tableColumns.find(c => c.key === 19), row[19], row) : 
                    (row[19] ? (row[19].length > 50 ? row[19].substring(0, 50) + '...' : row[19]) : '-')
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Mobile Card View - Visible on mobile only */}
    <div className="lg:hidden space-y-4">
      {tableData.map((row, rowIndex) => (
        <div 
          key={`mobile-complaint-${row[2]}-${rowIndex}`} 
          className={`border rounded-lg p-4 ${editingRows[rowIndex] ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'}`}
        >
          {/* Header with Edit Toggle */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Complaint ID</div>
              <div className="font-semibold text-blue-600">{row[2]}</div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={!!editingRows[rowIndex]}
                  onChange={() => handleEditToggle(rowIndex)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Edit
              </label>
            </div>
          </div>

          {/* Complaint Details */}
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Date</div>
                <div className="text-sm font-medium">
                  {editingRows[rowIndex] ? 
                    renderEditableCell(rowIndex, tableColumns.find(c => c.key === 8), row[8], row) : 
                    (row[8] ? new Date(row[8]).toLocaleDateString() : '-')
                  }
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Company</div>
                <div className="text-sm font-medium">
                  {editingRows[rowIndex] ? 
                    renderEditableCell(rowIndex, tableColumns.find(c => c.key === 3), row[3], row) : 
                    row[3] || '-'
                  }
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Beneficiary Name</div>
              <div className="text-sm font-medium">
                {editingRows[rowIndex] ? 
                  renderEditableCell(rowIndex, tableColumns.find(c => c.key === 9), row[9], row) : 
                  row[9] || '-'
                }
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Contact</div>
                <div className="text-sm">
                  {editingRows[rowIndex] ? 
                    renderEditableCell(rowIndex, tableColumns.find(c => c.key === 10), row[10], row) : 
                    row[10] || '-'
                  }
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Village</div>
                <div className="text-sm">
                  {editingRows[rowIndex] ? 
                    renderEditableCell(rowIndex, tableColumns.find(c => c.key === 11), row[11], row) : 
                    row[11] || '-'
                  }
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">District</div>
                <div className="text-sm">
                  {editingRows[rowIndex] ? 
                    renderEditableCell(rowIndex, tableColumns.find(c => c.key === 13), row[13], row) : 
                    row[13] || '-'
                  }
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Product</div>
                <div className="text-sm">
                  {editingRows[rowIndex] ? 
                    renderEditableCell(rowIndex, tableColumns.find(c => c.key === 14), row[14], row) : 
                    row[14] || '-'
                  }
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Technician</div>
              <div className="text-sm font-medium">
                {editingRows[rowIndex] ? 
                  renderEditableCell(rowIndex, tableColumns.find(c => c.key === 20), row[20], row) : 
                  row[20] || '-'
                }
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Mode of Call</div>
              <div className="text-sm">
                {editingRows[rowIndex] ? 
                  renderEditableCell(rowIndex, tableColumns.find(c => c.key === 4), row[4], row) : 
                  row[4] || '-'
                }
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Nature of Complaint</div>
              <div className="text-sm">
                {editingRows[rowIndex] ? 
                  renderEditableCell(rowIndex, tableColumns.find(c => c.key === 19), row[19], row) : 
                  (row[19] || '-')
                }
              </div>
            </div>
          </div>

          {/* Action Buttons - Only show when editing */}
          {editingRows[rowIndex] && (
            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => handleInlineUpdate(rowIndex)}
                disabled={isSubmitting}
                className={`flex-1 py-2 rounded-md text-sm font-medium ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => handleEditToggle(rowIndex)}
                className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  </>
) : (
  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
    <div className="flex justify-center items-center h-24">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
    </div>
  </div>
)}

            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default NewComplaintForm
