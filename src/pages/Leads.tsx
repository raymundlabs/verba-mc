import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search,
  Filter,
  Users,
  Phone,
  Calendar,
  MoreVertical,
  User,
  Clock,
  Loader2,
  FileText,
  Play,
  X
} from "lucide-react"
import { supabase, Lead } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function getUrgencyColor(urgency: string | null) {
  switch (urgency) {
    case "emergency":
      return "bg-destructive text-destructive-foreground"
    case "urgent":
      return "bg-warning text-warning-foreground"
    case "routine":
      return "bg-accent text-accent-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-accent text-accent-foreground"
    case "confirmed":
      return "bg-primary text-primary-foreground"
    case "cancelled":
      return "bg-destructive text-destructive-foreground"
    case "scheduled":
      return "bg-warning text-warning-foreground"
    case "no_show":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(timeString: string) {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatDate(dateString);
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (lead.patient_name?.toLowerCase().includes(searchLower)) ||
      (lead.name?.toLowerCase().includes(searchLower)) ||
      (lead.phone?.includes(searchTerm))
    );
  });

  useEffect(() => {
    // Initial fetch
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .or('primary_concern.is.null,primary_concern.eq.\'\'');

        if (error) throw error;
        setLeads(data || []);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError(err as PostgrestError);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();

    // Set up real-time subscription with optimized updates
    const subscription = supabase
      .channel('leads_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'leads',
      }, (payload) => {
        setLeads(currentLeads => {
          // Handle INSERT
          if (payload.eventType === 'INSERT') {
            const newLead = payload.new as Lead;
            // Only add if it matches our filter (no primary concern)
            if (!newLead.primary_concern || newLead.primary_concern.trim() === '') {
              return [newLead, ...currentLeads];
            }
            return currentLeads;
          }
          
          // Handle UPDATE
          if (payload.eventType === 'UPDATE') {
            const updatedLead = payload.new as Lead;
            const oldLead = payload.old as Lead;
            
            // If primary_concern was added, remove from the list
            if ((!oldLead.primary_concern || oldLead.primary_concern.trim() === '') && 
                updatedLead.primary_concern && updatedLead.primary_concern.trim() !== '') {
              return currentLeads.filter(lead => lead.id !== updatedLead.id);
            }
            
            // If primary_concern was removed, add to the list
            if ((oldLead.primary_concern && oldLead.primary_concern.trim() !== '') && 
                (!updatedLead.primary_concern || updatedLead.primary_concern.trim() === '')) {
              return [updatedLead, ...currentLeads];
            }
            
            // If still matches filter, update in place
            if (!updatedLead.primary_concern || updatedLead.primary_concern.trim() === '') {
              return currentLeads.map(lead => 
                lead.id === updatedLead.id ? updatedLead : lead
              );
            }
            
            // If doesn't match filter anymore, remove
            return currentLeads.filter(lead => lead.id !== updatedLead.id);
          }
          
          // Handle DELETE
          if (payload.eventType === 'DELETE') {
            return currentLeads.filter(lead => lead.id !== payload.old.id);
          }
          
          // Default case: refetch if we're not sure
          fetchLeads();
          return currentLeads;
        });
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading leads...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-destructive">
        <p>Error loading leads: {error.message}</p>
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
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-muted-foreground">
            Track and manage patient leads without primary concerns
          </p>
        </div>
        <Button>
          <Phone className="w-4 h-4 mr-2" />
          Manual Entry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Leads Without Primary Concern
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search leads..." 
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading leads...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-destructive">
              <p>Error loading leads: {error.message}</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No leads found without a primary concern.</p>
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
            <div className="space-y-2">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="min-w-[200px]">
                        <h3 className="font-medium">
                          {lead.patient_name || lead.name || 'Unnamed Lead'}
                        </h3>
                      </div>
                      
                      <div className="min-w-[150px]">
                        <a href={`tel:${lead.phone}`} className="hover:underline text-sm text-muted-foreground">
                          {lead.phone}
                        </a>
                      </div>
                      
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(lead.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedLead(lead);
                        // In a real app, you would fetch the transcript here
                        // For now, we'll use a placeholder
                        setTranscript(`Call with ${lead.patient_name || lead.name || 'customer'} on ${new Date(lead.created_at).toLocaleString()}\n\n[Transcript would appear here]`);
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
                      <a href={`tel:${lead.phone}`} title="Call">
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
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