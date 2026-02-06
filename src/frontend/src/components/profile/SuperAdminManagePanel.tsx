import { useState } from 'react';
import { useSetVerifiedStatus } from '../../hooks/useAdminModeration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Separator } from '../ui/separator';
import { UserRole } from '../../backend';
import type { PublicUserProfile } from '../../backend';

interface SuperAdminManagePanelProps {
  profile: PublicUserProfile;
  onActionComplete?: () => void;
}

export function SuperAdminManagePanel({ profile, onActionComplete }: SuperAdminManagePanelProps) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const setVerifiedStatus = useSetVerifiedStatus();

  const isAdminTarget = profile.role === UserRole.admin;

  const handleGiveBlueTick = async () => {
    setError('');
    setSuccess('');
    try {
      await setVerifiedStatus.mutateAsync({ userId: profile.id, verified: true });
      setSuccess('Blue tick given successfully');
      onActionComplete?.();
    } catch (err: any) {
      setError(err.message || 'Failed to give blue tick');
    }
  };

  const handleRemoveBlueTick = async () => {
    if (isAdminTarget) {
      setError('Cannot remove verification from admin users');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await setVerifiedStatus.mutateAsync({ userId: profile.id, verified: false });
      setSuccess('Blue tick removed successfully');
      onActionComplete?.();
    } catch (err: any) {
      setError(err.message || 'Failed to remove blue tick');
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Manage User</CardTitle>
        <CardDescription>Admin controls for @{profile.username}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <h3 className="text-sm font-semibold">Verification</h3>
          <div className="flex gap-2">
            {profile.verified ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveBlueTick}
                disabled={setVerifiedStatus.isPending || isAdminTarget}
                className="gap-2"
              >
                <XCircle className="w-4 h-4" />
                {setVerifiedStatus.isPending ? 'Removing...' : 'Remove Blue Tick'}
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleGiveBlueTick}
                disabled={setVerifiedStatus.isPending}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {setVerifiedStatus.isPending ? 'Giving...' : 'Give Blue Tick'}
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <Alert>
          <AlertDescription>
            Note: Block/unblock and post management features are not available in the current backend interface.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
