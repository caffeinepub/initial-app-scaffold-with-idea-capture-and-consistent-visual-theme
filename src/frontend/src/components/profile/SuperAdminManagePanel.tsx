import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Shield, ShieldCheck } from 'lucide-react';
import { useSetUserVerificationState } from '../../hooks/useAdminModeration';
import { useBackendErrorToast } from '../../hooks/useBackendErrorToast';
import { VerificationState, type PublicUserProfile } from '../../backend';

interface SuperAdminManagePanelProps {
  profile: PublicUserProfile;
}

export function SuperAdminManagePanel({ profile }: SuperAdminManagePanelProps) {
  const setVerificationState = useSetUserVerificationState();
  const { showError, showSuccess } = useBackendErrorToast();

  const handleGiveBlueTick = async () => {
    try {
      await setVerificationState.mutateAsync({
        userId: profile.id,
        verificationState: VerificationState.blueCheck,
      });
      showSuccess('Blue verification badge granted successfully');
    } catch (err) {
      showError(err, 'Failed to grant blue verification badge');
    }
  };

  const handleRemoveBlueTick = async () => {
    try {
      await setVerificationState.mutateAsync({
        userId: profile.id,
        verificationState: VerificationState.unverified,
      });
      showSuccess('Blue verification badge removed successfully');
    } catch (err) {
      showError(err, 'Failed to remove blue verification badge');
    }
  };

  const isBlueVerified = profile.verified === VerificationState.blueCheck;

  return (
    <Card className="border-2 border-destructive/30 shadow-strong admin-profile-theme">
      <CardHeader className="bg-gradient-to-r from-destructive/20 to-destructive/10">
        <CardTitle className="text-destructive flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Super Admin Controls
        </CardTitle>
        <CardDescription className="font-medium">
          Manage user verification status
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="font-semibold">Blue Verification Badge</span>
            </div>
            {isBlueVerified ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveBlueTick}
                disabled={setVerificationState.isPending}
                className="font-semibold"
              >
                Remove
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleGiveBlueTick}
                disabled={setVerificationState.isPending}
                className="font-semibold bg-primary hover:bg-primary/90"
              >
                Grant
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
