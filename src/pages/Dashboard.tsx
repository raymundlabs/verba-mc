import { Phone } from "lucide-react"
import { StatsGrid } from "@/components/dashboard/StatsGrid"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { AgentStatus } from "@/components/dashboard/AgentStatus"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Verbadent Revenue Engine</h1>
              <p className="text-lg font-medium text-primary">Mission Control Dashboard</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Your 24/7 AI-powered revenue engine that captures leads, books appointments, and automates follow-ups. 
            Monitor all engines from your centralized command center.
          </p>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">All Engines Online</span>
          </div>
          <p className="text-xs text-muted-foreground">Proven system • 24/7 operation</p>
        </div>
      </div>
      
      <StatsGrid />
      
      <div className="grid gap-6 lg:grid-cols-3">
        <RecentActivity />
        <AgentStatus />
      </div>
    </div>
  )
}