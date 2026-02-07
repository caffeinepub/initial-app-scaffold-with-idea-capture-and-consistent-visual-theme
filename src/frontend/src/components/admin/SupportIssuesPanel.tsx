import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { useGetAllSupportIssues, useUpdateSupportIssueStatus, IssueStatus, type SupportIssue } from '../../hooks/useSupport';
import { useGetProfileById } from '../../hooks/useProfiles';
import { useBackendErrorToast } from '../../hooks/useBackendErrorToast';

function SupportIssueItem({ issue }: { issue: SupportIssue }) {
  const { data: creator } = useGetProfileById(issue.creator);
  const updateStatus = useUpdateSupportIssueStatus();
  const { showError, showSuccess } = useBackendErrorToast();

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ issueId: issue.id, status: newStatus as typeof IssueStatus.open });
      showSuccess('Issue status updated successfully');
    } catch (err) {
      showError(err, 'Failed to update issue status');
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'technical': return 'Technical Issue';
      case 'account': return 'Account Issue';
      case 'featureRequest': return 'Feature Request';
      default: return 'Other';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case IssueStatus.open: return 'text-destructive';
      case IssueStatus.inProgress: return 'text-accent';
      case IssueStatus.resolved: return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-r from-muted/30 to-transparent space-y-3 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm text-primary">{getCategoryLabel(issue.category)}</span>
          </div>
          <p className="text-sm font-medium leading-relaxed">{issue.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-medium">By: <span className="font-bold text-secondary">@{creator?.username || 'Unknown'}</span></span>
            <span className="font-medium">{new Date(Number(issue.timeCreated) / 1000000).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs font-bold ${getStatusColor(issue.status)}`}>
            {issue.status === IssueStatus.open && 'Open'}
            {issue.status === IssueStatus.inProgress && 'In Progress'}
            {issue.status === IssueStatus.resolved && 'Resolved'}
          </span>
          <Select
            value={issue.status}
            onValueChange={handleStatusChange}
            disabled={updateStatus.isPending}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs border-2 font-semibold">
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
    </div>
  );
}

export function SupportIssuesPanel() {
  const { data: issues = [], isLoading, error } = useGetAllSupportIssues();

  return (
    <Card className="border-2 border-destructive/20 shadow-strong">
      <CardHeader className="bg-gradient-to-r from-destructive/10 to-accent/10">
        <CardTitle className="text-destructive">Support Issues</CardTitle>
        <CardDescription className="font-medium">Manage user-submitted support requests</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-destructive border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Loading support issues...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="font-medium">
              {error instanceof Error ? error.message : 'Failed to load support issues'}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && issues.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground font-medium">No support issues found</p>
          </div>
        )}

        {!isLoading && !error && issues.length > 0 && (
          <div className="space-y-3">
            {issues.map((issue) => (
              <SupportIssueItem key={issue.id.toString()} issue={issue} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
