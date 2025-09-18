import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search,
  MessageSquare,
  Clock,
  Phone,
  User,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Calendar
} from "lucide-react"

interface FollowUp {
  id: string
  bookingNumber: string
  patientName: string
  phone: string
  type: "confirmation" | "reminder" | "cancellation" | "rescheduling"
  priority: "high" | "medium" | "low"
  status: "pending" | "completed" | "failed"
  scheduledFor?: string
  lastContact?: string
  agent: string
  reason?: string
  createdAt: string
}

const mockFollowUps: FollowUp[] = [
  {
    id: "1",
    bookingNumber: "LDA005",
    patientName: "Lisa Anderson",
    phone: "(555) 111-2222",
    type: "confirmation",
    priority: "high",
    status: "pending",
    scheduledFor: "Tomorrow, 9:00 AM",
    agent: "FollowupAgent",
    createdAt: "10 minutes ago"
  },
  {
    id: "2", 
    bookingNumber: "LDA003",
    patientName: "Emma Wilson",
    phone: "(555) 456-7890",
    type: "confirmation",
    priority: "medium",
    status: "completed",
    scheduledFor: "Dec 30, 3:00 PM",
    lastContact: "5 minutes ago",
    agent: "FollowupAgent",
    createdAt: "1 hour ago"
  },
  {
    id: "3",
    bookingNumber: "LDA006",
    patientName: "Robert Chen",
    phone: "(555) 333-4444",
    type: "reminder",
    priority: "low",
    status: "pending",
    scheduledFor: "Next Monday, 2:00 PM",
    agent: "FollowupAgent", 
    createdAt: "2 hours ago"
  },
  {
    id: "4",
    bookingNumber: "LDA004",
    patientName: "John Smith",
    phone: "(555) 321-0987",
    type: "cancellation",
    priority: "medium",
    status: "completed",
    reason: "Patient requested to cancel due to scheduling conflict",
    lastContact: "30 minutes ago",
    agent: "FollowupAgent",
    createdAt: "3 hours ago"
  }
]

function getTypeColor(type: string) {
  switch (type) {
    case "confirmation":
      return "bg-primary text-primary-foreground"
    case "reminder":
      return "bg-accent text-accent-foreground"
    case "cancellation":
      return "bg-destructive text-destructive-foreground"
    case "rescheduling":
      return "bg-warning text-warning-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "bg-destructive text-destructive-foreground"
    case "medium":
      return "bg-warning text-warning-foreground"
    case "low":
      return "bg-accent text-accent-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-accent text-accent-foreground"
    case "pending":
      return "bg-warning text-warning-foreground"
    case "failed":
      return "bg-destructive text-destructive-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export default function FollowUps() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Follow-up Management</h1>
          <p className="text-muted-foreground">
            Manage confirmations, reminders, and patient follow-ups
          </p>
        </div>
        <Button>
          <MessageSquare className="w-4 h-4 mr-2" />
          New Follow-up
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              All Follow-ups
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search follow-ups..." className="pl-10 w-64" />
              </div>
              <Button variant="outline" size="sm">
                Pending
              </Button>
              <Button variant="outline" size="sm">
                High Priority
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockFollowUps.map((followUp) => (
              <div key={followUp.id} className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{followUp.patientName}</h3>
                        <Badge variant="outline" className="font-mono text-xs">
                          {followUp.bookingNumber}
                        </Badge>
                        <Badge className={getTypeColor(followUp.type)}>
                          {followUp.type}
                        </Badge>
                        <Badge className={getPriorityColor(followUp.priority)}>
                          {followUp.priority} priority
                        </Badge>
                        <Badge className={getStatusColor(followUp.status)}>
                          {followUp.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{followUp.phone}</span>
                          </div>
                          {followUp.scheduledFor && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>Appointment: {followUp.scheduledFor}</span>
                            </div>
                          )}
                        </div>
                        
                        {followUp.reason && (
                          <div className="text-sm">
                            <span className="font-medium">Reason: </span>
                            <span className="text-muted-foreground">{followUp.reason}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Created {followUp.createdAt}
                          </span>
                          {followUp.lastContact && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Last contact: {followUp.lastContact}
                            </span>
                          )}
                          <span>Agent: {followUp.agent}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {followUp.status === "pending" && (
                      <Button variant="outline" size="sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}