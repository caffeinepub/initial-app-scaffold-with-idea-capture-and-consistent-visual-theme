import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

export function SupportIssuesPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Issues</CardTitle>
        <CardDescription>View and manage support submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Support issue management is not available - backend methods are missing from the interface.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
