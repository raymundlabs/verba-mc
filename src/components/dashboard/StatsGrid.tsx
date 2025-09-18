import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Target,
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Users,
  Percent,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react"
import { fetchDashboardStats } from '@/services/dashboardService';
import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils"

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
    success: "bg-green-50 text-green-700",
    warning: "bg-yellow-50 text-yellow-700",
    danger: "bg-red-50 text-red-700",
    info: "bg-blue-50 text-blue-700"
  }

  const trendIcons = {
    up: <ArrowUpRight className="w-4 h-4 text-green-500" />,
    down: <ArrowDownRight className="w-4 h-4 text-red-500" />,
    neutral: <span className="w-4 h-4" />
  }

  const engineBadges = {
    "AI Powered": "bg-blue-100 text-blue-800",
    "AI Scheduled": "bg-purple-100 text-purple-800",
    "AI Tracked": "bg-green-100 text-green-800",
    "AI Optimized": "bg-cyan-100 text-cyan-800",
    "Database": "bg-gray-100 text-gray-800",
    "24/7": "bg-brand-cyan/10 text-brand-cyan"
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {trend && (
              <span className={cn(
                "text-xs font-medium flex items-center gap-0.5",
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                {trendIcons[trend]}
                {change}
              </span>
            )}
          </div>
        </div>
        <div className={cn("p-2 rounded-lg", statusColors[status])}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">{description}</p>
        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", engineBadges[engine as keyof typeof engineBadges] || 'bg-gray-100 text-gray-800')}>
          {engine}
        </span>
      </div>
    </div>
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
        // Simulated data fetch - replace with actual API call
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
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-brand-deep-blue" />
          </div>
        ))}
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="text-center py-8 bg-red-50 rounded-xl">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-2" />
        <p className="text-red-700 font-medium">{stats.error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Leads"
        value={stats.totalLeads.toLocaleString()}
        trend="up"
        change="+12.5%"
        icon={<Users className="w-5 h-5" />}
        status="info"
        description="All-time leads captured"
        engine="Database"
      />
      
      <StatCard
        title="Leads Today"
        value={stats.leadsToday}
        trend="up"
        change="+5.2%"
        icon={<Target className="w-5 h-5" />}
        status="info"
        description="New leads today"
        engine="AI Powered"
      />
      
      <StatCard
        title="Appointments"
        value={stats.appointmentsToday}
        trend="up"
        change="+8.1%"
        icon={<Calendar className="w-5 h-5" />}
        status="success"
        description="Scheduled for today"
        engine="AI Scheduled"
      />
      
      <StatCard
        title="Follow-ups"
        value={stats.followUpsToday}
        trend="down"
        change="-3.2%"
        icon={<MessageSquare className="w-5 h-5" />}
        status="warning"
        description="Requiring attention"
        engine="AI Tracked"
      />
      
      <StatCard
        title="Conversion Rate"
        value={`${stats.conversionRate}%`}
        trend={stats.conversionRate > 30 ? "up" : "down"}
        change={stats.conversionRate > 30 ? "+4.5%" : "-2.1%"}
        icon={<Percent className="w-5 h-5" />}
        status={stats.conversionRate > 30 ? "success" : "warning"}
        description="Lead to appointment"
        engine="AI Optimized"
      />
      
      <StatCard
        title="System Status"
        value="All Systems Go"
        icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
        status="success"
        description="Last updated just now"
        engine="24/7"
      />
    </div>
  )
}