import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useSetUserVerificationState } from '../../hooks/useAdminModeration';
import { useBackendErrorToast } from '../../hooks/useBackendErrorToast';
import { UserRole, VerificationState, type PublicUserProfile } from '../../backend';

interface SuperAdminManagePanelProps {
  profile: PublicUserProfile;
}

export function SuperAdminManagePanel({ profile }: SuperAdminManagePanelProps) {
  const [error, setError] = useState('');
  const setVerificationState = useSetUserVerificationState();
  const { showError, showSuccess } = useBackendErrorToast();

  const handleSetBlueVerification = async (enable: boolean) => {
    if (profile.role === UserRole.admin) {
      setError('Cannot modify verification status of admin users');
      showError(new Error('Cannot modify verification status of admin users'));
      return;
    }

    setError('');
    try {
      const newState = enable ? VerificationState.blueCheck : VerificationState.unverified;
      await setVerificationState.mutateAsync({ userId: profile.id, verificationState: newState });
      showSuccess(`User ${enable ? 'verified with blue check' : 'unverified'} successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update verification status';
      setError(errorMessage);
      showError(err, 'Failed to update verification');
    }
  };

  const isBlueVerified = profile.verified === VerificationState.blueCheck;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Verification</CardTitle>
        <CardDescription>Control user verification status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {profile.role !== UserRole.admin && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Blue Verification</p>
                <p className="text-sm text-muted-foreground">Standard verified badge</p>
              </div>
              {!isBlueVerified ? (
                <Button
                  onClick={() => handleSetBlueVerification(true)}
                  disabled={setVerificationState.isPending}
                  size="sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {setVerificationState.isPending ? 'Enabling...' : 'Give Blue Tick'}
                </Button>
              ) : (
                <Button
                  onClick={() => handleSetBlueVerification(false)}
                  disabled={setVerificationState.isPending}
                  variant="outline"
                  size="sm"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {setVerificationState.isPending ? 'Disabling...' : 'Remove Blue Tick'}
                </Button>
              )}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Note: Some moderation features (blocking, role management) are not yet available in the backend interface.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {profile.role === UserRole.admin && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Admin users cannot be moderated
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
