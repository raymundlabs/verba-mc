import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Bot, 
  Target, 
  Calendar, 
  MessageSquare, 
  Clock,
  CheckCircle,
  Phone,
  Activity,
  MoreVertical
} from "lucide-react"

interface Engine {
  id: string
  name: string
  type: "Acquisition" | "Scheduling" | "Recovery" | "Confirmation" | "Retention"
  status: "online" | "optimizing" | "offline"
  performance: number
  todayStats: {
    calls: number
    successRate: string
    avgResponse: string
  }
  uptime: string
  icon: React.ElementType
}

const engines: Engine[] = [
  {
    id: "1",
    name: "Acquisition Engine",
    type: "Acquisition",
    status: "online",
    performance: 94,
    todayStats: {
      calls: 47,
      successRate: "94%",
      avgResponse: "1.2s"
    },
    uptime: "99.8%",
    icon: Target
  },
  {
    id: "2", 
    name: "Scheduling Engine",
    type: "Scheduling",
    status: "online",
    performance: 97,
    todayStats: {
      calls: 23,
      successRate: "97%",
      avgResponse: "2.1s"
    },
    uptime: "99.9%",
    icon: Calendar
  },
  {
    id: "3",
    name: "Revenue Recovery",
    type: "Recovery",
    status: "optimizing",
    performance: 91,
    todayStats: {
      calls: 15,
      successRate: "91%",
      avgResponse: "1.8s"
    },
    uptime: "99.7%",
    icon: MessageSquare
  },
  {
    id: "4",
    name: "Confirmation Engine", 
    type: "Confirmation",
    status: "online",
    performance: 96,
    todayStats: {
      calls: 18,
      successRate: "96%",
      avgResponse: "0.9s"
    },
    uptime: "99.6%",
    icon: CheckCircle
  }
]

function getStatusColor(status: string) {
  switch (status) {
    case "online":
      return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
    case "optimizing":
      return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
    case "offline":
      return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "online":
      return <Bot className="w-3 h-3" />
    case "optimizing":
      return <Activity className="w-3 h-3" />
    case "offline":
      return <Clock className="w-3 h-3" />
    default:
      return <Bot className="w-3 h-3" />
  }
}

export function AgentStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Engine Performance
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          RaymundLab Revenue Engines running 24/7
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {engines.map((engine) => (
            <div key={engine.id} className="p-4 rounded-lg border bg-card/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <engine.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{engine.name}</h4>
                    <p className="text-xs text-muted-foreground">AI-Powered • Uptime: {engine.uptime}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(engine.status)}>
                    {getStatusIcon(engine.status)}
                    {engine.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span>Performance Score</span>
                  <span>{engine.performance}%</span>
                </div>
                <Progress value={engine.performance} className="h-2" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">{engine.todayStats.calls}</div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{engine.todayStats.successRate}</div>
                  <div className="text-xs text-muted-foreground">Success</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{engine.todayStats.avgResponse}</div>
                  <div className="text-xs text-muted-foreground">Response</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>All engines operational • Battle-tested system</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}