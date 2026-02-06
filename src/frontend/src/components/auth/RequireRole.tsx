import { ReactNode } from 'react';
import { useCallerRole } from '../../hooks/useCallerRole';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { useNavigate } from '@tanstack/react-router';
import { ShieldAlert, AlertCircle } from 'lucide-react';

interface RequireRoleProps {
  children: ReactNode;
  requiredRole: 'admin' | 'officer';
}

export function RequireRole({ children, requiredRole }: RequireRoleProps) {
  const { role, isAdmin, isOfficer, isLoading, error } = useCallerRole();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error Checking Permissions</AlertTitle>
            <AlertDescription>
              Failed to verify your access level. Please try refreshing the page.
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} className="w-full">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  const hasAccess = requiredRole === 'admin' ? isAdmin : isOfficer;

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to access this area. This section is restricted to {requiredRole === 'admin' ? 'administrators' : 'moderators'} only.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate({ to: '/' })} className="w-full">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
