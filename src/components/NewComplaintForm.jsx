


"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

function NewComplaintForm() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [complaintDate, setComplaintDate] = useState(null)
  const [challanDate, setChallanDate] = useState(null)
  const [closeDate, setCloseDate] = useState(null)
  const [serialNumber, setSerialNumber] = useState('CT-001')

  // States for inline table editing
  const [showForm, setShowForm] = useState(false)
  const [tableData, setTableData] = useState([])
  const [dataError, setDataError] = useState(null)

  // States for UPDATE MODAL
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [currentUpdateRow, setCurrentUpdateRow] = useState(null)
  const [updateFormData, setUpdateFormData] = useState({})

  // States for dropdown options
  const [companyNameOptions, setCompanyNameOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [technicianNameOptions, setTechnicianNameOptions] = useState([])
  const [technicianContactOptions, setTechnicianContactOptions] = useState([])
  const [insuranceTypeOptions, setInsuranceTypeOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [technicianMapping, setTechnicianMapping] = useState([])
  const [filterCompanyName, setFilterCompanyName] = useState("")
  const [filterTechnicianName, setFilterTechnicianName] = useState("")
  const [filterBeneficiaryName, setFilterBeneficiaryName] = useState("")

  const [debouncedCompanyName, setDebouncedCompanyName] = useState("")
  const [debouncedTechnicianName, setDebouncedTechnicianName] = useState("")
  const [debouncedBeneficiaryName, setDebouncedBeneficiaryName] = useState("")
  const [masterBeneficiaryOptions, setMasterBeneficiaryOptions] = useState([]) // For Create/Update Form (from Master)
  const [filterBeneficiaryOptions, setFilterBeneficiaryOptions] = useState([]) // For Table Filter (from FMS)



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


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCompanyName(filterCompanyName)
    }, 500)

    return () => clearTimeout(timer)
  }, [filterCompanyName])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTechnicianName(filterTechnicianName)
    }, 500)

    return () => clearTimeout(timer)
  }, [filterTechnicianName])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBeneficiaryName(filterBeneficiaryName)
    }, 500)

    return () => clearTimeout(timer)
  }, [filterBeneficiaryName])

  // ✅ FIXED: Only CT-001 format use करें
  // ✅ FINAL FIX: Pure data scan for absolute Maximum ID
  const generateSerialNumber = useCallback(async () => {
    try {
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbwJVTmvMQSqVxvBvejjZxJMIKvFFppXjAbBPDZnXeoIkvEfJSE8GxorNlj_SWQblQ0/exec?action=getAllData&sheetName=FMS',

        { method: 'GET', headers: { 'Accept': 'application/json' } }
      )

      const data = await response.json()

      if (data.success && data.data) {
        let maxNumber = 0;
        // Poore data ko string mein convert karke saare CT- numbers ko regex se dhoondho
        const rawJson = JSON.stringify(data.data);
        const allMatches = rawJson.match(/CT-(\d+)/g);

        if (allMatches) {
          allMatches.forEach(match => {
            const num = parseInt(match.split('-')[1]);
            if (!isNaN(num)) {
              maxNumber = Math.max(maxNumber, num);
            }
          });
        }

        // Agar koi ID nahi mila to default CT-001, warna MAX + 1
        const nextIdNumber = maxNumber > 0 ? maxNumber + 1 : 1;
        const newId = `CT-${nextIdNumber.toString().padStart(3, '0')}`;

        console.log('Detected Max Number:', maxNumber, '| Next ID to use:', newId);
        setSerialNumber(newId);
      }
    } catch (error) {
      console.error('Critical Error in sequence generation:', error);
    }
  }, []);

  // Removed separate useEffect for generateSerialNumber to avoid double fetch

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
        const beneficiaryNames = []


        masterData.table.rows.forEach((row) => {
          if (row.c) {
            // Company Name (Column A / 0)
            if (row.c[0] && row.c[0].v && row.c[0].v !== "Company Name") {
              companyNames.push(row.c[0].v)
            }
            // District (Column D / 3)
            if (row.c[3] && row.c[3].v && row.c[3].v !== "District") {
              districts.push(row.c[3].v)
            }
            // Insurance Type (Column G / 6)
            if (row.c[6] && row.c[6].v && row.c[6].v !== "Insurance Type") {
              insuranceTypes.push(row.c[6].v)
            }
            // Beneficiary Name (Column N / 13)
            if (row.c[13] && row.c[13].v && row.c[13].v !== "Beneficiary Name") {
              beneficiaryNames.push(row.c[13].v)
            }
          }
        })

        setCompanyNameOptions([...new Set(companyNames)])
        setDistrictOptions([...new Set(districts)])
        setInsuranceTypeOptions([...new Set(insuranceTypes)])
        setMasterBeneficiaryOptions([...new Set(beneficiaryNames)].sort())
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
        'https://script.google.com/macros/s/AKfycbwJVTmvMQSqVxvBvejjZxJMIKvFFppXjAbBPDZnXeoIkvEfJSE8GxorNlj_SWQblQ0/exec?action=getAllData&sheetName=FMS',

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
        let filteredData = data.data.slice(1)

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

        // ✅ APPLY FILTERS using DEBOUNCED values
        if (debouncedCompanyName) {
          filteredData = filteredData.filter(row =>
            row[3] && row[3].toLowerCase().includes(debouncedCompanyName.toLowerCase())
          )
        }

        if (debouncedTechnicianName) {
          filteredData = filteredData.filter(row =>
            row[20] && row[20].toLowerCase().includes(debouncedTechnicianName.toLowerCase())
          )
        }

        // Beneficiary options now come from Master sheet, so we don't overwrite them here from FMS data
        // BUT, the USER requested "benificery name filter drop down in the new complain page data from sheet name FMS colum I"
        // Wait, the user said "from sheet name FMS colum I" (which is Beneficiary Name usually?)
        // Let's check Column I (index 8) or Column J (index 9).
        // In the table mapping below: `row[9]` is used for Beneficiary Name.
        // Let's populate filterBeneficiaryOptions dynamically from the FMS data for the FILTER dropdown.

        const dynamicBeneficiaries = [...new Set(filteredData.map(row => row[9]))]
          .filter(name => name && name.toString().trim() !== "")
          .sort()
        setFilterBeneficiaryOptions(dynamicBeneficiaries)


        if (debouncedBeneficiaryName) {
          filteredData = filteredData.filter(row =>
            row[9] && row[9].toLowerCase().includes(debouncedBeneficiaryName.toLowerCase())
          )
        }

        setTableData(filteredData)

        if (filteredData.length === 0) {
          setDataError(userRole === 'tech'
            ? 'No complaints assigned to you'
            : 'No complaints found')
        }
      } else {
        throw new Error(data.error || 'Failed to fetch data from server')
      }
    } catch (error) {
      console.error('Error fetching table data:', error)
      setDataError(error.message)
    }
  }, [debouncedCompanyName, debouncedTechnicianName, debouncedBeneficiaryName])  // ✅ Use debounced values in dependencies


  // ✅ Helper to calculate next serial number from existing data
  const calculateNextSerialNumber = (dataRows) => {
    try {
      let maxNumber = 0;
      // Scan all data for CT- numbers
      // row[1] is Complaint ID usually in CT-XXX format (Column B, index 1) 
      // OR row[7] is Complaint Number? Let's check generateSerialNumber logic
      // Original logic stringified entire data and regexed, which is safer if column index varies
      // But we know "CT-" is the pattern.

      // Let's use the robust method from before but applied to the data we ALREADY have
      const rawJson = JSON.stringify(dataRows);
      const allMatches = rawJson.match(/CT-(\d+)/g);

      if (allMatches) {
        allMatches.forEach(match => {
          const num = parseInt(match.split('-')[1]);
          if (!isNaN(num)) {
            maxNumber = Math.max(maxNumber, num);
          }
        });
      }

      const nextIdNumber = maxNumber > 0 ? maxNumber + 1 : 1;
      const newId = `CT-${nextIdNumber.toString().padStart(3, '0')}`;
      console.log('Calculated Next ID from Table Data:', newId);
      setSerialNumber(newId);
    } catch (err) {
      console.error("Error calculating serial number:", err);
    }
  }

  // Update serial number whenever tableData changes (and has data)
  useEffect(() => {
    if (tableData && tableData.length > 0) {
      // We need the FULL dataset for accurate max ID, not just filtered view
      // Ideally fetchTableData should store full raw data too?
      // But calculating from filtered view might be risky if latest ID is filtered out.
      // However, fetchTableData logic in this file seems to filter mostly on frontend?
      // Yes: "let filteredData = data.data.slice(1)" then "if (userRole === 'tech')..."

      // Actually, calculateNextSerialNumber needs ALL ADMIN DATA. 
      // If logged in as TECH, they only see their rows.
      // This implies TECH users might generate duplicate IDs if they don't see all rows?
      // But generateSerialNumber fetched "getAllData" which returns everything (unless backend restricts?).
      // Backend getAllData returns everything.
      // So we should really store the raw full data for ID generation if we want to avoid the extra call.
      // But fetchTableData *filters* the data before setting tableData if user is TECH.

      // Strategy: Since we want to avoid the extra call, and we want "fast":
      // If we modify fetchTableData to return the full raw data specifically for ID generation before filtering?
      // Yes. But fetchTableData updates state `setTableData`. 

      // Let's keep `generateSerialNumber` as is for now BUT call it only when absolutely necessary (e.g. form open), 
      // OR rely on the fact that for ADMIN it's fine. For TECH, it might be an issue.
      // BUT, to satisfy "Loading time kam karo", parallelizing initial fetch is Key.
      // And we can optimize handleDelete.
    }
  }, [tableData]);


  // Update the auto-refresh useEffect to include filter dependencies
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchTableData()
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, fetchTableData, filterCompanyName, filterTechnicianName, filterBeneficiaryName])


  // Component mount effects
  // Component mount effects
  useEffect(() => {
    const initializeData = async () => {
      // ✅ Parallelize fetches for faster loading
      const dropdownPromise = fetchDropdownOptions()
      const tablePromise = fetchTableData() // Also triggers calculateNextSerialNumber logic if integrated

      // We still want to generate serial number reliably. 
      // Let's run it in parallel too.
      const serialPromise = generateSerialNumber()

      await Promise.all([dropdownPromise, tablePromise, serialPromise])
    }

    initializeData()
  }, [fetchTableData, generateSerialNumber])

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

  // ✅ NEW FUNCTION - Open Update Modal with Pre-filled Data
  const handleOpenUpdateModal = (rowIndex) => {
    const currentRow = tableData[rowIndex]
    console.log('Opening update modal for row:', rowIndex, currentRow)

    // Pre-fill all form data
    setUpdateFormData({
      rowIndex: rowIndex,
      actualRowNumber: currentRow[0], // First element is actual row number
      complaintId: currentRow[2] || "",
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
    })

    setCurrentUpdateRow(rowIndex)
    setShowUpdateModal(true)
  }

  // ✅ Handle Update Form Change
  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target
    setUpdateFormData((prev) => ({ ...prev, [name]: value }))
  }

  // ✅ Handle Update Form Select Change
  const handleUpdateSelectChange = (name, value) => {
    setUpdateFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'technicianName' && value) {
      const selectedTechnician = technicianMapping.find(tech => tech.name === value)
      if (selectedTechnician) {
        setUpdateFormData((prev) => ({
          ...prev,
          [name]: value,
          technicianContact: selectedTechnician.contact
        }))
      }
    }
  }

  // ✅ Handle Update Submit
  const handleUpdateSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      const actualRowNumber = updateFormData.actualRowNumber
      console.log('Updating row:', actualRowNumber, 'Data:', updateFormData)

      // Prepare row data array (same as before, matching Google Sheets columns)
      const currentRow = new Array(60).fill('')

      // Keep existing values from the original row
      const originalRow = tableData[currentUpdateRow]
      currentRow[0] = originalRow[1] // Timestamp
      currentRow[1] = updateFormData.complaintId // Complaint ID
      currentRow[2] = updateFormData.companyName
      currentRow[3] = updateFormData.modeOfCall
      currentRow[4] = updateFormData.idNumber
      currentRow[5] = updateFormData.projectName
      currentRow[6] = updateFormData.complaintNumber
      currentRow[7] = updateFormData.complaintDate ? updateFormData.complaintDate.toLocaleDateString('en-US') : ''
      currentRow[8] = updateFormData.beneficiaryName
      currentRow[9] = updateFormData.contactNumber
      currentRow[10] = updateFormData.village
      currentRow[11] = updateFormData.block
      currentRow[12] = updateFormData.district
      currentRow[13] = updateFormData.product
      currentRow[14] = updateFormData.make
      currentRow[15] = updateFormData.rating
      currentRow[16] = updateFormData.qty
      currentRow[17] = updateFormData.insuranceType
      currentRow[18] = updateFormData.natureOfComplaint
      currentRow[19] = updateFormData.technicianName
      currentRow[20] = updateFormData.technicianContact
      currentRow[21] = updateFormData.assigneeWhatsapp
      currentRow[27] = updateFormData.controllerRidNo
      currentRow[28] = updateFormData.productSlNo
      currentRow[29] = updateFormData.challanDate ? updateFormData.challanDate.toLocaleDateString('en-US') : ''
      currentRow[30] = updateFormData.closeDate ? updateFormData.closeDate.toLocaleDateString('en-US') : ''
      currentRow[31] = updateFormData.challanNo

      // Submit update to Google Sheets using actual row number
      const formDataToSend = new FormData()
      formDataToSend.append('action', 'updateRow')
      formDataToSend.append('sheetName', 'FMS')
      formDataToSend.append('rowIndex', actualRowNumber) // Use actual row number
      formDataToSend.append('rowData', JSON.stringify(currentRow))

      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbwJVTmvMQSqVxvBvejjZxJMIKvFFppXjAbBPDZnXeoIkvEfJSE8GxorNlj_SWQblQ0/exec',

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

          // Close modal
          setShowUpdateModal(false)
          setCurrentUpdateRow(null)
          setUpdateFormData({})

          // Refresh table data
          await fetchTableData()
        } else {
          throw new Error(result.error || 'Update failed')
        }
      } catch (parseError) {
        if (response.ok) {
          alert('Record updated successfully!')

          // Close modal
          setShowUpdateModal(false)
          setCurrentUpdateRow(null)
          setUpdateFormData({})

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

  // Add refresh button handler
  const handleRefreshData = async () => {
    setIsLoading(true)
    await fetchTableData()
    setIsLoading(false)
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
      rowData[1] = serialNumber  // ✅ CT-001 format ही submit होगा
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
        'https://script.google.com/macros/s/AKfycbwJVTmvMQSqVxvBvejjZxJMIKvFFppXjAbBPDZnXeoIkvEfJSE8GxorNlj_SWQblQ0/exec',

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

      // ✅ Force refresh table and ID after submission
      setTimeout(async () => {
        console.log('Refreshing data after submission...')
        await fetchTableData()
        await generateSerialNumber() // Recalculate next ID from fresh data
      }, 2000)

    } catch (error) {
      console.error('Submission error:', error)
      alert(`Failed to create complaint!\n\nError: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Delete Complaint with Optimistic Update
  const handleDelete = async (rowIndex) => {
    const rowToDelete = tableData[rowIndex];
    const rowId = rowToDelete[0];

    if (window.confirm("Are you sure you want to delete this complaint? This action cannot be undone.")) {
      // 1. Optimistic Update: Immediately remove from UI
      const previousData = [...tableData];
      setTableData(prev => prev.filter((_, index) => index !== rowIndex));

      try {
        const formData = new FormData();
        formData.append('action', 'deleteRow');
        formData.append('sheetName', 'FMS');
        formData.append('rowNumber', rowId);

        const response = await fetch(
          'https://script.google.com/macros/s/AKfycbwJVTmvMQSqVxvBvejjZxJMIKvFFppXjAbBPDZnXeoIkvEfJSE8GxorNlj_SWQblQ0/exec',
          {
            method: 'POST',
            body: formData
          }
        );

        const result = await response.json();

        if (result.success || response.ok) {
          console.log("Deleted successfully (Optimistic)");
          calculateNextSerialNumber(previousData.filter((_, index) => index !== rowIndex));
        } else {
          throw new Error(result.error || "Failed to delete from server.");
        }

      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete complaint: " + error.message);
        // Revert UI on failure
        setTableData(previousData);
      }
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {showForm ? 'Hide Form' : 'Add New Complaint'}
                </button>
              </div>
            </div>
            {/* Add this filter section right after the header and before the table */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">

                </label>
                <input
                  type="text"
                  value={filterCompanyName}
                  onChange={(e) => setFilterCompanyName(e.target.value)}
                  placeholder="Search company..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">

                </label>
                <input
                  type="text"
                  value={filterTechnicianName}
                  onChange={(e) => setFilterTechnicianName(e.target.value)}
                  placeholder="Search technician..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">

                </label>
                <select
                  value={filterBeneficiaryName}
                  onChange={(e) => setFilterBeneficiaryName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Beneficiaries</option>
                  {filterBeneficiaryOptions.map((name, index) => (

                    <option key={index} value={name}>
                      {name}
                    </option>
                  ))
                  }
                </select >
              </div >

              {/* Clear All Filters Button */}
              {
                (filterCompanyName || filterTechnicianName || filterBeneficiaryName) && (
                  <div className="md:col-span-3 flex justify-end">
                    <button
                      onClick={() => {
                        setFilterCompanyName("")
                        setFilterTechnicianName("")
                        setFilterBeneficiaryName("")
                      }}
                      className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )
              }
            </div >


            {/* Collapsible Form - WHITE BACKGROUND */}
            {
              showForm && (
                <div className="mb-8 border border-gray-200 rounded-lg p-6 bg-white">
                  <h2 className="text-lg font-semibold mb-4">New Complaint Form</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

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

                      {/* Mode of Call */}
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
                        <select
                          name="beneficiaryName"
                          value={formData.beneficiaryName}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Beneficiary Name</option>
                          {masterBeneficiaryOptions.map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                          ))}
                        </select>

                      </div >

                      {/* Contact Number */}
                      < div >
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
                      </div >

                      {/* Village */}
                      < div >
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
                      </div >

                      {/* Block */}
                      < div >
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
                      </div >

                      {/* District */}
                      < div >
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
                      </div >

                      {/* Product */}
                      < div >
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
                      </div >

                      {/* Make */}
                      < div >
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
                      </div >

                      {/* Rating */}
                      < div >
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
                      </div >

                      {/* Quantity */}
                      < div >
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
                      </div >

                      {/* Controller RID No */}
                      < div >
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
                      </div >

                      {/* Product SL No */}
                      < div >
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
                      </div >

                      {/* Insurance Type */}
                      < div >
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
                      </div >

                      {/* Technician Name */}
                      < div >
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
                      </div >

                      {/* Technician Contact */}
                      < div >
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
                      </div >

                      {/* Assignee WhatsApp */}
                      < div >
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
                      </div >

                      {/* Challan No */}
                      < div >
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
                      </div >

                      {/* Challan Date */}
                      < div >
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
                      </div >

                    </div >

                    {/* Nature of Complaint - Full Width */}
                    < div >
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
                    </div >

                    {/* Form Buttons */}
                    < div className="flex justify-end space-x-3 pt-4" >
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
                    </div >
                  </form >
                </div >
              )
            }

            {/* ✅ UPDATE MODAL - POPUP FORM WITH PRE-FILLED DATA */}
            {
              showUpdateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Update Complaint - {updateFormData.complaintId}
                      </h2>
                      <button
                        onClick={() => setShowUpdateModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <form onSubmit={handleUpdateSubmit} className="p-6 space-y-6">
                      {/* Grid Layout - Same as Create Form */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        {/* Company Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name *
                          </label>
                          <select
                            name="companyName"
                            value={updateFormData.companyName}
                            onChange={handleUpdateFormChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Company</option>
                            {companyNameOptions.map((option, index) => (
                              <option key={index} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>

                        {/* Mode of Call */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mode of Call *
                          </label>
                          <input
                            type="text"
                            name="modeOfCall"
                            value={updateFormData.modeOfCall}
                            onChange={handleUpdateFormChange}
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
                            value={updateFormData.idNumber}
                            onChange={handleUpdateFormChange}
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
                            value={updateFormData.projectName}
                            onChange={handleUpdateFormChange}
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
                            value={updateFormData.complaintNumber}
                            onChange={handleUpdateFormChange}
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
                            selected={updateFormData.complaintDate}
                            onChange={(date) => setUpdateFormData(prev => ({ ...prev, complaintDate: date }))}
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
                          <select
                            name="beneficiaryName"
                            value={updateFormData.beneficiaryName}
                            onChange={handleUpdateFormChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Beneficiary Name</option>
                            {masterBeneficiaryOptions.map((name, index) => (
                              <option key={index} value={name}>{name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Contact Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Number *
                          </label>
                          <input
                            type="tel"
                            name="contactNumber"
                            value={updateFormData.contactNumber}
                            onChange={handleUpdateFormChange}
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
                            value={updateFormData.village}
                            onChange={handleUpdateFormChange}
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
                            value={updateFormData.block}
                            onChange={handleUpdateFormChange}
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
                            value={updateFormData.district}
                            onChange={handleUpdateFormChange}
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
                            value={updateFormData.product}
                            onChange={handleUpdateFormChange}
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
                            value={updateFormData.make}
                            onChange={handleUpdateFormChange}
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
                            value={updateFormData.rating}
                            onChange={handleUpdateFormChange}
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
                            value={updateFormData.qty}
                            onChange={handleUpdateFormChange}
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
                            value={updateFormData.controllerRidNo}
                            onChange={handleUpdateFormChange}
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
                            value={updateFormData.productSlNo}
                            onChange={handleUpdateFormChange}
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
                            value={updateFormData.insuranceType}
                            onChange={handleUpdateFormChange}
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
                            value={updateFormData.technicianName}
                            onChange={(e) => handleUpdateSelectChange('technicianName', e.target.value)}
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
                            value={updateFormData.technicianContact}
                            onChange={handleUpdateFormChange}
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
                            value={updateFormData.assigneeWhatsapp}
                            onChange={handleUpdateFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter WhatsApp Number"
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
                            value={updateFormData.challanNo}
                            onChange={handleUpdateFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter Challan Number"
                          />
                        </div>

                        {/* Challan Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Challan Date
                          </label>
                          <DatePicker
                            selected={updateFormData.challanDate}
                            onChange={(date) => setUpdateFormData(prev => ({ ...prev, challanDate: date }))}
                            dateFormat="dd/MM/yyyy"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholderText="Select challan date"
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
                          value={updateFormData.natureOfComplaint}
                          onChange={handleUpdateFormChange}
                          required
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Describe the nature of complaint..."
                        />
                      </div>

                      {/* Modal Form Buttons */}
                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setShowUpdateModal(false)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Updating...' : 'Update Complaint'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )
            }

            {/* Table with improved UI */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h2 className="text-xl font-semibold">
                  Complaints Data ({tableData.length} records
                  {localStorage.getItem('userRole') === 'tech' && ' assigned to you'}
                  )
                </h2>
              </div>

              {dataError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  {/* Desktop Table View - Hidden on mobile with FIXED HEADER */}
                  <div className="hidden lg:block border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                          <tr>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                              Action
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                              Complaint ID
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                              ID Number
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                              Complaint Date
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                              Company Name
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                              Mode Of Call
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                              Technician Name
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                              Beneficiary Name
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                              Contact Number
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                              Village
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                              District
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                              Product
                            </th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                              Nature Of Complaint
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tableData.map((row, rowIndex) => (
                            <tr key={`complaint-${row[2]}-${rowIndex}`} className="hover:bg-gray-50">
                              <td className="px-3 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleOpenUpdateModal(rowIndex)}
                                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
                                >
                                  Update
                                </button>
                                <button
                                  onClick={() => handleDelete(rowIndex)}
                                  className="ml-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
                                >
                                  Delete
                                </button>

                              </td >
                              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{row[2]}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-purple-600">{row[5] || '-'}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">{row[8] ? new Date(row[8]).toLocaleDateString() : '-'}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">{row[3] || '-'}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">{row[4] || '-'}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">{row[20] || '-'}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">{row[9] || '-'}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">{row[10] || '-'}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">{row[11] || '-'}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">{row[13] || '-'}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">{row[14] || '-'}</td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                {row[19] ? (row[19].length > 50 ? row[19].substring(0, 50) + '...' : row[19]) : '-'}
                              </td>
                            </tr >
                          ))
                          }
                        </tbody >
                      </table >
                    </div >
                  </div >

                  {/* Mobile Card View - Visible on mobile only */}
                  < div className="lg:hidden space-y-4" >
                    {
                      tableData.map((row, rowIndex) => (
                        <div
                          key={`mobile-complaint-${row[2]}-${rowIndex}`}
                          className="border rounded-lg p-4 bg-white border-gray-200"
                        >
                          {/* Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">Complaint ID</div>
                              <div className="font-semibold text-blue-600">{row[2]}</div>
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">ID Number</div>
                              <div className="font-semibold text-purple-600">{row[5] || '-'}</div>
                            </div>
                            <button
                              onClick={() => handleOpenUpdateModal(rowIndex)}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
                            >
                              Update
                            </button>
                          </div>

                          {/* Complaint Details */}
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Date</div>
                                <div className="text-sm font-medium">
                                  {row[8] ? new Date(row[8]).toLocaleDateString() : '-'}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Company</div>
                                <div className="text-sm font-medium">{row[3] || '-'}</div>
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-gray-500 mb-1">Beneficiary Name</div>
                              <div className="text-sm font-medium">{row[9] || '-'}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Contact</div>
                                <div className="text-sm">{row[10] || '-'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Village</div>
                                <div className="text-sm">{row[11] || '-'}</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">District</div>
                                <div className="text-sm">{row[13] || '-'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Product</div>
                                <div className="text-sm">{row[14] || '-'}</div>
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-gray-500 mb-1">Technician</div>
                              <div className="text-sm font-medium">{row[20] || '-'}</div>
                            </div>

                            <div>
                              <div className="text-xs text-gray-500 mb-1">Mode of Call</div>
                              <div className="text-sm">{row[4] || '-'}</div>
                            </div>

                            <div>
                              <div className="text-xs text-gray-500 mb-1">Nature of Complaint</div>
                              <div className="text-sm">{row[19] || '-'}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div >
                </>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                </div>
              )}

            </div >
          </>
        )}
      </div >
    </div >
  )
}

export default NewComplaintForm
