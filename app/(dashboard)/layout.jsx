import LeftPanel from '@/components/layout/LeftPanel'
import RightPanel from '@/components/layout/RightPanel'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#070B14] bg-grid">
      <LeftPanel />
      <main className="flex-1 ml-64 mr-72 min-h-screen">
        {children}
      </main>
      <RightPanel />
    </div>
  )
}