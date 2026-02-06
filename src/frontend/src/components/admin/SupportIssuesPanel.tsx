import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertCircle, Clock, CheckCircle, Loader } from 'lucide-react';
import { useGetAllSupportIssues, useUpdateSupportIssueStatus } from '../../hooks/useSupport';
import { useGetProfileById } from '../../hooks/useProfiles';
import { useBackendErrorToast } from '../../hooks/useBackendErrorToast';
import { IssueStatus, type SupportIssue } from '../../types/missing-backend-types';

function SupportIssueItem({ issue }: { issue: SupportIssue }) {
  const { data: creator } = useGetProfileById(issue.creator);
  const updateStatus = useUpdateSupportIssueStatus();
  const { showError, showSuccess } = useBackendErrorToast();
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>(issue.status);

  const handleStatusChange = async (newStatus: IssueStatus) => {
    setSelectedStatus(newStatus);
    try {
      await updateStatus.mutateAsync({ issueId: issue.id, status: newStatus });
      showSuccess('Issue status updated successfully');
    } catch (err) {
      showError(err, 'Failed to update issue status');
      setSelectedStatus(issue.status); // Revert on error
    }
  };

  const getStatusIcon = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.open:
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case IssueStatus.inProgress:
        return <Loader className="w-4 h-4 text-blue-600" />;
      case IssueStatus.resolved:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'technical': return 'Technical Issue';
      case 'account': return 'Account Issue';
      case 'featureRequest': return 'Feature Request';
      case 'other': return 'Other';
      default: return category;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {getCategoryLabel(issue.category)}
                </span>
                <span className="text-xs text-muted-foreground">
                  • {new Date(Number(issue.timeCreated) / 1000000).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm">{issue.description}</p>
              <p className="text-xs text-muted-foreground">
                Submitted by: @{creator?.username || 'Unknown'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(selectedStatus)}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Select 
              value={selectedStatus} 
              onValueChange={(value) => handleStatusChange(value as IssueStatus)}
              disabled={updateStatus.isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={IssueStatus.open}>Open</SelectItem>
                <SelectItem value={IssueStatus.inProgress}>In Progress</SelectItem>
                <SelectItem value={IssueStatus.resolved}>Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SupportIssuesPanel() {
  const { data: issues = [], isLoading, error, refetch } = useGetAllSupportIssues();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Issues</CardTitle>
        <CardDescription>View and manage support submissions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading support issues...</p>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : 'Failed to load support issues'}
              </AlertDescription>
            </Alert>
            <Button onClick={() => refetch()} variant="outline">
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && issues.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No support issues submitted yet
          </p>
        )}

        {!isLoading && !error && issues.length > 0 && (
          <div className="space-y-4">
            {issues.map((issue) => (
              <SupportIssueItem key={issue.id.toString()} issue={issue} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
