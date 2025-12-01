import DashboardLayout from "../components/DashboardLayout"
import DashboardStats from "../components/DashboardStats"
import DashboardCharts from "../components/DashboardCharts"
import RecentComplaints from "../components/RecentComplaints"
import QuickActions from "../components/QuickActions"
import ComplaintsByRegion from "../components/ComplaintsByRegion"
import DasbhoardPendingTask from "../components/DashboardPendingTable"

function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500">Overview of all complaints and tasks</p>
        </div>

        <DashboardStats />

        {/* <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardCharts />
          </div>
          <div className="space-y-6"> */}
            {/* <QuickActions /> */}
            {/* <RecentComplaints /> */}
          {/* </div> */}
        {/* </div> */}
       
        <DasbhoardPendingTask />
        <ComplaintsByRegion />

      </div>
    </DashboardLayout>
  )
}

export default DashboardPage
