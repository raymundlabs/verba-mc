import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search,
  Calendar,
  Clock,
  Phone,
  User,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Play,
  X
} from "lucide-react"
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Appointment {
  id: string;
  booking_number: string | null;
  patient_name: string;
  phone: string;
  primary_concern: string;
  appointment_date: string;
  appointment_time: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed" | "no_show";
  created_at: string;
  updated_at: string | null;
  email: string | null;
  name: string | null;
  notes: string | null;
  urgency_level: string | null;
  confirmation_number: string;
  metadata: Record<string, any>;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Scheduled':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Confirmed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'Completed':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'No Show':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

function getUrgencyColor(urgency: string | null) {
  if (!urgency) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  
  switch (urgency.toLowerCase()) {
    case 'emergency':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "confirmed":
      return <CheckCircle className="w-3 h-3" />
    case "pending":
      return <Clock className="w-3 h-3" />
    case "cancelled":
      return <AlertCircle className="w-3 h-3" />
    case "completed":
      return <CheckCircle className="w-3 h-3" />
    default:
      return <Clock className="w-3 h-3" />
  }
}

function formatDateTime(dateStr: string, timeStr: string) {
  const date = new Date(dateStr);
  const [hours, minutes] = timeStr.split(':');
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${timeString}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${timeString}`;
  }
  
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeString}`;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .not('appointment_date', 'is', null)
          .not('appointment_time', 'is', null)
          .not('primary_concern', 'is', null)
          .not('primary_concern', 'eq', '')
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true });

        if (error) throw error;
        setAppointments(data || []);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(err as PostgrestError);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // Set up real-time subscription with optimized updates
    const subscription = supabase
      .channel('appointments_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'leads',
      }, (payload) => {
        setAppointments(currentAppointments => {
          const newAppointment = payload.new as Appointment;
          const oldAppointment = payload.old as Appointment;
          
          // Handle INSERT
          if (payload.eventType === 'INSERT') {
            // Only add if it has all required fields
            if (newAppointment.appointment_date && 
                newAppointment.appointment_time && 
                newAppointment.primary_concern?.trim()) {
              return [newAppointment, ...currentAppointments];
            }
            return currentAppointments;
          }
          
          // Handle UPDATE
          if (payload.eventType === 'UPDATE') {
            // Check if it's still a valid appointment
            const isValidAppointment = newAppointment.appointment_date && 
                                     newAppointment.appointment_time && 
                                     newAppointment.primary_concern?.trim();
            
            const wasValidAppointment = oldAppointment.appointment_date && 
                                      oldAppointment.appointment_time && 
                                      oldAppointment.primary_concern?.trim();
            
            // If it's no longer a valid appointment, remove it
            if (wasValidAppointment && !isValidAppointment) {
              return currentAppointments.filter(apt => apt.id !== newAppointment.id);
            }
            
            // If it's now a valid appointment but wasn't before, add it
            if (!wasValidAppointment && isValidAppointment) {
              return [newAppointment, ...currentAppointments.filter(apt => apt.id !== newAppointment.id)];
            }
            
            // If it's still a valid appointment, update it in place
            if (isValidAppointment) {
              return currentAppointments.map(apt => 
                apt.id === newAppointment.id ? newAppointment : apt
              );
            }
            
            return currentAppointments;
          }
          
          // Handle DELETE
          if (payload.eventType === 'DELETE') {
            return currentAppointments.filter(apt => apt.id !== oldAppointment.id);
          }
          
          // Default case: refetch if we're not sure
          fetchAppointments();
          return currentAppointments;
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredAppointments = appointments.filter(appointment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.patient_name?.toLowerCase().includes(searchLower) ||
      appointment.phone?.includes(searchLower) ||
      appointment.primary_concern?.toLowerCase().includes(searchLower) ||
      appointment.booking_number?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading appointments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-destructive">
        <p>Error loading appointments: {error.message}</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointment Management</h1>
          <p className="text-muted-foreground">
            View and manage all scheduled appointments
          </p>
        </div>
        <Button asChild>
          <a href="/leads">
            <Calendar className="w-4 h-4 mr-2" />
            View All Leads
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Scheduled Appointments
              <Badge variant="outline" className="ml-2">
                {filteredAppointments.length}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search appointments..." 
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No appointments found.</p>
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setSearchTerm('')}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {appointment.patient_name || appointment.name || 'Unnamed Patient'}
                          </h3>
                          {appointment.booking_number && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {appointment.booking_number}
                            </Badge>
                          )}
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusIcon(appointment.status)}
                            {appointment.status.replace('_', ' ')}
                          </Badge>
                          {appointment.urgency_level && (
                            <Badge className={`ml-2 ${getUrgencyColor(appointment.urgency_level)}`}>
                              {appointment.urgency_level}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <a href={`tel:${appointment.phone}`} className="hover:underline">
                                {appointment.phone}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {formatDateTime(appointment.appointment_date, appointment.appointment_time)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-sm">
                            <span className="font-medium">Concern: </span>
                            <span className="text-muted-foreground">{appointment.primary_concern}</span>
                          </div>
                          
                          {appointment.notes && (
                            <div className="text-sm">
                              <span className="font-medium">Notes: </span>
                              <span className="text-muted-foreground">{appointment.notes}</span>
                            </div>
                          )}
                          
                          {appointment.urgency_level && (
                            <div className="text-sm">
                              <span className="font-medium">Urgency: </span>
                              <span className="text-muted-foreground capitalize">
                                {appointment.urgency_level}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          // In a real app, you would fetch the transcript here
                          // For now, we'll use a placeholder
                          setTranscript(`Call with ${appointment.patient_name || 'customer'} on ${formatDateTime(appointment.appointment_date, appointment.appointment_time)}\n\n[Transcript would appear here]`);
                          setShowTranscript(true);
                        }}
                        title="View transcript"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          // In a real app, you would fetch the recording URL here
                          // For now, we'll use a placeholder
                          setAudioUrl('https://example.com/recording.mp3');
                        }}
                        title="Play recording"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        asChild
                      >
                        <a href={`tel:${appointment.phone}`} title="Call">
                          <Phone className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Transcript Dialog */}
      <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Call Transcript</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap mt-4">
            {transcript || 'No transcript available'}
          </div>
        </DialogContent>
      </Dialog>

      {/* Audio Player */}
      {audioUrl && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
          <div className="flex items-center gap-4">
            <audio src={audioUrl} controls autoPlay />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setAudioUrl(null)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}