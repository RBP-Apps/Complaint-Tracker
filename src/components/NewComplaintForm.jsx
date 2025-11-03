// "use client"

// import { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import DatePicker from "react-datepicker"
// import "react-datepicker/dist/react-datepicker.css"

// function NewComplaintForm() {
//   const navigate = useNavigate()
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [complaintDate, setComplaintDate] = useState(null)
//   const [serialNumber, setSerialNumber] = useState('')
  
//   // States for dropdown options from master sheet
//   const [companyNameOptions, setCompanyNameOptions] = useState([])
//   const [modeOfCallOptions, setModeOfCallOptions] = useState([])
//   const [projectNameOptions, setProjectNameOptions] = useState([])
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
//     insuranceType: "",
//     natureOfComplaint: "",
//     technicianName: "",
//     technicianContact: "",
//     assigneeWhatsapp: "",
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
//       const modeOfCall = []
//       const projectNames = []
//       const districts = []
//       const insuranceTypes = []
      
//       masterData.table.rows.forEach((row, index) => {
//         if (row.c) {
//           // Column A: Company Name
//           if (row.c[0] && row.c[0].v !== null && row.c[0].v !== "" && row.c[0].v !== "Company Name") {
//             companyNames.push(row.c[0].v)
//           }
          
//           // Column B: Mode of Call
//           if (row.c[1] && row.c[1].v !== null && row.c[1].v !== "" && row.c[1].v !== "Mode Of Call") {
//             modeOfCall.push(row.c[1].v)
//           }
          
//           // Column C: Project Name
//           if (row.c[2] && row.c[2].v !== null && row.c[2].v !== "" && row.c[2].v !== "Project Name") {
//             projectNames.push(row.c[2].v)
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
//       setModeOfCallOptions([...new Set(modeOfCall)])
//       setProjectNameOptions([...new Set(projectNames)])
//       setDistrictOptions([...new Set(districts)])
//       setInsuranceTypeOptions([...new Set(insuranceTypes)])
//     }

//     // Process technician data from Login sheet
//  // Process technician data from Login sheet
// if (loginData && loginData.table && loginData.table.rows) {
//   const technicianNames = []
//   const technicianContacts = []
//   const technicianMapping = []
  
//   // Get current logged-in user from localStorage
//   const currentUser = localStorage.getItem('currentUser')
//   const userRole = localStorage.getItem('userRole')
  
//   console.log("Current logged in user:", currentUser)
//   console.log("User role:", userRole)
  
//   loginData.table.rows.forEach((row, index) => {
//     if (row.c) {
//       // Column A: Technician Name (from Login sheet)
//       const techName = row.c[0] && row.c[0].v !== null && row.c[0].v !== "" && row.c[0].v !== "Name" ? row.c[0].v : null
      
//       // Column E: Role (from Login sheet)
//       const role = row.c[4] && row.c[4].v !== null && row.c[4].v !== "" && row.c[4].v !== "Role" ? row.c[4].v.toLowerCase() : null
      
//       // Column F: Technician Contact (from Login sheet)
//       const techContact = row.c[5] && row.c[5].v !== null && row.c[5].v !== "" && row.c[5].v !== "Contact" ? row.c[5].v : null
      
//       if (techName && techContact) {
//         // If user is admin or regular user, show all technicians
//         if (userRole === 'admin' || userRole === 'user') {
//           technicianNames.push(techName)
//           technicianContacts.push(techContact)
//           technicianMapping.push({
//             name: techName,
//             contact: techContact
//           })
//         } 
//         // If role is 'tech', show only their own name
//         else if (userRole === 'tech' && role === 'tech' && currentUser && techName.toLowerCase() === currentUser.toLowerCase()) {
//           technicianNames.push(techName)
//           technicianContacts.push(techContact)
//           technicianMapping.push({
//             name: techName,
//             contact: techContact
//           })
          
//           // Auto-fill the form with tech's data
//           setFormData(prev => ({
//             ...prev,
//             technicianName: techName,
//             technicianContact: techContact
//           }))
//         }
//       }
//     }
//   })
  
//   // Remove duplicates and set technician options
//   setTechnicianNameOptions([...new Set(technicianNames)])
//   setTechnicianContactOptions([...new Set(technicianContacts)])
//   setTechnicianMapping(technicianMapping)
  
//   console.log("Technician mapping loaded:", technicianMapping)
//   console.log("User role:", userRole)
//   console.log("Current user:", currentUser)
// }
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


//   // Fetch the last serial number from the sheet - यही function पहले जैसा है
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
        
//         if (lastNumber && lastNumber.toString().includes('SSY-')) {
//           const numPart = parseInt(lastNumber.toString().split('-')[1])
//           if (!isNaN(numPart)) {
//             newSerialNumber = `SSY-${(numPart + 1).toString().padStart(3, '0')}`
//           } else {
//             newSerialNumber = 'SSY-001'
//           }
//         } else {
//           newSerialNumber = 'SSY-001'
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
      
//       if (lastNumber && lastNumber.includes('SSY-')) {
//         const numPart = parseInt(lastNumber.split('-')[1])
//         if (!isNaN(numPart)) {
//           newSerialNumber = `SSY-${(numPart + 1).toString().padStart(3, '0')}`
//         } else {
//           newSerialNumber = 'SSY-001'
//         }
//       } else {
//         newSerialNumber = 'SSY-001'
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
  
//   // NEW: Auto-fill technician contact when technician name is selected
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
    
//     // Validate required fields
//     if (!serialNumber) {
//       throw new Error('Serial number not generated. Please refresh the page.')
//     }
    
//     if (!complaintDate) {
//       throw new Error('Please select complaint date')
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

//     // Column D: Mode Of Call
//     rowData[3] = formData.modeOfCall

//     // Column E: ID Number
//     rowData[4] = formData.idNumber

//     // Column F: Project Name
//     rowData[5] = formData.projectName

//     // Column G: Complaint Number
//     rowData[6] = formData.complaintNumber

//     // Column H: Complaint Date
//     rowData[7] = complaintDate.toLocaleDateString('en-US')

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

//     console.log('=== SUBMISSION START ===')
//     console.log('Timestamp:', timestamp)
//     console.log('Serial Number:', serialNumber)
//     console.log('Total columns in rowData:', rowData.length)
//     console.log('First 22 columns:', rowData.slice(0, 22))

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
//       insuranceType: "",
//       natureOfComplaint: "",
//       technicianName: "",
//       technicianContact: "",
//       assigneeWhatsapp: "",
//     })
//     setComplaintDate(null)
    
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
//             {/* Display current serial number */}
//             {/* <div className="bg-gray-50 p-3 rounded-md">
//               <p className="text-sm text-gray-600">
//                 <strong>Complaint ID:</strong> {serialNumber || 'Loading...'}
//               </p>
//             </div> */}

//             <div className="grid gap-6 md:grid-cols-3">
              
//               <div className="space-y-2">
//                 <label htmlFor="companyName" className="block text-sm font-medium">
//                   Company Name *
//                 </label>
//                 <select
//                   id="companyName"
//                   name="companyName"
//                   value={formData.companyName}
//                   onChange={(e) => handleSelectChange("companyName", e.target.value)}
//                   required
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

//               <div className="space-y-2">
//                 <label htmlFor="modeOfCall" className="block text-sm font-medium">
//                   Mode Of Call *
//                 </label>
//                 <select
//                   id="modeOfCall"
//                   name="modeOfCall"
//                   value={formData.modeOfCall}
//                   onChange={(e) => handleSelectChange("modeOfCall", e.target.value)}
//                   required
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 >
//                   <option value="">Select mode of call</option>
//                   {modeOfCallOptions.map((option, index) => (
//                     <option key={`mode-${index}`} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="idNumber" className="block text-sm font-medium">
//                   ID Number *
//                 </label>
//                 <input
//                   id="idNumber"
//                   name="idNumber"
//                   placeholder="Enter ID number"
//                   value={formData.idNumber}
//                   onChange={handleChange}
//                   required
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="projectName" className="block text-sm font-medium">
//                   Project Name *
//                 </label>
//                 <select
//                   id="projectName"
//                   name="projectName"
//                   value={formData.projectName}
//                   onChange={(e) => handleSelectChange("projectName", e.target.value)}
//                   required
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 >
//                   <option value="">Select project name</option>
//                   {projectNameOptions.map((option, index) => (
//                     <option key={`project-${index}`} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="complaintNumber" className="block text-sm font-medium">
//                   Complaint Number *
//                 </label>
//                 <input
//                   id="complaintNumber"
//                   name="complaintNumber"
//                   placeholder="Enter complaint number"
//                   value={formData.complaintNumber}
//                   onChange={handleChange}
//                   required
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="complaintDate" className="block text-sm font-medium">
//                   Complaint Date *
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
//                   Beneficiary Name *
//                 </label>
//                 <input
//                   id="beneficiaryName"
//                   name="beneficiaryName"
//                   placeholder="Enter beneficiary name"
//                   value={formData.beneficiaryName}
//                   onChange={handleChange}
//                   required
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="contactNumber" className="block text-sm font-medium">
//                   Contact Number *
//                 </label>
//                 <input
//                   id="contactNumber"
//                   name="contactNumber"
//                   placeholder="Enter contact number"
//                   value={formData.contactNumber}
//                   onChange={handleChange}
//                   required
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="village" className="block text-sm font-medium">
//                   Village *
//                 </label>
//                 <input
//                   id="village"
//                   name="village"
//                   placeholder="Enter village"
//                   value={formData.village}
//                   onChange={handleChange}
//                   required
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="block" className="block text-sm font-medium">
//                   Block *
//                 </label>
//                 <input
//                   id="block"
//                   name="block"
//                   placeholder="Enter block"
//                   value={formData.block}
//                   onChange={handleChange}
//                   required
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="district" className="block text-sm font-medium">
//                   District *
//                 </label>
//                 <select
//                   id="district"
//                   name="district"
//                   value={formData.district}
//                   onChange={(e) => handleSelectChange("district", e.target.value)}
//                   required
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
//                   Product *
//                 </label>
//                 <input
//                   id="product"
//                   name="product"
//                   placeholder="Enter product"
//                   value={formData.product}
//                   onChange={handleChange}
//                   required
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="make" className="block text-sm font-medium">
//                   Make *
//                 </label>
//                 <input
//                   id="make"
//                   name="make"
//                   placeholder="Enter make"
//                   value={formData.make}
//                   onChange={handleChange}
//                   required
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="rating" className="block text-sm font-medium">
//                   Rating *
//                 </label>
//                 <input
//                   id="rating"
//                   name="rating"
//                   placeholder="Enter rating"
//                   value={formData.rating}
//                   onChange={handleChange}
//                   required
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="qty" className="block text-sm font-medium">
//                   Qty *
//                 </label>
//                 <input
//                   id="qty"
//                   name="qty"
//                   placeholder="Enter quantity"
//                   value={formData.qty}
//                   onChange={handleChange}
//                   required
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>

//               { <div className="space-y-2">
//                 <label htmlFor="insuranceType" className="block text-sm font-medium">
//                   Insurance Type *
//                 </label>
//                 <select
//                   id="insuranceType"
//                   name="insuranceType"
//                   value={formData.insuranceType}
//                   onChange={(e) => handleSelectChange("insuranceType", e.target.value)}
//                   required
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 >
//                   <option value="">Select insurance type</option>
//                   {insuranceTypeOptions.map((option, index) => (
//                     <option key={`insurance-${index}`} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               </div> }

//               <div className="space-y-2">
//                 <label htmlFor="technicianName" className="block text-sm font-medium">
//                   Technician Name *
//                 </label>
//                 <select
//                   id="technicianName"
//                   name="technicianName"
//                   value={formData.technicianName}
//                   onChange={(e) => handleSelectChange("technicianName", e.target.value)}
//                   required
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
//                   Technician Contact *
//                 </label>
//                 <select
//                   id="technicianContact"
//                   name="technicianContact"
//                   value={formData.technicianContact}
//                   onChange={(e) => handleSelectChange("technicianContact", e.target.value)}
//                   required
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
//                   Assignee WhatsApp Number *
//                 </label>
//                 <input
//                   id="assigneeWhatsapp"
//                   name="assigneeWhatsapp"
//                   placeholder="Enter assignee WhatsApp number"
//                   value={formData.assigneeWhatsapp}
//                   onChange={handleChange}
//                   required
//                   className="w-full border border-gray-300 rounded-md py-2 px-3"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="natureOfComplaint" className="block text-sm font-medium">
//                 Nature Of Complaint *
//               </label>
//               <textarea
//                 id="natureOfComplaint"
//                 name="natureOfComplaint"
//                 placeholder="Enter detailed description of the complaint"
//                 value={formData.natureOfComplaint}
//                 onChange={handleChange}
//                 rows={4}
//                 required
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

import { useState, useEffect } from "react"
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
  
  // States for dropdown options from master sheet
  const [companyNameOptions, setCompanyNameOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [technicianNameOptions, setTechnicianNameOptions] = useState([])
  const [technicianContactOptions, setTechnicianContactOptions] = useState([])
  const [insuranceTypeOptions, setInsuranceTypeOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [technicianMapping, setTechnicianMapping] = useState([])

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
  })

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
    
    // Extract the JSON part from the responses
    const masterJsonStart = masterText.indexOf('{')
    const masterJsonEnd = masterText.lastIndexOf('}') + 1
    const masterData = JSON.parse(masterText.substring(masterJsonStart, masterJsonEnd))
    
    const loginJsonStart = loginText.indexOf('{')
    const loginJsonEnd = loginText.lastIndexOf('}') + 1
    const loginData = JSON.parse(loginText.substring(loginJsonStart, loginJsonEnd))

    // Process the dropdown data from master sheet
    if (masterData && masterData.table && masterData.table.rows) {
      const companyNames = []
      const districts = []
      const insuranceTypes = []
      
      masterData.table.rows.forEach((row, index) => {
        if (row.c) {
          // Column A: Company Name
          if (row.c[0] && row.c[0].v !== null && row.c[0].v !== "" && row.c[0].v !== "Company Name") {
            companyNames.push(row.c[0].v)
          }
          
          // Column D: District
          if (row.c[3] && row.c[3].v !== null && row.c[3].v !== "" && row.c[3].v !== "District") {
            districts.push(row.c[3].v)
          }
          
          // Column G: Insurance Type
          if (row.c[6] && row.c[6].v !== null && row.c[6].v !== "" && row.c[6].v !== "Insurance Type") {
            insuranceTypes.push(row.c[6].v)
          }
        }
      })
      
      // Remove duplicates and set the dropdown options
      setCompanyNameOptions([...new Set(companyNames)])
      setDistrictOptions([...new Set(districts)])
      setInsuranceTypeOptions([...new Set(insuranceTypes)])
    }

    // Process technician data from Login sheet
    if (loginData && loginData.table && loginData.table.rows) {
      const technicianNames = []
      const technicianContacts = []
      const technicianMapping = []
      
      // Get current logged-in user from localStorage
      const currentUser = localStorage.getItem('currentUser')
      const userRole = localStorage.getItem('userRole')
      
      console.log("Current logged in user:", currentUser)
      console.log("User role:", userRole)
      
      loginData.table.rows.forEach((row, index) => {
        if (row.c) {
          // Column A: Technician Name (from Login sheet)
          const techName = row.c[0] && row.c[0].v !== null && row.c[0].v !== "" && row.c[0].v !== "Name" ? row.c[0].v : null
          
          // Column E: Role (from Login sheet)
          const role = row.c[4] && row.c[4].v !== null && row.c[4].v !== "" && row.c[4].v !== "Role" ? row.c[4].v.toLowerCase() : null
          
          // Column F: Technician Contact (from Login sheet)
          const techContact = row.c[5] && row.c[5].v !== null && row.c[5].v !== "" && row.c[5].v !== "Contact" ? row.c[5].v : null
          
          if (techName && techContact) {
            // If user is admin or regular user, show all technicians
            if (userRole === 'admin' || userRole === 'user') {
              technicianNames.push(techName)
              technicianContacts.push(techContact)
              technicianMapping.push({
                name: techName,
                contact: techContact
              })
            } 
            // If role is 'tech', show only their own name
            else if (userRole === 'tech' && role === 'tech' && currentUser && techName.toLowerCase() === currentUser.toLowerCase()) {
              technicianNames.push(techName)
              technicianContacts.push(techContact)
              technicianMapping.push({
                name: techName,
                contact: techContact
              })
              
              // Auto-fill the form with tech's data
              setFormData(prev => ({
                ...prev,
                technicianName: techName,
                technicianContact: techContact
              }))
            }
          }
        }
      })
      
      // Remove duplicates and set technician options
      setTechnicianNameOptions([...new Set(technicianNames)])
      setTechnicianContactOptions([...new Set(technicianContacts)])
      setTechnicianMapping(technicianMapping)
      
      console.log("Technician mapping loaded:", technicianMapping)
      console.log("User role:", userRole)
      console.log("Current user:", currentUser)
    }
  } catch (error) {
    console.error('Error fetching dropdown options:', error)
    // Fallback options
    const fallbackMapping = [
      { name: 'Technician 1', contact: '9876543210' },
      { name: 'Technician 2', contact: '9876543211' },
      { name: 'Technician 3', contact: '9876543212' }
    ]
    
    setTechnicianNameOptions(['Technician 1', 'Technician 2', 'Technician 3'])
    setTechnicianContactOptions(['9876543210', '9876543211', '9876543212'])
    setTechnicianMapping(fallbackMapping)
  } finally {
    setIsLoading(false)
  }
}

  // Fetch the last serial number from the sheet - CT format के साथ
  const fetchLastSerialNumber = async () => {
    try {
      const scriptUrl = `https://script.google.com/a/macros/rbpindia.com/s/AKfycbwnIMOzsFbniWnPFhl3lzE-2W0l6lD23keuz57-ldS_umSXIJqpEK-qxLE6eM0s7drqrQ/exec?action=getLastSerialNumber&sheetName=FMS`
      
      console.log('Fetching from:', scriptUrl)
      
      const response = await fetch(scriptUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const responseText = await response.text()
      console.log('Raw response:', responseText)
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        throw new Error("Response is not valid JSON")
      }
      
      console.log('Parsed data:', data)
      
      if (data.success && typeof data.lastSerialNumber !== 'undefined') {
        const lastNumber = data.lastSerialNumber
        let newSerialNumber
        
        // CT format के लिए बदलाव
        if (lastNumber && lastNumber.toString().includes('CT-')) {
          const numPart = parseInt(lastNumber.toString().split('-')[1])
          if (!isNaN(numPart)) {
            newSerialNumber = `CT-${(numPart + 1).toString().padStart(3, '0')}`
          } else {
            newSerialNumber = 'CT-001'
          }
        } else {
          newSerialNumber = 'CT-001'
        }
        
        console.log('Generated serial number:', newSerialNumber)
        setSerialNumber(newSerialNumber)
        localStorage.setItem('lastSerialNumber', newSerialNumber)
        return
      }
      
      throw new Error(data.error || "Failed to get serial number from response")
    } catch (error) {
      console.error('Error fetching serial number:', error)
      console.log('Falling back to localStorage')
      
      // Fallback - use localStorage
      const lastNumber = localStorage.getItem('lastSerialNumber')
      let newSerialNumber
      
      if (lastNumber && lastNumber.includes('CT-')) {
        const numPart = parseInt(lastNumber.split('-')[1])
        if (!isNaN(numPart)) {
          newSerialNumber = `CT-${(numPart + 1).toString().padStart(3, '0')}`
        } else {
          newSerialNumber = 'CT-001'
        }
      } else {
        newSerialNumber = 'CT-001'
      }
      
      console.log('Fallback serial number:', newSerialNumber)
      setSerialNumber(newSerialNumber)
      localStorage.setItem('lastSerialNumber', newSerialNumber)
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
  
  // AUTO-FILL technician contact when technician name is selected
  if (name === 'technicianName' && value) {
    const selectedTechnician = technicianMapping.find(tech => tech.name === value)
    if (selectedTechnician) {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        technicianContact: selectedTechnician.contact
      }))
      console.log(`Auto-filled contact: ${selectedTechnician.contact} for technician: ${value}`)
    }
  }
}

 const handleSubmit = async (e) => {
  e.preventDefault()
  setIsSubmitting(true)
  
  try {
    // Get current timestamp
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
    
    // Validate required fields
    if (!serialNumber) {
      throw new Error('Serial number not generated. Please refresh the page.')
    }
    
    if (!complaintDate) {
      throw new Error('Please select complaint date')
    }
    
    // आपके sheet structure के अनुसार correct column mapping
    const rowData = new Array(60).fill('')

    // Based on your image - यह आपकी इमेज के अनुसार सही column mapping है:
    // Column A: Timestamp
    rowData[0] = timestamp

    // Column B: Complaint ID (Serial Number) 
    rowData[1] = serialNumber

    // Column C: Company Name
    rowData[2] = formData.companyName

    // Column D: Mode Of Call (अब input field है)
    rowData[3] = formData.modeOfCall

    // Column E: ID Number
    rowData[4] = formData.idNumber

    // Column F: Project Name (अब input field है)
    rowData[5] = formData.projectName

    // Column G: Complaint Number
    rowData[6] = formData.complaintNumber

    // Column H: Complaint Date
    rowData[7] = complaintDate.toLocaleDateString('en-US')

    // Column I: Beneficiary Name
    rowData[8] = formData.beneficiaryName

    // Column J: Contact Number
    rowData[9] = formData.contactNumber

    // Column K: Village
    rowData[10] = formData.village

    // Column L: Block
    rowData[11] = formData.block

    // Column M: District
    rowData[12] = formData.district

    // Column N: Product
    rowData[13] = formData.product

    // Column O: Make
    rowData[14] = formData.make

    // Column P: Rating
    rowData[15] = formData.rating

    // Column Q: Qty
    rowData[16] = formData.qty

    // Column R: Insurance Type
    rowData[17] = formData.insuranceType

    // Column S: Nature Of Complaint
    rowData[18] = formData.natureOfComplaint

    // Column T: Technician Name
    rowData[19] = formData.technicianName

    // Column U: Technician Contact
    rowData[20] = formData.technicianContact

    // Column V: Assignee Whatsapp Number
    rowData[21] = formData.assigneeWhatsapp

    // NEW FIELDS - Column AB: Controller RID No (index 27)
    rowData[27] = formData.controllerRidNo

    // NEW FIELDS - Column AC: Product SL No (index 28)
    rowData[28] = formData.productSlNo

    // NEW FIELDS - Column AD: Challan Date (index 29)
    rowData[29] = challanDate ? challanDate.toLocaleDateString('en-US') : ''

    // NEW FIELDS - Column AE: Close Date (index 30)
    rowData[30] = closeDate ? closeDate.toLocaleDateString('en-US') : ''

    console.log('=== SUBMISSION START ===')
    console.log('Timestamp:', timestamp)
    console.log('Serial Number:', serialNumber)
    console.log('Total columns in rowData:', rowData.length)
    console.log('First 31 columns:', rowData.slice(0, 31))

    // Submit data using FormData (works with doPost)
    const formDataToSend = new FormData()
    formDataToSend.append('action', 'insertFMS')
    formDataToSend.append('sheetName', 'FMS')
    formDataToSend.append('rowData', JSON.stringify(rowData))

    console.log('Submitting to Google Apps Script...')
    console.log('Action: insertFMS')
    console.log('Sheet: FMS')

    const response = await fetch(
      'https://script.google.com/a/macros/rbpindia.com/s/AKfycbwnIMOzsFbniWnPFhl3lzE-2W0l6lD23keuz57-ldS_umSXIJqpEK-qxLE6eM0s7drqrQ/exec',
      {
        method: 'POST',
        body: formDataToSend,
        redirect: 'follow'
      }
    )
    
    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)
    
    const responseText = await response.text()
    console.log('Raw response:', responseText)
    
    let result
    try {
      result = JSON.parse(responseText)
      console.log('Parsed result:', result)
      
      if (result.success) {
        console.log('✅ SUCCESS - Data inserted')
        console.log('Complaint ID:', result.complaintId)
        console.log('Row Number:', result.rowNumber)
      } else {
        console.log('❌ FAILED - Server returned error')
        console.log('Error:', result.error)
        throw new Error(result.error || 'Server returned failure')
      }
    } catch (parseError) {
      console.log('⚠️ Could not parse JSON response')
      console.log('Parse error:', parseError.message)
      // If response is not JSON, check if it's HTML redirect (success case)
      if (responseText.includes('<!DOCTYPE') || response.ok) {
        result = { success: true }
        console.log('Treating as success (HTML redirect detected)')
      } else {
        throw new Error('Invalid response from server')
      }
    }
    
    console.log('=== SUBMISSION END ===')
    
    setIsSubmitting(false)
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
    })
    setComplaintDate(null)
    setChallanDate(null)
    setCloseDate(null)
    
    // Fetch new serial number for next complaint
    console.log('Fetching new serial number...')
    await fetchLastSerialNumber()

  } catch (error) {
    console.error('❌ SUBMISSION ERROR:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    setIsSubmitting(false)
    alert(`Failed to create complaint!\n\nError: ${error.message}\n\nPlease check the console and try again.`)
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
                <label htmlFor="companyName" className="block text-sm font-medium">
                  Company Name *
                </label>
                <select
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleSelectChange("companyName", e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                >
                  <option value="">Select company name</option>
                  {companyNameOptions.map((option, index) => (
                    <option key={`company-${index}`} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Of Call - अब input field है */}
              <div className="space-y-2">
                <label htmlFor="modeOfCall" className="block text-sm font-medium">
                  Mode Of Call *
                </label>
                <input
                  id="modeOfCall"
                  name="modeOfCall"
                  placeholder="Enter mode of call"
                  value={formData.modeOfCall}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="idNumber" className="block text-sm font-medium">
                  ID Number *
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

              {/* Project Name - अब input field है */}
              <div className="space-y-2">
                <label htmlFor="projectName" className="block text-sm font-medium">
                  Project Name *
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
                  Complaint Number *
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
                  Complaint Date *
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
                  Beneficiary Name *
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
                  Contact Number *
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
                  Village *
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
                  Block *
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
                  District *
                </label>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={(e) => handleSelectChange("district", e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                >
                  <option value="">Select district</option>
                  {districtOptions.map((option, index) => (
                    <option key={`district-${index}`} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="product" className="block text-sm font-medium">
                  Product *
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
                  Make *
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
                <label htmlFor="rating" className="block text-sm font-medium">
                  Rating *
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
                  Qty *
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

              {/* NEW FIELD: Controller RID No */}
              <div className="space-y-2">
                <label htmlFor="controllerRidNo" className="block text-sm font-medium">
                  Controller RID No *
                </label>
                <input
                  id="controllerRidNo"
                  name="controllerRidNo"
                  placeholder="Enter controller RID number"
                  value={formData.controllerRidNo}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                />
              </div>

              {/* NEW FIELD: Product SL No */}
              <div className="space-y-2">
                <label htmlFor="productSlNo" className="block text-sm font-medium">
                  Product SL No *
                </label>
                <input
                  id="productSlNo"
                  name="productSlNo"
                  placeholder="Enter product serial number"
                  value={formData.productSlNo}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="insuranceType" className="block text-sm font-medium">
                  Insurance Type *
                </label>
                <select
                  id="insuranceType"
                  name="insuranceType"
                  value={formData.insuranceType}
                  onChange={(e) => handleSelectChange("insuranceType", e.target.value)}
                  required
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

              <div className="space-y-2">
                <label htmlFor="technicianName" className="block text-sm font-medium">
                  Technician Name *
                </label>
                <select
                  id="technicianName"
                  name="technicianName"
                  value={formData.technicianName}
                  onChange={(e) => handleSelectChange("technicianName", e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                >
                  <option value="">Select technician name</option>
                  {technicianNameOptions.map((option, index) => (
                    <option key={`technician-name-${index}`} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="technicianContact" className="block text-sm font-medium">
                  Technician Contact *
                </label>
                <select
                  id="technicianContact"
                  name="technicianContact"
                  value={formData.technicianContact}
                  onChange={(e) => handleSelectChange("technicianContact", e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                >
                  <option value="">Select technician contact</option>
                  {technicianContactOptions.map((option, index) => (
                    <option key={`technician-contact-${index}`} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="assigneeWhatsapp" className="block text-sm font-medium">
                  Assignee WhatsApp Number *
                </label>
                <input
                  id="assigneeWhatsapp"
                  name="assigneeWhatsapp"
                  placeholder="Enter assignee WhatsApp number"
                  value={formData.assigneeWhatsapp}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                />
              </div>

              {/* NEW FIELD: Challan Date */}
              <div className="space-y-2">
                <label htmlFor="challanDate" className="block text-sm font-medium">
                  Challan Date
                </label>
                <div className="relative w-full">
                  <DatePicker
                    id="challan-date-picker"
                    selected={challanDate}
                    onChange={(date) => setChallanDate(date)}
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
                        {challanDate ? challanDate.toLocaleDateString() : "Select challan date"}
                      </div>
                    }
                    wrapperClassName="w-full"
                  />
                </div>
              </div>

              {/* NEW FIELD: Close Date */}
              <div className="space-y-2">
                <label htmlFor="closeDate" className="block text-sm font-medium">
                  Close Date
                </label>
                <div className="relative w-full">
                  <DatePicker
                    id="close-date-picker"
                    selected={closeDate}
                    onChange={(date) => setCloseDate(date)}
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
                        {closeDate ? closeDate.toLocaleDateString() : "Select close date"}
                      </div>
                    }
                    wrapperClassName="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="natureOfComplaint" className="block text-sm font-medium">
                Nature Of Complaint *
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
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md flex items-center justify-center"
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
