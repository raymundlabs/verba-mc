import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Target,
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Users,
  Percent,
  Loader2
} from "lucide-react"
import { fetchDashboardStats } from '@/services/dashboardService';
import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  icon: React.ReactNode
  description?: string
  status?: "success" | "warning" | "danger" | "info"
  engine: string
}

function StatCard({ title, value, change, trend, icon, description, status = "info", engine }: StatCardProps) {
  const statusColors = {
    success: "text-green-600 bg-green-50 dark:bg-green-900/20",
    warning: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
    danger: "text-red-600 bg-red-50 dark:bg-red-900/20",
    info: "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">{value}</div>
            <Badge variant="secondary" className="text-xs">
              24/7
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className={`p-2 rounded-md ${statusColors[status]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {change}
          </div>
          <Badge variant="outline" className="text-xs">
            {engine}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsGrid() {
  const [stats, setStats] = useState<{
    totalLeads: number;
    leadsToday: number;
    appointmentsToday: number;
    followUpsToday: number;
    conversionRate: number;
    isLoading: boolean;
    error: string | null;
  }>({
    totalLeads: 0,
    leadsToday: 0,
    appointmentsToday: 0,
    followUpsToday: 0,
    conversionRate: 0,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDashboardStats();
        setStats(prev => ({
          ...data,
          isLoading: false,
          error: null
        }));
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    };

    loadStats();
  }, []);

  if (stats.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
        ))}
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{stats.error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Leads"
        value={stats.totalLeads}
        change=""
        icon={<Users className="w-4 h-4" />}
        status="info"
        description="All-time leads captured"
        engine="Database"
      />
      
      <StatCard
        title="Leads Today"
        value={stats.leadsToday}
        change=""
        icon={<Target className="w-4 h-4" />}
        status="info"
        description="New leads today"
        engine="AI Powered"
      />
      
      <StatCard
        title="Appointments Today"
        value={stats.appointmentsToday}
        change=""
        icon={<Calendar className="w-4 h-4" />}
        status="success"
        description="Scheduled for today"
        engine="AI Scheduled"
      />
      
      <StatCard
        title="Follow-ups Needed"
        value={stats.followUpsToday}
        change=""
        icon={<MessageSquare className="w-4 h-4" />}
        status="warning"
        description="Requiring attention"
        engine="AI Tracked"
      />
      
      <StatCard
        title="Conversion Rate"
        value={`${stats.conversionRate}%`}
        change=""
        icon={<Percent className="w-4 h-4" />}
        status={stats.conversionRate > 30 ? "success" : stats.conversionRate > 15 ? "info" : "warning"}
        description="Lead to appointment"
        engine="AI Optimized"
      />
      
      <StatCard
        title="System Status"
        value="Operational"
        icon={<TrendingUp className="w-4 h-4" />}
        status="success"
        description="All systems normal"
        engine="24/7"
      />
    </div>
  )
}