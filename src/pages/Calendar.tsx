import { useState } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Phone } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { format, isToday, isSameDay } from "date-fns"

const mockAppointments = [
  {
    id: "LDA001",
    patientName: "John Smith",
    phone: "(555) 123-4567",
    time: "9:00 AM",
    duration: 60,
    type: "Cleaning",
    status: "confirmed",
    date: new Date(2025, 0, 27), // Today
    urgency: "routine"
  },
  {
    id: "LDA002", 
    patientName: "Sarah Johnson",
    phone: "(555) 234-5678",
    time: "10:30 AM",
    duration: 30,
    type: "Consultation",
    status: "confirmed",
    date: new Date(2025, 0, 27), // Today
    urgency: "urgent"
  },
  {
    id: "LDA003",
    patientName: "Mike Davis",
    phone: "(555) 345-6789", 
    time: "2:00 PM",
    duration: 90,
    type: "Root Canal",
    status: "pending",
    date: new Date(2025, 0, 28), // Tomorrow
    urgency: "emergency"
  },
  {
    id: "LDA004",
    patientName: "Emma Wilson",
    phone: "(555) 456-7890",
    time: "11:00 AM", 
    duration: 45,
    type: "Filling",
    status: "confirmed",
    date: new Date(2025, 0, 29),
    urgency: "routine"
  }
]

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')

  const getAppointmentsForDate = (date: Date) => {
    return mockAppointments.filter(apt => isSameDay(apt.date, date))
  }

  const selectedDateAppointments = getAppointmentsForDate(selectedDate)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default'
      case 'pending': return 'secondary' 
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-destructive/10 text-destructive'
      case 'urgent': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
      case 'routine': return 'bg-primary/10 text-primary'
      default: return 'bg-secondary text-secondary-foreground'
    }
  }

  const getDatesWithAppointments = () => {
    return mockAppointments.map(apt => apt.date)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage your appointment schedule
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Day
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {format(selectedDate, 'MMMM yyyy')}
            </CardTitle>
            <CardDescription>
              Click on a date to view appointments for that day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="w-full"
              modifiers={{
                hasAppointments: getDatesWithAppointments(),
                today: new Date()
              }}
              modifiersStyles={{
                hasAppointments: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  fontWeight: 'bold'
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Daily Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {format(selectedDate, 'EEEE, MMM d')}
                {isToday(selectedDate) && (
                  <Badge variant="secondary" className="ml-2">Today</Badge>
                )}
              </span>
            </CardTitle>
            <CardDescription>
              {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateAppointments.length > 0 ? (
              <div className="space-y-4">
                {selectedDateAppointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {appointment.patientName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{appointment.patientName}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {appointment.phone}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Time</p>
                          <p className="font-medium">{appointment.time}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{appointment.duration} min</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium">{appointment.type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Urgency</p>
                          <Badge 
                            variant="secondary" 
                            className={getUrgencyColor(appointment.urgency)}
                          >
                            {appointment.urgency}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No appointments scheduled for this date</p>
                <Button size="sm" className="mt-2">
                  Schedule Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}