// AdminApproved.jsx
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Upload, MapPin, Loader, Edit, Check, X, FileText } from "react-feather"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import DashboardLayout from "../components/DashboardLayout"

function AdminApproved() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("pending")
    const [pendingTasks, setPendingTasks] = useState([])
    const [historyTasks, setHistoryTasks] = useState([])
    const [selectedTask, setSelectedTask] = useState(null)
    const [selectedTaskData, setSelectedTaskData] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [email, setEmail] = useState("")
    const [selectedCompany, setSelectedCompany] = useState("")
    const [companyOptions, setCompanyOptions] = useState([])
    const [filterDistrict, setFilterDistrict] = useState("")
    const [filterBlock, setFilterBlock] = useState("")
    const [filterTechnician, setFilterTechnician] = useState("")

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwnIMOzsFbniWnPFhl3lzE-2W0l6lD23keuz57-ldS_umSXIJqpEK-qxLE6eM0s7drqrQ/exec"

    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true)
            setError(null)

            try {
                console.log("%c[DEBUG] AdminApproved: Fetching FMS sheet data...", "color: cyan")
                const fmsSheetUrl = "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=FMS"

                const fmsRes = await fetch(fmsSheetUrl)
                const fmsText = await fmsRes.text()

                // Parse FMS data
                const fmsJsonStart = fmsText.indexOf("{")
                const fmsJsonEnd = fmsText.lastIndexOf("}") + 1
                const fmsJsonData = fmsText.substring(fmsJsonStart, fmsJsonEnd)
                const fmsData = JSON.parse(fmsJsonData)

                const pendingData = []
                const historyData = []

                if (fmsData?.table?.rows) {
                    fmsData.table.rows.forEach((row, index) => {
                        if (row.c && row.c[1]?.v) {
                            const complaintId = String(row.c[1].v).trim()  // FMS Column B (1) - Complaint ID

                            // *** KEY FILTER: Column Z (index 25) must be "APPROVED-CLOSE" ***
                            const statusValue = row.c[25]?.v ? String(row.c[25].v).trim() : ""
                            if (statusValue !== "APPROVED-CLOSE") return

                            // Planned1 = FMS Column AH (index 33)
                            const planned1 = row.c[33]?.v || null
                            // Actual1 = FMS Column AI (index 34)
                            const actual1 = row.c[34]?.v || null

                            const task = {
                                id: complaintId || `FMS-${index}`,
                                serialNo: row.c[0]?.v || "",             // FMS Column A (0) - Serial No
                                complaintId: complaintId,                 // FMS Column B (1) - Complaint ID
                                idNumber: row.c[4]?.v || "-",            // FMS Column E (4) - ID Number
                                technicianName: row.c[19]?.v || "",      // FMS Column T (19) - Technician Name
                                technicianContact: row.c[20]?.v || "",   // FMS Column U (20) - Technician Contact
                                beneficiaryName: row.c[8]?.v || "",      // FMS Column I (8) - Beneficiary Name
                                contactNumber: row.c[9]?.v || "",        // FMS Column J (9) - Contact Number
                                village: row.c[10]?.v || "",             // FMS Column K (10) - Village
                                block: row.c[11]?.v || "",               // FMS Column L (11) - Block
                                district: row.c[12]?.v || "",            // FMS Column M (12) - District
                                product: row.c[13]?.v || "",             // FMS Column N (13) - Product
                                make: row.c[14]?.v || "",                // FMS Column O (14) - Make
                                natureOfComplaint: row.c[18]?.v || "",   // FMS Column S (18) - Nature of Complaint
                                complaintDate: row.c[7] ? (row.c[7].f || row.c[7].v) : "",  // FMS Column H (7) - Complaint Date
                                status: statusValue,                      // FMS Column Z (25) - Status
                                trackerStatus: statusValue,               // FMS Column Z (25) - Status
                                columnV: planned1,                        // FMS Column AH (33) - Planned1
                                actualDate: actual1,                      // FMS Column AI (34) - Actual1
                                checked: statusValue,                     // Status from FMS
                                remark: "",
                                rowIndex: index + 1,
                            }

                            const hasPlanned1 = planned1 !== null && planned1 !== ""
                            const hasActual1 = actual1 !== null && actual1 !== ""

                            // Pending: Planned1 (FMS AH) has value AND Actual1 (FMS AI) is empty
                            if (hasPlanned1 && !hasActual1) {
                                pendingData.push(task)
                            }
                            // History: Planned1 (FMS AH) has value AND Actual1 (FMS AI) has value
                            else if (hasPlanned1 && hasActual1) {
                                historyData.push(task)
                            }
                        }
                    })
                }

                console.log("%c[DEBUG] AdminApproved: Pending:", "color: lime", pendingData.length, "History:", historyData.length)

                const uniquePending = pendingData.filter((task, index, self) =>
                    index === self.findIndex(t => t.complaintId === task.complaintId)
                )

                const uniqueHistory = historyData.filter((task, index, self) =>
                    index === self.findIndex(t => t.complaintId === task.complaintId)
                )

                setPendingTasks(uniquePending)
                setHistoryTasks(uniqueHistory)

            } catch (err) {
                console.error("AdminApproved: Failed fetching tasks:", err)
                setError(err.message)
                setPendingTasks([])
                setHistoryTasks([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchTasks()
        fetchCompanyOptions()
    }, [])

    const fetchCompanyOptions = async () => {
        try {
            console.log("%c[DEBUG] AdminApproved: Fetching Master sheet for Company data...", "color: cyan")
            const masterSheetUrl =
                "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=Master"

            const response = await fetch(masterSheetUrl)
            const text = await response.text()

            const jsonStart = text.indexOf("{")
            const jsonEnd = text.lastIndexOf("}") + 1
            const jsonData = text.substring(jsonStart, jsonEnd)
            const data = JSON.parse(jsonData)

            const options = []
            // Assume columns: J=Company Name1 (9), K=Address (10), L=Email ID (11), M=Phone No (12)
            // Based on column index 0-based.
            // Let's verify with user provided info: Company Name1, Address, Phone No., Email ID.
            // Headers found: "Company Name1" (J), "Address" (K), "Email id" (L), "Phone no." (M)

            if (data?.table?.rows) {
                data.table.rows.forEach((row, index) => {
                    if (index === 0) return // Skip header if inferred, but usually gviz returns data. 
                    // Gviz usually treats first row as headers if asked, but here we get data.
                    // First row usually contains labels if we look at cols, but rows are data.
                    // Let's assume indices 9, 10, 11, 12 correspond to J, K, L, M.

                    const companyName1 = row.c[9]?.v
                    if (companyName1) {
                        options.push({
                            name: companyName1,
                            address: row.c[10]?.v || "",
                            email: row.c[11]?.v || "",
                            phone: row.c[12]?.v || ""
                        })
                    }
                })
            }

            console.log("%c[DEBUG] AdminApproved: Fetched Company options:", "color: lime", options)
            setCompanyOptions(options)

        } catch (err) {
            console.error("%c[ERROR] AdminApproved: Failed fetching Master sheet options:", "color: red", err)
        }
    }

    const handleUpdateTask = async () => {
        if (!email) {
            alert("Please enter an email address.")
            return
        }
        if (!selectedCompany) {
            alert("Please select a company.")
            return
        }

        setIsSubmitting(true)

        try {
            const currentTasks = [...pendingTasks]
            const taskIndex = currentTasks.findIndex(t => t.id === selectedTask)
            if (taskIndex === -1 && activeTab === 'pending') throw new Error("Task not found")
            const task = activeTab === 'pending' ? { ...currentTasks[taskIndex] } : selectedTaskData

            const companyDetails = companyOptions.find(c => c.name === selectedCompany) || {}

            // Save selection to localStorage for AdminLetter.jsx to pick up
            const savedData = localStorage.getItem(`admin_letter_${task.complaintId}`);
            let letterInfoToUse = {};
            if (savedData) {
                const parsed = JSON.parse(savedData);
                letterInfoToUse = parsed.letterInfo;
                // Update header info in local storage too
                parsed.headerInfo = {
                    companyName: companyDetails.name,
                    address: companyDetails.address,
                    location: "", // Not available in master?
                    contact: `Phone No. ${companyDetails.phone} Email : ${companyDetails.email}`
                };
                localStorage.setItem(`admin_letter_${task.complaintId}`, JSON.stringify(parsed));
            } else {
                // Use structure from AdminLetter default
                // Since we can't easily import defaults without refactoring, we'll rely on the existing AdminLetter logic to load defaults if missing,
                // or construct a basic one here for the email generation.
                letterInfoToUse = {
                    letterNo: `SSY/2025/${Math.floor(Math.random() * 900) + 100}`,
                    date: new Date().toLocaleDateString("en-GB").replace(/\//g, "."),
                    subject: "जिला कोण्डागांव में सौर सुजला योजनांतर्गत स्थापित सिंचाई सोलर पंप के संबंध में ।",
                    reference: [
                        "पत्र क्र. 2386/क्रेडा/जि.का./SSY/O&M/F-04/2024-25 कोण्डागांव, दिनांक 06.11.2025,",
                        "जिला कार्यालय कोण्डागांव का पत्र क्रमांक / दिनांक 2067 / 26.09.2025, 2282 / 29.10.2025, 2112 / 29.09.2025 |"
                    ],
                    officerName: "जिला प्रभारी,",
                    department: "छत्तीसगढ़ राज्य अक्षय ऊर्जा विकास अभिकरण (क्रेडा)",
                    districtOffice: `जिला कार्यालय, ${task.district || 'कोण्डागांव'} (छ०ग०)`,
                    salutation: "महोदय,",
                    introParagraph: "उपरोक्त विषयांतर्गत लेख है कि, जिला कोण्डागांव अंतर्गत हमारे द्वारा विभिन्न स्थलों में सोलर पंपों स्थापित किया गया है। जिसकी अकार्य शीलता की सूचना हमें आपके संदर्भित पत्र के माध्यम से प्राप्त हुआ। जिसका विवरण निम्नानुसार है-",
                    closingParagraph: "उपरोक्त साईट के संयंत्र का सुधार कार्य हमारे द्वारा कर दिया गया है, तथा संयंत्र वर्तमान में कार्य शील है। इस पत्र के साथ साईट की संपुष्टि पत्र संलग्न है। पत्र आपकी ओर सादर सूचनार्थ हेतु प्रेषित।",
                    thankYou: "सधन्यवाद !",
                    regards: "भवदीय",
                    forCompany: `वास्ते, ${companyDetails.name}`,
                    designation: "अधिकृत हस्ताक्षरकर्ता",
                    copiesTo: [
                        "कार्यपालन अभियंता महोदय, (RE-05) क्रेडा प्रधान कार्यालय, रायपुर को सादर सूचनार्थ प्रेषित।",
                        "कार्यपालन अभियंता महोदय,क्रेडा जोनल कार्यालय, जगदलपुर को सादर सूचनार्थ प्रेषित।"
                    ]
                }
            }

            // Generate HTML
            // We need to import the helper. I will add import at top later, or use dynamic import?
            // Since this is a replacement chunk, I should add import at top. But I can't edit top in the same tool call easily if I didn't plan it.
            // I'll assume I'll add the import in a separate chunk or this one if I can match the top.
            // Wait, I can't match top and this middle part in one replace_file_content call unless I replace everything between.
            // I'll use multi_replace.

            // For now, let's look at the body of handleUpdateTask.

            // Construct Header Info for the helper
            const headerInfo = {
                companyName: companyDetails.name,
                address: companyDetails.address,
                location: "",
                contact: `Phone No. ${companyDetails.phone} Email : ${companyDetails.email}`
            };

            // Dynamic import to avoid top-level import issue in this chunk? No, React supports top level.
            // I will add the import in a separate chunk in this multi_replace.

            const htmlContent = (await import("../utils/letterTemplate.js")).generateLetterHTML(task, headerInfo, letterInfoToUse);

            const formData = new FormData()
            formData.append('action', 'sendComplaintLetter') // New action for email
            formData.append('email', email)
            formData.append('subject', letterInfoToUse.subject)
            formData.append('htmlBody', htmlContent)
            formData.append('complaintId', task.complaintId)
            formData.append('companyName', selectedCompany) // Save company name

            // We also want to update the tracker as per "Selected company details must be saved"
            // And also "Do NOT affect any other existing functionality".
            // The existing functionality was updating 'checked' and 'remark'.
            // Since we removed inputs, we send empty or don't send?
            // If we don't send 'checkedValue', the backend might fail if it expects it.
            // We'll send the existing values from the task.
            formData.append('checkedValue', task.checked || (task.trackerStatus === 'APPROVED-CLOSE' ? 'APPROVED-CLOSE' : ''))
            formData.append('remarkValue', task.remark || '')

            console.log('AdminApproved: Submitting data:', {
                action: 'sendComplaintLetter',
                email,
                company: selectedCompany
            })

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()
            console.log('AdminApproved: Response:', result)

            if (!result.success) {
                // If backend warns about missing action, we might need to fallback
                if (result.error && result.error.includes("action")) {
                    alert("Backend does not support sending email yet. Please contact admin.")
                } else {
                    throw new Error(result.error || 'Failed to send email')
                }
            } else {
                alert(`Letter generated and sent to ${email} successfully!`)
            }

            // Update local state to reflect successful processing if needed
            // If we are in 'pending', we might want to move it to history or just leave it?
            // The prompt says "After entering ... Submit... Generate... Send...". It doesn't explicitly say "Move to history".
            // But previous logic moved it to history. "Pending" means not yet processed.
            // If we processed it (sent email), it should probably be considered "checked" or "done".

            // I will update the lists as before to give feedback.
            setPendingTasks(prev => prev.filter(t => t.complaintId !== task.complaintId))

            setHistoryTasks(prev => {
                const exists = prev.some(t => t.complaintId === task.complaintId)
                if (exists) {
                    return prev.map(t => t.complaintId === task.complaintId ? task : t)
                }
                return [...prev, task]
            })

            setIsDialogOpen(false)
            resetDialogState()

        } catch (err) {
            console.error("AdminApproved: Error updating task:", err)
            alert("Failed to process: " + err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetDialogState = () => {
        setSelectedTask(null)
        setSelectedTaskData(null)
        setEmail("")
        setSelectedCompany("")
    }

    const getCurrentTasks = () => {
        return activeTab === "pending" ? pendingTasks : historyTasks
    }

    const filteredTasks = getCurrentTasks().filter((task) => {
        // Dropdown Filters
        if (filterDistrict && task.district !== filterDistrict) return false
        if (filterBlock && task.block !== filterBlock) return false
        if (filterTechnician && task.technicianName !== filterTechnician) return false

        // Search Filter
        if (!searchTerm || searchTerm.trim() === "") return true

        const searchFields = [
            task.complaintId,
            task.idNumber,
            task.technicianName,
            task.technicianContact,
            task.beneficiaryName,
            task.contactNumber,
            task.village,
            task.block,
            task.district,
            task.product,
            task.make,
            task.natureOfComplaint,
            task.trackerStatus,
            task.checked,
            task.remark
        ]

        const normalizeText = (text) => {
            if (!text) return ""
            return text.toString().toLowerCase().trim()
        }

        const normalizedSearchTerm = normalizeText(searchTerm)
        const searchWords = normalizedSearchTerm.split(/\s+/).filter(word => word.length > 0)

        return searchWords.every(word =>
            searchFields.some(field =>
                normalizeText(field).includes(word)
            )
        )
    })

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-gray-500">Loading admin approved data...</div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-red-500">Error loading data: {error}</div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Admin Approved</h1>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => {
                                setActiveTab("pending")
                                setFilterDistrict("")
                                setFilterBlock("")
                                setFilterTechnician("")
                                setSearchTerm("")
                            }}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "pending"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Pending ({pendingTasks.length})
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("history")
                                setFilterDistrict("")
                                setFilterBlock("")
                                setFilterTechnician("")
                                setSearchTerm("")
                            }}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "history"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            History ({historyTasks.length})
                        </button>
                    </nav>
                </div>

                {/* Filters */}
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="search"
                            placeholder="Search across all fields"
                            className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* District Filter */}
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filterDistrict}
                        onChange={(e) => setFilterDistrict(e.target.value)}
                    >
                        <option value="">All Districts</option>
                        {[...new Set(getCurrentTasks().map(t => t.district))].filter(Boolean).sort().map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                        ))}
                    </select>

                    {/* Block Filter */}
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filterBlock}
                        onChange={(e) => setFilterBlock(e.target.value)}
                    >
                        <option value="">All Blocks</option>
                        {[...new Set(getCurrentTasks().map(t => t.block))].filter(Boolean).sort().map(block => (
                            <option key={block} value={block}>{block}</option>
                        ))}
                    </select>

                    {/* Technician Filter */}
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filterTechnician}
                        onChange={(e) => setFilterTechnician(e.target.value)}
                    >
                        <option value="">All Technicians</option>
                        {[...new Set(getCurrentTasks().map(t => t.technicianName))].filter(Boolean).sort().map(tech => (
                            <option key={tech} value={tech}>{tech}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                        {/* Desktop Table View - Fixed Header & Scrollable Body */}
                        <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0 max-h-[600px] overflow-y-auto border border-gray-200 rounded-lg">
                            <div className="inline-block min-w-full align-middle">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100 sticky top-0 z-10">
                                        <tr>
                                            {activeTab === "pending" && (
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                    Actions
                                                </th>
                                            )}
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Complaint Id
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                ID Number
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Technician Name
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Technician Contact
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Beneficiary Name
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Contact Number
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Village
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Block
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                District
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Product
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Make
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Nature Of Complaint
                                            </th>

                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Status
                                            </th>
                                            {activeTab === "history" && (
                                                <>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                        Actual Date
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                        Checked
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                        Remark
                                                    </th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredTasks.length === 0 ? (
                                            <tr>
                                                <td colSpan={activeTab === "pending" ? 14 : 16} className="px-3 py-10 text-center text-gray-500 italic font-medium">
                                                    {activeTab === "pending"
                                                        ? "No pending admin approved complaints found"
                                                        : "No admin approved complaint history found"
                                                    }
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTasks.map((task, index) => (
                                                <tr key={task.complaintId || index} className="hover:bg-gray-50">
                                                    {activeTab === "pending" && (
                                                        <td className="px-3 py-4 whitespace-nowrap">
                                                            <button
                                                                className="bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 border-0 py-1 px-3 rounded-md"
                                                                onClick={() => {
                                                                    setSelectedTask(task.id)
                                                                    setSelectedTaskData(task)
                                                                    setIsDialogOpen(true)
                                                                    setIsDialogOpen(true)
                                                                    setEmail("")
                                                                    setSelectedCompany("")
                                                                }}
                                                            >
                                                                Review
                                                            </button>
                                                        </td>
                                                    )}
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.complaintId}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{task.idNumber}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.technicianName}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.technicianContact}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.beneficiaryName}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.contactNumber}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.village}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.block}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.district}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.product}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.make}</td>
                                                    <td className="px-3 py-4 whitespace-nowrap text-sm max-w-xs truncate" title={task.natureOfComplaint}>
                                                        {task.natureOfComplaint}
                                                    </td>

                                                    <td className="px-3 py-4 whitespace-nowrap text-sm">{task.trackerStatus}</td>
                                                    {activeTab === "history" && (
                                                        <>
                                                            <td className="px-3 py-4 whitespace-nowrap text-sm">{task.actualDate}</td>
                                                            <td className="px-3 py-4 whitespace-nowrap text-sm">
                                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                    {task.checked}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-4 whitespace-nowrap text-sm max-w-xs truncate" title={task.remark}>
                                                                {task.remark}
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="block md:hidden space-y-3">
                            {filteredTasks.length === 0 ? (
                                <div className="text-center p-10 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-gray-500 italic">
                                        {activeTab === "pending"
                                            ? "No pending admin approved complaints found"
                                            : "No admin approved complaint history found"
                                        }
                                    </p>
                                </div>
                            ) : (
                                filteredTasks.map((task, index) => (
                                    <div key={task.complaintId || index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{task.complaintId}</span>
                                            <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded">{task.trackerStatus}</span>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">ID Number</span>
                                                <span className="text-gray-900 font-medium">{task.idNumber}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Beneficiary</span>
                                                <span className="text-gray-900">{task.beneficiaryName}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Village</span>
                                                <span className="text-gray-900">{task.village}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Product</span>
                                                <span className="text-gray-900">{task.product}</span>
                                            </div>

                                            {/* Technician Info */}
                                            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs">
                                                <span className="text-gray-500">Technician</span>
                                                <span className="text-gray-900">{task.technicianName}</span>
                                            </div>

                                            {/* History specific fields */}
                                            {activeTab === "history" && (
                                                <div className="mt-2 pt-2 border-t border-gray-100">
                                                    <div className="flex justify-between text-xs items-center">
                                                        <span className="text-gray-500">Actual Date</span>
                                                        <span className="text-gray-900">{task.actualDate}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs items-center mt-1">
                                                        <span className="text-gray-500">Status</span>
                                                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                            {task.checked}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action button for pending */}
                                            {activeTab === "pending" && (
                                                <div className="mt-2">
                                                    <button
                                                        className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-1.5 rounded-md text-xs font-medium"
                                                        onClick={() => {
                                                            setSelectedTask(task.id)
                                                            setSelectedTaskData(task)
                                                            setIsDialogOpen(true)
                                                            setIsDialogOpen(true)
                                                            setEmail("")
                                                            setSelectedCompany("")
                                                        }}
                                                    >
                                                        Review
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Review Dialog */}
                {isDialogOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsDialogOpen(false)}></div>
                            </div>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                Review Complaint: {selectedTaskData?.complaintId}
                                            </h3>
                                            <div className="mt-4 max-h-[60vh] overflow-auto">
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    {/* Pre-filled fields - read only */}
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Complaint Id
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={selectedTaskData?.complaintId || ""}
                                                            readOnly
                                                            className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-50 text-gray-600"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Technician Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={selectedTaskData?.technicianName || ""}
                                                            readOnly
                                                            className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-50 text-gray-600"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Beneficiary Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={selectedTaskData?.beneficiaryName || ""}
                                                            readOnly
                                                            className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-50 text-gray-600"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Village
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={selectedTaskData?.village || ""}
                                                            readOnly
                                                            className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-50 text-gray-600"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Product
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={selectedTaskData?.product || ""}
                                                            readOnly
                                                            className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-50 text-gray-600"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Status
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={selectedTaskData?.trackerStatus || ""}
                                                            readOnly
                                                            className="w-full border border-gray-300 rounded-md py-2 px-3 bg-gray-50 text-gray-600"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                                                            Select Company <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            id="company"
                                                            value={selectedCompany}
                                                            onChange={(e) => setSelectedCompany(e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="">Select a company</option>
                                                            {companyOptions.map((opt, index) => (
                                                                <option key={index} value={opt.name}>
                                                                    {opt.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                            Email ID <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="email"
                                                            id="email"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            placeholder="Enter email address"
                                                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 mt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/dashboard/admin-letter/${selectedTaskData?.complaintId}`)}
                                                    className="py-2 px-4 border border-blue-300 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center"
                                                    disabled={isSubmitting}
                                                >
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Generate Letter
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsDialogOpen(false)}
                                                    className="py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                                                    disabled={isSubmitting}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleUpdateTask}
                                                    className="bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white py-2 px-4 rounded-md flex items-center"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        "Submit"
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    )
}

export default AdminApproved
