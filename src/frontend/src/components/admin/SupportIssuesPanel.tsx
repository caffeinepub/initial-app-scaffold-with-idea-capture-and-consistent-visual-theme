import { useGetAllSupportIssues, useUpdateSupportIssueStatus } from '../../hooks/useSupport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { IssueStatus, IssueCategory } from '../../backend';
import { toast } from 'sonner';

export function SupportIssuesPanel() {
  const { data: issues = [], isLoading, error } = useGetAllSupportIssues();
  const updateStatusMutation = useUpdateSupportIssueStatus();

  const handleStatusChange = async (issueId: bigint, status: IssueStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ issueId, status });
      toast.success('Issue status updated');
    } catch (err) {
      toast.error('Failed to update issue status');
    }
  };

  const getCategoryLabel = (category: IssueCategory) => {
    switch (category) {
      case IssueCategory.technical: return 'Technical';
      case IssueCategory.account: return 'Account';
      case IssueCategory.featureRequest: return 'Feature Request';
      case IssueCategory.other: return 'Other';
      default: return 'Unknown';
    }
  };

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.open:
        return <Badge variant="destructive">Open</Badge>;
      case IssueStatus.inProgress:
        return <Badge variant="default">In Progress</Badge>;
      case IssueStatus.resolved:
        return <Badge variant="secondary">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Issues</CardTitle>
          <CardDescription>Manage user support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading support issues...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Issues</CardTitle>
          <CardDescription>Manage user support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load support issues</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (issues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Issues</CardTitle>
          <CardDescription>Manage user support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No support issues yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Issues</CardTitle>
        <CardDescription>Manage user support requests ({issues.length} total)</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.map((issue) => (
                <TableRow key={issue.id.toString()}>
                  <TableCell className="font-mono text-xs">
                    {issue.id.toString().slice(0, 8)}
                  </TableCell>
                  <TableCell>{getCategoryLabel(issue.category)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {issue.description}
                  </TableCell>
                  <TableCell>{getStatusBadge(issue.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(Number(issue.timeCreated) / 1000000).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={issue.status}
                      onValueChange={(value) => handleStatusChange(issue.id, value as IssueStatus)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={IssueStatus.open}>Open</SelectItem>
                        <SelectItem value={IssueStatus.inProgress}>In Progress</SelectItem>
                        <SelectItem value={IssueStatus.resolved}>Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
