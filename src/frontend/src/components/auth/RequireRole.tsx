import { type ReactNode } from 'react';
import { useGetCallerProfile } from '../../hooks/useProfiles';
import { UserRole } from '../../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ShieldAlert } from 'lucide-react';

interface RequireRoleProps {
  children: ReactNode;
}

export function RequireRole({ children }: RequireRoleProps) {
  const { data: profile, isLoading } = useGetCallerProfile();

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdminOrOfficer = profile?.role === UserRole.admin || profile?.role === UserRole.officer;

  if (!isAdminOrOfficer) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              This area is restricted to moderators and administrators. You need elevated permissions to access moderation tools.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
