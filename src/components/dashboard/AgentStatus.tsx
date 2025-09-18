import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  AlertCircle, 
  ArrowUpRight, 
  Clock, 
  Plus, 
  Zap 
} from "lucide-react"

interface Engine {
  id: string
  name: string
  status: 'online' | 'offline' | 'error' | 'maintenance'
  lastActive: string
  tasksCompleted: number
  successRate: number
  uptime: string
  version: string
  avgResponse?: string
}

const engines: Engine[] = [
  {
    id: "1",
    name: "Lead Generation Bot",
    status: "online",
    lastActive: "Active now",
    tasksCompleted: 142,
    successRate: 94,
    uptime: "99.8%",
    version: "2.4.1",
    avgResponse: "1.2s"
  },
  {
    id: "2",
    name: "Appointment Setter",
    status: "online",
    lastActive: "Active now",
    tasksCompleted: 87,
    successRate: 97,
    uptime: "99.9%",
    version: "1.9.3",
    avgResponse: "2.1s"
  },
  {
    id: "3",
    name: "Follow-up Assistant",
    status: "error",
    lastActive: "15 minutes ago",
    tasksCompleted: 0,
    successRate: 0,
    uptime: "95.2%",
    version: "1.2.0"
  },
  {
    id: "4",
    name: "Data Enrichment",
    status: "maintenance",
    lastActive: "2 hours ago",
    tasksCompleted: 215,
    successRate: 95,
    uptime: "99.5%",
    version: "3.1.4"
  }
]

const getStatusConfig = (status: Engine['status']) => {
  switch (status) {
    case 'online':
      return {
        color: 'bg-green-500',
        icon: <div className="h-2 w-2 rounded-full bg-green-500" />,
        label: 'Online',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      }
    case 'offline':
      return {
        color: 'bg-gray-400',
        icon: <div className="h-2 w-2 rounded-full bg-gray-400" />,
        label: 'Offline',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      }
    case 'error':
      return {
        color: 'bg-red-500',
        icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
        label: 'Error',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
    case 'maintenance':
      return {
        color: 'bg-yellow-500',
        icon: <Clock className="h-3.5 w-3.5 text-yellow-500" />,
        label: 'Maintenance',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      }
  }
}

const getSuccessRateColor = (rate: number) => {
  if (rate >= 90) return 'text-green-600'
  if (rate >= 75) return 'text-yellow-600'
  return 'text-red-600'
}

export function AgentStatus() {
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold font-heading text-gray-800">Agent Status</h2>
        <Button size="sm" variant="outline" className="border-brand-deep-blue/20 text-brand-deep-blue hover:bg-brand-deep-blue/5">
          <Plus className="mr-2 h-3.5 w-3.5" />
          Add Agent
        </Button>
      </div>
      
      <div className="space-y-4 mb-6">
        {engines.map((engine) => {
          const status = getStatusConfig(engine.status)
          return (
            <div key={engine.id} className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg ${status.bgColor}`}>
                    {status.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{engine.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${status.textColor} ${status.borderColor} ${status.bgColor}`}
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500">v{engine.version}</span>
                      <span className="text-sm text-gray-500">{engine.uptime} uptime</span>
                    </div>
                  </div>
                </div>
                {engine.avgResponse && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{engine.avgResponse}</div>
                    <div className="text-xs text-gray-500">Avg. Response</div>
                  </div>
                )}
              </div>
              
              {engine.status !== 'offline' && engine.tasksCompleted > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Success rate</span>
                    <span className={`font-medium ${getSuccessRateColor(engine.successRate)}`}>
                      {engine.successRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        engine.successRate >= 90 ? 'bg-green-500' : 
                        engine.successRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} 
                      style={{ width: `${engine.successRate}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {engine.status === 'online' ? 'Active now' : `Last active: ${engine.lastActive}`}
                </span>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-brand-deep-blue hover:bg-brand-deep-blue/5">
                  Details <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="bg-gradient-to-r from-brand-deep-blue/5 to-brand-cyan/5 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">System Health</h3>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-600">All systems operational</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Resource usage</span>
            <span className="font-medium">45%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-cyan transition-all duration-300" 
              style={{ width: '45%' }}
            />
          </div>
          <p className="text-xs text-gray-500">Optimal performance with 55% resources available</p>
        </div>
        
        <Button className="w-full mt-4 bg-gradient-to-r from-brand-deep-blue to-brand-cyan hover:from-brand-deep-blue/90 hover:to-brand-cyan/90 text-white">
          <Zap className="mr-2 h-4 w-4" />
          Deploy New Agent
        </Button>
      </div>
    </div>
  )
}