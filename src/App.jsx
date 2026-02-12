// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
// import LoginPage from "./pages/LoginPage"
// import DashboardPage from "./pages/DashboardPage"
// import NewComplaintPage from "./pages/NewComplaintPage"
// import AssignComplaintPage from "./pages/AssignComplaintPage"
// import TrackerPage from "./pages/TrackerPage"
// import VerificationPage from "./pages/VerificationPage"

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/dashboard" element={<DashboardPage />} />
//         <Route path="/dashboard/new-complaint" element={<NewComplaintPage />} />
//         <Route path="/dashboard/assign-complaint" element={<AssignComplaintPage />} />
//         <Route path="/dashboard/tracker" element={<TrackerPage />} />
//         <Route path="/dashboard/verification" element={<VerificationPage />} />
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   )
// }

// export default App



import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import NewComplaintPage from "./pages/NewComplaintPage"
import AssignComplaintPage from "./pages/AssignComplaintPage"
import TrackerPage from "./pages/TrackerPage"
import VerificationPage from "./pages/VerificationPage"
import DocumentVerificationPage from "./pages/DocumentVerficationPage"
import PetrolExpensesPage from "./pages/PetrolExpensesPage"
import Reportpage from "./pages/Reportpage"
import TechnicianDashboard from "./pages/TechnicianDashboard"
import TechnicianTracker from "./pages/TechnicianTracker"
import Approved from "./pages/Approved"
<<<<<<< HEAD
import AdminApproved from "./pages/AdminApproved"
import AdminLetter from "./pages/AdminLetter"
=======
>>>>>>> 4c89a70c46faaa456ffea1552df8a304a9a19de9
import TrackerHistoryPage from "./pages/TrackerHistoryPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/new-complaint" element={<NewComplaintPage />} />
        <Route path="/dashboard/assign-complaint" element={<AssignComplaintPage />} />
        <Route path="/dashboard/tracker" element={<TrackerPage />} />
        <Route path="/dashboard/verification" element={<VerificationPage />} />
        <Route path="/dashboard/document-verification" element={<DocumentVerificationPage />} />
        <Route path="/dashboard/petrol-expenses" element={<PetrolExpensesPage />} />
        <Route path="/dashboard/Report" element={<Reportpage />} />
        <Route path="/dashboard/technician-dasboard" element={<TechnicianDashboard />} />
        <Route path="/dashboard/technician-tracker" element={<TechnicianTracker />} />
        <Route path="/dashboard/approved" element={<Approved />} />
<<<<<<< HEAD
        <Route path="/dashboard/admin-approved" element={<AdminApproved />} />
        <Route path="/dashboard/admin-letter/:complaintId" element={<AdminLetter />} />
=======
>>>>>>> 4c89a70c46faaa456ffea1552df8a304a9a19de9
        <Route path="/dashboard/tracker-history" element={<TrackerHistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
