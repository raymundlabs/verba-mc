import { Phone, Zap } from "lucide-react"
import { StatsGrid } from "@/components/dashboard/StatsGrid"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { AgentStatus } from "@/components/dashboard/AgentStatus"

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-brand-deep-blue to-brand-cyan p-6 rounded-xl text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">Welcome to Verbadent</h1>
              <p className="text-blue-100 text-lg mb-4 max-w-2xl">
                Your 24/7 AI-powered revenue engine that captures leads, books appointments, and automates follow-ups.
              </p>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3 w-fit">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm">All systems operational</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Phone className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <h2 className="text-xl font-semibold font-heading mb-6 text-gray-800">Performance Overview</h2>
        <StatsGrid />
      </div>
      
      {/* Activity and Status Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold font-heading mb-6 text-gray-800">Recent Activity</h2>
          <RecentActivity />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="text-xl font-semibold font-heading mb-6 text-gray-800">Agent Status</h2>
          <AgentStatus />
        </div>
      </div>
    </div>
  )
}