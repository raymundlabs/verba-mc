import { useState } from "react"
import { Upload, Building2, Users, Palette } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

export default function Settings() {
  const { toast } = useToast()
  const [businessSettings, setBusinessSettings] = useState({
    name: "Dental Agents Mission Control",
    address: "123 Medical Plaza, Suite 101",
    phone: "(555) 123-4567",
    email: "info@dentalagents.com",
    description: "AI-powered dental practice management system"
  })

  const [staff] = useState([
    { id: 1, name: "Dr. Sarah Johnson", role: "Dentist", status: "active", avatar: null },
    { id: 2, name: "Mike Chen", role: "Office Manager", status: "active", avatar: null },
    { id: 3, name: "Lisa Rodriguez", role: "Dental Hygienist", status: "active", avatar: null },
    { id: 4, name: "Tom Wilson", role: "Receptionist", status: "offline", avatar: null }
  ])

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your business settings have been updated successfully.",
    })
  }

  const handleLogoUpload = () => {
    toast({
      title: "Logo upload",
      description: "Logo upload feature will be available with Supabase integration.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your business settings, staff, and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Update your practice details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <Button variant="outline" onClick={handleLogoUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG up to 2MB
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  value={businessSettings.name}
                  onChange={(e) => setBusinessSettings(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={businessSettings.address}
                  onChange={(e) => setBusinessSettings(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={businessSettings.phone}
                    onChange={(e) => setBusinessSettings(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessSettings.email}
                    onChange={(e) => setBusinessSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={businessSettings.description}
                  onChange={(e) => setBusinessSettings(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <Button onClick={handleSaveSettings} className="w-full">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Staff Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Staff Management
            </CardTitle>
            <CardDescription>
              Manage your team members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Add New Staff Member
              </Button>

              <Separator />

              <div className="space-y-3">
                {staff.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar || undefined} />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            System Preferences
          </CardTitle>
          <CardDescription>
            Configure system-wide settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium">Business Hours</h3>
                <p className="text-sm text-muted-foreground">Mon-Fri 9AM-5PM</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">Email & SMS alerts</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium">Integrations</h3>
                <p className="text-sm text-muted-foreground">Connect services</p>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}