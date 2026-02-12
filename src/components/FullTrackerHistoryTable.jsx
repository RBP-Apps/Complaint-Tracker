"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Filter, Calendar, X } from "react-feather";

function FullTrackerHistoryTable() {
    const [complaints, setComplaints] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [userRole, setUserRole] = useState(null)

    // Advanced Filter States
    const [filterInputs, setFilterInputs] = useState({
        complaintDate: "",
        idNumber: "",
        beneficiaryName: "",
        village: "",
        block: "",
        district: ""
    })

    // localStorage useEffect
    useEffect(() => {
        const loggedInRole = localStorage.getItem('userRole')
        if (loggedInRole) {
            setUserRole(loggedInRole)
        }
    }, [])

    // Data fetching
    useEffect(() => {
        const fetchComplaints = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const sheetUrl = "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=FMS"
                const response = await fetch(sheetUrl)
                const text = await response.text()

                const jsonStart = text.indexOf('{')
                const jsonEnd = text.lastIndexOf('}') + 1
                const jsonData = text.substring(jsonStart, jsonEnd)

                const data = JSON.parse(jsonData)

                if (data && data.table && data.table.rows) {
                    const complaintData = []

                    data.table.rows.forEach((row, index) => {
<<<<<<< HEAD
                        if (row.c && row.c[1]?.v) { // Check if complaint ID exists
=======
                        if (row.c && row.c[1]?.v && index > 0) { // Check if complaint ID exists and skip header row (index 0)
>>>>>>> 4c89a70c46faaa456ffea1552df8a304a9a19de9
                            const complaint = {
                                complaintId: row.c[1]?.v || "", // Column B (1) - Complaint ID
                                companyName: row.c[2]?.v || "", // Column C (2) - Company Name
                                modeOfCall: row.c[3]?.v || "", // Column D (3) - Mode of Call
                                idNumber: row.c[4]?.v || "", // Column E (4) - ID Number
                                projectName: row.c[5]?.v || "", // Column F (5) - Project Name
                                complaintNumber: row.c[6]?.v || "", // Column G (6) - Complaint Number
                                complaintDate: row.c[7] ? (row.c[7].f || formatDateString(row.c[7].v) || row.c[7].v) : "",
                                beneficiaryName: row.c[8]?.v || "", // Column I (8) - Beneficiary Name
                                contactNumber: row.c[9]?.v || "", // Column J (9) - Contact Number
                                village: row.c[10]?.v || "", // Column K (10) - Village
                                block: row.c[11]?.v || "", // Column L (11) - Block
                                district: row.c[12]?.v || "", // Column M (12) - District
                                product: row.c[13]?.v || "", // Column N (13) - Product
                                make: row.c[14]?.v || "", // Column O (14) - Make
                                natureOfComplaint: row.c[18]?.v || "", // Column S (18) - Nature of Complaint
                                technicianName: row.c[19]?.v || "", // Column T (19) - Technician Name
                                status: row.c[25]?.v ? row.c[25].v : "Open",
                                closeDate: row.c[25]?.v === "APPROVED-CLOSE" && row.c[23]?.v
                                    ? (row.c[23].f || formatDateString(row.c[23].v) || row.c[23].v)
                                    : "",
                            };

                            if (complaint.complaintId) {
                                complaintData.push(complaint)
                            }
                        }
                    })
                    setComplaints(complaintData)
                }
            } catch (err) {
                console.error("Error fetching history data:", err)
                setError(err.message)
                setComplaints([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchComplaints()
    }, [])

    const formatDateString = (dateValue) => {
        if (!dateValue) return "";
        let date;
        if (typeof dateValue === 'number' && dateValue > 40000) {
            const googleEpoch = new Date(1899, 11, 30);
            date = new Date(googleEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
        }
        else if (typeof dateValue === 'string' && dateValue.startsWith('Date(')) {
            const match = dateValue.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]);
                const day = parseInt(match[3]);
                date = new Date(year, month, day);
            } else { return dateValue; }
        }
        else if (typeof dateValue === 'object' && dateValue.getDate) { date = dateValue; }
        else { return dateValue; }

        if (isNaN(date.getTime())) return dateValue;

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const parseDateFromDDMMYYYY = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return null;
    };

    const clearFilters = () => {
        setFilterInputs({
            complaintDate: "",
            idNumber: "",
            beneficiaryName: "",
            village: "",
            block: "",
            district: ""
        })
        setSearchTerm("")
        setStatusFilter("All")
    }

    // Memoized unique values for dropdowns
    const uniqueValues = useMemo(() => {
        const getUnique = (key) => [...new Set(complaints.map(c => c[key]).filter(Boolean))].sort();
        return {
            idNumbers: getUnique('idNumber'),
            beneficiaries: getUnique('beneficiaryName'),
            districts: getUnique('district'),
            blocks: getUnique('block'),
            allVillages: getUnique('village')
        };
    }, [complaints]);

    const availableVillages = useMemo(() => {
        if (!filterInputs.block) return uniqueValues.allVillages;
        return [...new Set(complaints
            .filter(c => c.block === filterInputs.block)
            .map(c => c.village)
            .filter(Boolean)
        )].sort();
    }, [complaints, filterInputs.block, uniqueValues.allVillages]);

    const filteredComplaints = complaints.filter((complaint) => {
        const search = searchTerm.toLowerCase();

        const matchesSearch =
            String(complaint.beneficiaryName || "").toLowerCase().includes(search) ||
            String(complaint.complaintId || "").toLowerCase().includes(search) ||
            String(complaint.village || "").toLowerCase().includes(search) ||
            String(complaint.district || "").toLowerCase().includes(search) ||
            String(complaint.projectName || "").toLowerCase().includes(search) ||
            String(complaint.natureOfComplaint || "").toLowerCase().includes(search) ||
            String(complaint.technicianName || "").toLowerCase().includes(search);

        const matchesStatus = statusFilter === "All" || complaint.status === statusFilter;
        const matchesId = !filterInputs.idNumber || String(complaint.idNumber).toLowerCase().includes(filterInputs.idNumber.toLowerCase());
        const matchesBeneficiary = !filterInputs.beneficiaryName || String(complaint.beneficiaryName).toLowerCase().includes(filterInputs.beneficiaryName.toLowerCase());
        const matchesBlock = !filterInputs.block || complaint.block === filterInputs.block;
        const matchesDistrict = !filterInputs.district || complaint.district === filterInputs.district;
        const matchesVillage = !filterInputs.village || String(complaint.village).toLowerCase().includes(filterInputs.village.toLowerCase());

        let matchesDate = true;
        if (filterInputs.complaintDate) {
            const complaintDateObj = parseDateFromDDMMYYYY(complaint.complaintDate);
            if (complaintDateObj) {
                complaintDateObj.setHours(0, 0, 0, 0);
                const filterDateObj = new Date(filterInputs.complaintDate);
                filterDateObj.setHours(0, 0, 0, 0);
                if (complaintDateObj.getTime() !== filterDateObj.getTime()) matchesDate = false;
            } else { matchesDate = false; }
        }

        return matchesSearch && matchesStatus && matchesId && matchesBeneficiary && matchesBlock && matchesDistrict && matchesVillage && matchesDate;
    });


    if (isLoading) {
        return (
            <div className="p-8 flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <div className="text-gray-500 font-medium">Loading history data...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 flex justify-center items-center h-64">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                    Error loading data: {error}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Tracker History</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Viewing all {filteredComplaints.length} complaint records (Historical Data)
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative group flex-1 sm:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="search"
                                    placeholder="Global search..."
                                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                        </div>
                    </div>
                </div>

                {/* Advanced Filters Section */}
                <div className="p-6 bg-white border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-700 font-semibold">
                            <Filter className="h-4 w-4 text-blue-500" />
                            <h3>Advanced Filters</h3>
                        </div>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1.5 font-medium hover:underline"
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear All Filters
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Complaint Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    value={filterInputs.complaintDate}
                                    onChange={(e) => setFilterInputs({ ...filterInputs, complaintDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">District</label>
                            <select
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white transition-all cursor-pointer"
                                value={filterInputs.district}
                                onChange={(e) => setFilterInputs({ ...filterInputs, district: e.target.value })}
                            >
                                <option value="">All Districts</option>
                                {uniqueValues.districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Block</label>
                            <select
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white transition-all cursor-pointer"
                                value={filterInputs.block}
                                onChange={(e) => setFilterInputs({ ...filterInputs, block: e.target.value, village: "" })}
                            >
                                <option value="">All Blocks</option>
                                {uniqueValues.blocks.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Village</label>
                            <input
                                list="history-villages-list"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="Search Village..."
                                value={filterInputs.village}
                                onChange={(e) => setFilterInputs({ ...filterInputs, village: e.target.value })}
                            />
                            <datalist id="history-villages-list">
                                {availableVillages.map(v => <option key={v} value={v} />)}
                            </datalist>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ID Number</label>
                            <input
                                list="history-id-numbers-list"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="Search ID..."
                                value={filterInputs.idNumber}
                                onChange={(e) => setFilterInputs({ ...filterInputs, idNumber: e.target.value })}
                            />
                            <datalist id="history-id-numbers-list">
                                {uniqueValues.idNumbers.map(id => <option key={id} value={id} />)}
                            </datalist>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Beneficiary</label>
                            <input
                                list="history-beneficiaries-list"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="Search Name..."
                                value={filterInputs.beneficiaryName}
                                onChange={(e) => setFilterInputs({ ...filterInputs, beneficiaryName: e.target.value })}
                            />
                            <datalist id="history-beneficiaries-list">
                                {uniqueValues.beneficiaries.map(b => <option key={b} value={b} />)}
                            </datalist>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {filteredComplaints.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50/30">
                            <div className="bg-white inline-block p-4 rounded-full shadow-sm mb-4">
                                <Search className="h-8 w-8 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium">No historical records found matching your criteria</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block max-h-[700px] overflow-y-auto relative scrollbar-thin scrollbar-thumb-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">Complaint ID</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">Date</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">ID Number</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">Beneficiary Name</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">Contact</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">Village</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">Block</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">District</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">Project / Company</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">Technician</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap text-center">Status</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">Close Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredComplaints.map((complaint, index) => (
                                            <tr key={`history-${complaint.complaintId}-${index}`} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">#{complaint.complaintId}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{complaint.complaintDate}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{complaint.idNumber}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{complaint.beneficiaryName}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{complaint.contactNumber}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{complaint.village}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{complaint.block}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{complaint.district}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <div className="font-medium text-gray-800">{complaint.projectName}</div>
                                                    <div className="text-[10px] text-gray-400 leading-none mt-1">{complaint.companyName}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{complaint.technicianName || "-"}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${complaint.status === "APPROVED-CLOSE"
                                                        ? "bg-green-100 text-green-700 border-green-200 shadow-sm"
                                                        : "bg-blue-100 text-blue-700 border-blue-200 shadow-sm"
                                                        }`}>
                                                        {complaint.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 italic">
                                                    {complaint.closeDate || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4 p-4">
                                {filteredComplaints.map((complaint, index) => (
                                    <div key={`m-history-${complaint.complaintId}-${index}`} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm active:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Complaint ID</div>
                                                <div className="text-sm font-black text-blue-600 tracking-tight">#{complaint.complaintId}</div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${complaint.status === "APPROVED-CLOSE"
                                                ? "bg-green-100 text-green-700 border-green-200"
                                                : "bg-blue-100 text-blue-700 border-blue-200"
                                                }`}>
                                                {complaint.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Date</div>
                                                <div className="text-xs font-semibold text-gray-800">{complaint.complaintDate}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">ID Number</div>
                                                <div className="text-xs font-semibold text-gray-800">{complaint.idNumber}</div>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Beneficiary</div>
                                                <div className="text-sm font-black text-gray-900 leading-tight">{complaint.beneficiaryName}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Location</div>
                                                <div className="text-xs font-semibold text-gray-800">{complaint.village}, {complaint.block}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Technician</div>
                                                <div className="text-xs font-semibold text-gray-800">{complaint.technicianName || "-"}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="text-center py-4">
                <p className="text-xs text-gray-400 font-medium">
                    © {new Date().getFullYear()} RBP Complaints Tracker • Full Historical Record Access
                </p>
            </div>
        </div>
    )
}

export default FullTrackerHistoryTable
