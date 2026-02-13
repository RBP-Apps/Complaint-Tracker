import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft, Plus, Download, Save, Send, Share2, Mail } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const AdminLetter = () => {
    const { complaintId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [taskData, setTaskData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [companyOptions, setCompanyOptions] = useState([]);

    // Header Content State
    const [headerInfo, setHeaderInfo] = useState({
        companyName: "TANAY VIDHYUT (I) PVT. LTD.",
        address: "P.S. City Colony, House No. 08, Changorabhata",
        location: "Raipur (C.G.) - 492013",
        contact: "Phone No. +91 94255398289 Email : tanay.vidhyut@gmail.com"
    });

    // Letter Content State (Dynamic)
    const [letterInfo, setLetterInfo] = useState({
        letterNo: `SSY/2025/${Math.floor(Math.random() * 900) + 100}`,
        date: new Date().toLocaleDateString("en-GB").replace(/\//g, "."),
        subject: "जिला कोण्डागांव में सौर सुजला योजनांतर्गत स्थापित सिंचाई सोलर पंप के संबंध में ।",
        reference: [
            "पत्र क्र. 2386/क्रेडा/जि.का./SSY/O&M/F-04/2024-25 कोण्डागांव, दिनांक 06.11.2025,",
            "जिला कार्यालय कोण्डागांव का पत्र क्रमांक / दिनांक 2067 / 26.09.2025, 2282 / 29.10.2025, 2112 / 29.09.2025 |"
        ],
        officerName: "जिला प्रभारी,",
        department: "छत्तीसगढ़ राज्य अक्षय ऊर्जा विकास अभिकरण (क्रेडा)",
        districtOffice: "जिला कार्यालय, कोण्डागांव (छ०ग०)",
        salutation: "महोदय,",
        introParagraph: "उपरोक्त विषयांतर्गत लेख है कि, जिला कोण्डागांव अंतर्गत हमारे द्वारा विभिन्न स्थलों में सोलर पंपों स्थापित किया गया है। जिसकी अकार्य शीलता की सूचना हमें आपके संदर्भित पत्र के माध्यम से प्राप्त हुआ। जिसका विवरण निम्नानुसार है-",
        closingParagraph: "उपरोक्त साईट के संयंत्र का सुधार कार्य हमारे द्वारा कर दिया गया है, तथा संयंत्र वर्तमान में कार्य शील है। इस पत्र के साथ साईट की संपुष्टि पत्र संलग्न है। पत्र आपकी ओर सादर सूचनार्थ हेतु प्रेषित।",
        thankYou: "सधन्यवाद !",
        regards: "भवदीय",
        forCompany: "वास्ते, तनय विद्युत (ई०) प्रालि.",
        designation: "अधिकृत हस्ताक्षरकर्ता",
        copiesTo: [
            "कार्यपालन अभियंता महोदय, (RE-05) क्रेडा प्रधान कार्यालय, रायपुर को सादर सूचनार्थ प्रेषित।",
            "कार्यपालन अभियंता महोदय,क्रेडा जोनल कार्यालय, जगदलपुर को सादर सूचनार्थ प्रेषित।"
        ]
    });

    // Dynamic Table State
    const [tableColumns, setTableColumns] = useState(["क्र.", "सौर समाधान क्र.", "आई. डी. नं.", "हितग्राही का नाम", "ग्राम/ विकासखण्ड़", "दिनांक", "रिमार्क"]);
    const [tableData, setTableData] = useState([
        {
            "क्र.": "01.",
            "सौर समाधान क्र.": "2936",
            "आई. डी. नं.": "819241",
            "हितग्राही का नाम": "SARADU RAM PATEL/ NIRANJAN PATEL",
            "ग्राम/ विकासखण्ड़": "BAMHANI/ KONDAGAON",
            "दिनांक": "23.10.2025",
            "रिमार्क": "संयंत्र कार्य शील हैं।"
        }
    ]);

    useEffect(() => {
        const fetchTaskDetails = async () => {
            setLoading(true);
            try {
                // First check if we have saved data in localStorage
                const savedData = localStorage.getItem(`admin_letter_${complaintId}`);
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    setLetterInfo(parsed.letterInfo);
                    setHeaderInfo(parsed.headerInfo);
                    setTableColumns(parsed.tableColumns);
                    setTableData(parsed.tableData);
                    setLoading(false);
                    return;
                }

                const trackerSheetUrl = "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=Tracker";
                const response = await fetch(trackerSheetUrl);
                const text = await response.text();
                const jsonStart = text.indexOf("{");
                const jsonEnd = text.lastIndexOf("}") + 1;
                const jsonData = text.substring(jsonStart, jsonEnd);
                const data = JSON.parse(jsonData);

                if (data?.table?.rows) {
                    const row = data.table.rows.find(r => r.c && r.c[2] && String(r.c[2].v).trim() === complaintId);
                    if (row) {
                        const task = {
                            complaintId: row.c[2]?.v || "",
                            idNumber: row.c[1]?.v || "",
                            beneficiaryName: row.c[5]?.v || "",
                            village: row.c[7]?.v || "",
                            block: row.c[8]?.v || "",
                            district: row.c[9]?.v || "",
                            actualDate: row.c[22]?.v || new Date().toLocaleDateString("en-GB")
                        };
                        setTaskData(task);

                        // Auto-fill table with task data
                        setTableData([{
                            "क्र.": "01.",
                            "सौर समाधान क्र.": task.complaintId || "-",
                            "आई. डी. नं.": task.idNumber || "-",
                            "हितग्राही का नाम": task.beneficiaryName || "-",
                            "ग्राम/ विकासखण्ड़": `${task.village || ""}/ ${task.block || ""}`,
                            "दिनांक": task.actualDate || "-",
                            "रिमार्क": "संयंत्र कार्य शील हैं।"
                        }]);

                        // Update district in letter
                        if (task.district) {
                            setLetterInfo(prev => ({
                                ...prev,
                                districtOffice: `जिला कार्यालय, ${task.district} (छ०ग०)`,
                                introParagraph: prev.introParagraph.replace(/कोण्डागांव/g, task.district)
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching task details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (complaintId) {
            fetchTaskDetails();
            fetchCompanyOptions();
        }
    }, [complaintId]);

    const fetchCompanyOptions = async () => {
        try {
            const masterSheetUrl = "https://docs.google.com/spreadsheets/d/1A9kxc6P8UkQ-pY8R8DQHpW9OIGhxeszUoTou1yKpNvU/gviz/tq?tqx=out:json&sheet=Master";
            const response = await fetch(masterSheetUrl);
            const text = await response.text();
            const jsonStart = text.indexOf("{");
            const jsonEnd = text.lastIndexOf("}") + 1;
            const jsonData = text.substring(jsonStart, jsonEnd);
            const data = JSON.parse(jsonData);

            const options = [];
            if (data?.table?.rows) {
                data.table.rows.forEach((row, index) => {
                    if (index === 0) return
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
            setCompanyOptions(options);
        } catch (error) {
            console.error("Error fetching company options:", error);
        }
    };

    const addRow = () => {
        const newRow = {};
        tableColumns.forEach(col => {
            newRow[col] = "";
        });
        const lastRow = tableData[tableData.length - 1];
        if (lastRow && lastRow["क्र."]) {
            const lastNum = parseInt(lastRow["क्र."]);
            if (!isNaN(lastNum)) {
                newRow["क्र."] = (lastNum + 1).toString().padStart(2, '0') + ".";
            }
        }
        setTableData([...tableData, newRow]);
    };

    const handleTableEdit = (rowIndex, colName, value) => {
        const newData = [...tableData];
        newData[rowIndex][colName] = value;
        setTableData(newData);
    };

    const handleLetterEdit = (field, value) => {
        setLetterInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleHeaderEdit = (field, value) => {
        setHeaderInfo(prev => ({ ...prev, [field]: value }));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSave = () => {
        setIsSaving(true);
        const dataToSave = {
            letterInfo,
            headerInfo,
            tableColumns,
            tableData
        };
        localStorage.setItem(`admin_letter_${complaintId}`, JSON.stringify(dataToSave));
        setTimeout(() => {
            setIsSaving(false);
            alert("Letter data saved successfully!");
        }, 500);
    };

    const handleWhatsApp = () => {
        const message = `Admin Approved Letter\nLetter No: ${letterInfo.letterNo}\nComplaint ID: ${complaintId}\nSubject: ${letterInfo.subject}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
    };

    const handleEmail = () => {
        const subject = encodeURIComponent(`Admin Approved Letter - ${letterInfo.letterNo}`);
        const body = encodeURIComponent(
            `Admin Approved Letter\n\n` +
            `Letter No: ${letterInfo.letterNo}\n` +
            `Complaint ID: ${complaintId}\n` +
            `Subject: ${letterInfo.subject}\n\n` +
            `This letter has been approved by the Admin.`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
                {/* Toolbar */}
                <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            className={`flex items-center gap-2 px-4 py-2 ${isSaving ? 'bg-gray-400' : 'bg-blue-600'} text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md`}
                            disabled={isSaving}
                        >
                            <Save size={18} />
                            {isSaving ? "Saving..." : "Save Data"}
                        </button>
                        <button
                            onClick={handleWhatsApp}
                            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20ba5a] transition-colors shadow-md"
                        >
                            <Send size={18} />
                            WhatsApp
                        </button>
                        <button
                            onClick={handleEmail}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                        >
                            <Mail size={18} />
                            Email
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                        >
                            <Printer size={18} />
                            Print
                        </button>
                    </div>
                </div>

                {/* Letter Content */}
                <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-none p-12 print:shadow-none print:p-8 min-h-[1056px] relative overflow-hidden boarder border-gray-100" id="letter-content">
                    {/* Editable Header */}
                    <div className="text-center mb-10 border-b-2 border-black pb-4">
                        <div className="mb-4 no-print flex justify-center">
                            <select
                                className="border border-gray-300 rounded px-2 py-1 bg-white text-sm"
                                onChange={(e) => {
                                    const selected = companyOptions.find(c => c.name === e.target.value);
                                    if (selected) {
                                        setHeaderInfo({
                                            companyName: selected.name,
                                            address: selected.address,
                                            location: "",
                                            contact: `Phone No. ${selected.phone} Email : ${selected.email}`
                                        });
                                        // Also update "For Company" signature line
                                        setLetterInfo(prev => ({
                                            ...prev,
                                            forCompany: `वास्ते, ${selected.name}`
                                        }));
                                    }
                                }}
                            >
                                <option value="">Select Company Header</option>
                                {companyOptions.map((opt, i) => (
                                    <option key={i} value={opt.name}>{opt.name}</option>
                                ))}
                            </select>
                        </div>
                        <input
                            type="text"
                            value={headerInfo.companyName}
                            onChange={(e) => handleHeaderEdit("companyName", e.target.value)}
                            className="text-3xl font-bold text-gray-900 tracking-wider w-full text-center focus:outline-none border-none bg-transparent"
                        />
                        <input
                            type="text"
                            value={headerInfo.address}
                            onChange={(e) => handleHeaderEdit("address", e.target.value)}
                            className="text-sm mt-1 w-full text-center focus:outline-none border-none bg-transparent"
                        />
                        <input
                            type="text"
                            value={headerInfo.location}
                            onChange={(e) => handleHeaderEdit("location", e.target.value)}
                            className="text-sm font-medium w-full text-center focus:outline-none border-none bg-transparent"
                        />
                        <input
                            type="text"
                            value={headerInfo.contact}
                            onChange={(e) => handleHeaderEdit("contact", e.target.value)}
                            className="text-sm w-full text-center focus:outline-none border-none bg-transparent"
                        />
                    </div>

                    {/* Letter Body */}
                    <div className="space-y-6 text-base text-gray-800 leading-relaxed font-serif">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-2 items-center">
                                <span>पत्र क्र.</span>
                                <input
                                    type="text"
                                    value={letterInfo.letterNo}
                                    onChange={(e) => handleLetterEdit("letterNo", e.target.value)}
                                    className="border-b border-transparent focus:border-blue-300 focus:outline-none bg-transparent font-bold w-40"
                                />
                            </div>
                            <div className="flex gap-2 items-center">
                                <span>दिनांक</span>
                                <input
                                    type="text"
                                    value={letterInfo.date}
                                    onChange={(e) => handleLetterEdit("date", e.target.value)}
                                    className="border-b border-transparent focus:border-blue-300 focus:outline-none bg-transparent font-bold w-32"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="font-bold">प्रति,</p>
                            <div className="pl-12 space-y-1">
                                <input
                                    className="w-full border-b border-transparent focus:border-blue-300 focus:outline-none bg-transparent"
                                    value={letterInfo.officerName}
                                    onChange={(e) => handleLetterEdit("officerName", e.target.value)}
                                />
                                <input
                                    className="w-full border-b border-transparent focus:border-blue-300 focus:outline-none bg-transparent"
                                    value={letterInfo.department}
                                    onChange={(e) => handleLetterEdit("department", e.target.value)}
                                />
                                <input
                                    className="w-full border-b border-transparent focus:border-blue-300 focus:outline-none bg-transparent"
                                    value={letterInfo.districtOffice}
                                    onChange={(e) => handleLetterEdit("districtOffice", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <span className="font-bold whitespace-nowrap min-w-[60px]">विषय:-</span>
                            <textarea
                                className="w-full border-b border-transparent focus:border-blue-300 focus:outline-none bg-transparent h-auto resize-none font-bold align-top pt-0"
                                rows="2"
                                value={letterInfo.subject}
                                onChange={(e) => handleLetterEdit("subject", e.target.value)}
                            />
                        </div>

                        <div className="mt-4 flex gap-2">
                            <span className="font-bold whitespace-nowrap min-w-[60px]">संदर्भ:-</span>
                            <div className="w-full space-y-2">
                                {letterInfo.reference.map((ref, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <span className="min-w-[20px]">{idx + 1})</span>
                                        <textarea
                                            className="w-full border-b border-transparent focus:border-blue-300 focus:outline-none bg-transparent h-auto resize-none align-top pt-0"
                                            rows="2"
                                            value={ref}
                                            onChange={(e) => {
                                                const newRefs = [...letterInfo.reference];
                                                newRefs[idx] = e.target.value;
                                                handleLetterEdit("reference", newRefs);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6">
                            <input
                                className="w-full border-b border-transparent focus:border-blue-300 focus:outline-none bg-transparent font-bold"
                                value={letterInfo.salutation}
                                onChange={(e) => handleLetterEdit("salutation", e.target.value)}
                            />
                        </div>

                        <div className="mt-2 text-justify">
                            <textarea
                                className="w-full border-b border-transparent focus:border-blue-300 focus:outline-none bg-transparent h-auto resize-none leading-8"
                                rows="3"
                                value={letterInfo.introParagraph}
                                onChange={(e) => handleLetterEdit("introParagraph", e.target.value)}
                            />
                        </div>

                        {/* Dynamic Table */}
                        <div className="my-8 overflow-hidden rounded-md border border-black">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-black">
                                        {tableColumns.map((col, idx) => (
                                            <th key={idx} className="border-r border-black p-2 text-center text-sm font-bold last:border-r-0">
                                                <input
                                                    type="text"
                                                    value={col}
                                                    onChange={(e) => {
                                                        const oldName = col;
                                                        const newName = e.target.value;
                                                        const newCols = [...tableColumns];
                                                        newCols[idx] = newName;
                                                        setTableColumns(newCols);
                                                        setTableData(tableData.map(row => {
                                                            const newRow = { ...row };
                                                            newRow[newName] = row[oldName];
                                                            if (newName !== oldName) delete newRow[oldName];
                                                            return newRow;
                                                        }));
                                                    }}
                                                    className="w-full text-center focus:outline-none border-none bg-transparent font-bold"
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((row, rowIndex) => (
                                        <tr key={rowIndex} className="border-b border-black last:border-b-0">
                                            {tableColumns.map((col, colIndex) => (
                                                <td key={colIndex} className="border-r border-black p-2 text-center text-sm last:border-r-0">
                                                    <input
                                                        type="text"
                                                        value={row[col] || ""}
                                                        onChange={(e) => handleTableEdit(rowIndex, col, e.target.value)}
                                                        className="w-full text-center focus:outline-none border-none bg-transparent font-semibold"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Add Row Button - Hidden on Print */}
                            <div className="flex justify-center p-2 bg-gray-50 border-t border-black no-print">
                                <button
                                    onClick={addRow}
                                    className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Add Row"
                                >
                                    <Plus size={16} />
                                    <span>Add Row</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 text-justify">
                            <textarea
                                className="w-full border-b border-transparent focus:border-blue-300 focus:outline-none bg-transparent h-auto resize-none leading-8"
                                rows="3"
                                value={letterInfo.closingParagraph}
                                onChange={(e) => handleLetterEdit("closingParagraph", e.target.value)}
                            />
                        </div>

                        <div className="mt-10">
                            <input
                                className="w-full border-b border-transparent focus:border-blue-300 focus:outline-none bg-transparent font-bold text-left"
                                value={letterInfo.thankYou}
                                onChange={(e) => handleLetterEdit("thankYou", e.target.value)}
                            />
                        </div>

                        {/* Signature Section - MOVED TO LEFT AS REQUESTED */}
                        <div className="mt-12 flex flex-col items-start space-y-1">
                            <input
                                className="border-b border-transparent focus:border-blue-300 focus:outline-none bg-transparent font-bold text-left w-40"
                                value={letterInfo.regards}
                                onChange={(e) => handleLetterEdit("regards", e.target.value)}
                            />
                            <div className="h-10"></div> {/* Space for signature */}
                            <input
                                className="border-b border-transparent focus:border-blue-300 focus:outline-none bg-transparent font-bold text-left w-64"
                                value={letterInfo.forCompany}
                                onChange={(e) => handleLetterEdit("forCompany", e.target.value)}
                            />
                            <input
                                className="border-b border-transparent focus:border-blue-300 focus:outline-none bg-transparent font-bold text-left w-64"
                                value={letterInfo.designation}
                                onChange={(e) => handleLetterEdit("designation", e.target.value)}
                            />
                        </div>

                        {/* CC Section */}
                        <div className="mt-10 text-sm space-y-2 italic">
                            <p className="font-bold">प्रतिलिपि:—</p>
                            <div className="pl-0 space-y-1">
                                {letterInfo.copiesTo.map((copy, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <span className="min-w-[20px]">{idx + 1})</span>
                                        <input
                                            className="w-full border-b border-transparent focus:border-blue-300 focus:outline-none bg-transparent"
                                            value={copy}
                                            onChange={(e) => {
                                                const newCopies = [...letterInfo.copiesTo];
                                                newCopies[idx] = e.target.value;
                                                handleLetterEdit("copiesTo", newCopies);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Print specific styles */}
                    <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #letter-content, #letter-content * {
                visibility: visible;
              }
              #letter-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 0;
                border: none;
                box-shadow: none;
              }
              .no-print {
                display: none !important;
              }
              textarea, input {
                border: none !important;
                background: transparent !important;
                resize: none !important;
              }
            }
          `}</style>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminLetter;
