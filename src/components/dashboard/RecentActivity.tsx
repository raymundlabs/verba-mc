import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  MessageSquare, 
  Clock,
  CheckCircle,
  Loader2,
  UserPlus,
  AlertCircle,
  ArrowUpRight
} from "lucide-react"
import { fetchRecentLeads } from '@/services/dashboardService';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string
  type: "acquisition" | "scheduling" | "recovery" | "confirmation" | "followup"
  title: string
  description: string
  time: string
  status: "success" | "pending" | "urgent"
  engine: string
  bookingNumber?: string
}

function getActivityIcon(type: string) {
  switch (type) {
    case "acquisition":
      return <UserPlus className="w-4 h-4" />
    case "scheduling":
      return <Calendar className="w-4 h-4" />
    case "followup":
      return <MessageSquare className="w-4 h-4" />
    case "confirmation":
      return <CheckCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

function getEngineColor(engine: string) {
  switch (engine) {
    case "Acquisition Engine":
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
    case "Scheduling Engine":
      return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
    case "Follow-up System":
      return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
    default:
      return "bg-gray-50 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "success":
      return "text-green-600 bg-green-50 dark:bg-green-900/20"
    case "pending":
      return "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
    case "urgent":
      return "text-red-600 bg-red-50 dark:bg-red-900/20"
    default:
      return "text-gray-600 bg-gray-50 dark:bg-gray-800/50"
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecentActivities = async () => {
      try {
        const leads = await fetchRecentLeads(5);
        
        const mappedActivities: ActivityItem[] = leads.map(lead => {
          // Determine the type based on lead status
          let type: 'acquisition' | 'scheduling' | 'followup' | 'confirmation' | 'recovery' = 'acquisition';
          if (lead.status === 'scheduled') {
            type = 'scheduling';
          } else if (lead.status === 'follow_up') {
            type = 'followup';
          }
          
          // Determine the status based on lead status
          let status: 'success' | 'pending' | 'urgent' = 'pending';
          if (lead.status === 'follow_up') {
            status = 'urgent';
          } else if (lead.status === 'scheduled') {
            status = 'success';
          }
          
          const title = lead.status === 'scheduled' ? 'Appointment Booked' : 
                       lead.status === 'follow_up' ? 'Follow-up Needed' : 'New Lead Captured';
          
          const engine = lead.status === 'scheduled' ? 'Scheduling Engine' : 
                        lead.status === 'follow_up' ? 'Follow-up System' : 'Acquisition Engine';
          
          return {
            id: lead.id,
            type,
            title,
            description: `${lead.patient_name} - ${lead.primary_concern || 'No concern specified'}`,
            time: formatDistanceToNow(new Date(lead.created_at), { addSuffix: true }),
            status,
            engine,
            bookingNumber: lead.confirmation_number || ''
          };
        });

        setActivities(mappedActivities);
      } catch (err) {
        console.error('Failed to load recent activities:', err);
        setError('Failed to load recent activities');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentActivities();
  }, []);

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Loading recent activities...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest leads and appointments</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          View All
          <ArrowUpRight className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className={`p-2 rounded-md ${getStatusColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{activity.title}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getEngineColor(activity.engine)}`}>
                      {activity.engine}
                    </span>
                    {activity.bookingNumber && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {activity.bookingNumber}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activities found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}