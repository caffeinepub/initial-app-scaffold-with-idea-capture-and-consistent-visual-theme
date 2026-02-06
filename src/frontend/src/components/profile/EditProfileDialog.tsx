import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useUpdateProfile } from '../../hooks/useProfiles';
import { ProfileVisibility } from '../../backend';
import type { PublicUserProfile } from '../../backend';

interface EditProfileDialogProps {
  profile: PublicUserProfile;
}

export function EditProfileDialog({ profile }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [email, setEmail] = useState(profile.email || '');
  const [visibility, setVisibility] = useState<ProfileVisibility>(profile.visibility);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateProfileMutation = useUpdateProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatar: profile.avatar,
        email: email.trim(),
        visibility,
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setOpen(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              disabled={updateProfileMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={updateProfileMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={3}
              disabled={updateProfileMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Account Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(value) => setVisibility(value as ProfileVisibility)}
              disabled={updateProfileMutation.isPending}
            >
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProfileVisibility.publicProfile}>
                  Public - Anyone can see your posts
                </SelectItem>
                <SelectItem value={ProfileVisibility.privateProfile}>
                  Private - Only followers can see your posts
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={updateProfileMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
