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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
