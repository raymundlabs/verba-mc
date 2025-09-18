import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProfile, upsertMyProfile, type AppRole } from '@/lib/profiles';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function Profile() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const profile = await getMyProfile();
        if (mounted) {
          setRole((profile?.role as AppRole) ?? null);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleSave = async () => {
    if (!user || !role) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await upsertMyProfile(role);
      setSaved(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{user?.email}</div>
            </div>
            <div className="space-y-3">
              <div className="font-medium">Role</div>
              <RadioGroup value={role ?? ''} onValueChange={(v) => setRole(v as AppRole)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="role-staff" value="staff" />
                  <Label htmlFor="role-staff">Staff</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="role-manager" value="manager" />
                  <Label htmlFor="role-manager">Manager</Label>
                </div>
              </RadioGroup>
              <div className="text-xs text-muted-foreground">Used for access control within the app.</div>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            {saved && <div className="text-sm text-green-600">Saved.</div>}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleSave} disabled={!role || saving || loading}>
            {saving ? 'Saving…' : loading ? 'Loading…' : 'Save changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


