import { useGetPendingFollowRequests, useApproveFollowRequest, useDenyFollowRequest } from '../../hooks/useFollowRequests';
import { useGetProfileById } from '../../hooks/useProfiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { ProfileAvatar } from './ProfileAvatar';
import { Alert, AlertDescription } from '../ui/alert';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export function FollowRequestsPanel() {
  const { data: requests = [], isLoading } = useGetPendingFollowRequests();
  const approveMutation = useApproveFollowRequest();
  const denyMutation = useDenyFollowRequest();

  const handleApprove = async (requestId: bigint) => {
    try {
      await approveMutation.mutateAsync(requestId);
      toast.success('Follow request approved');
    } catch (err) {
      toast.error('Failed to approve request');
    }
  };

  const handleDeny = async (requestId: bigint) => {
    try {
      await denyMutation.mutateAsync(requestId);
      toast.success('Follow request denied');
    } catch (err) {
      toast.error('Failed to deny request');
    }
  };

  if (isLoading) {
    return null;
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Follow Requests</CardTitle>
        <CardDescription>People who want to follow you</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {requests.map((request) => (
              <FollowRequestItem
                key={request.id.toString()}
                request={request}
                onApprove={() => handleApprove(request.id)}
                onDeny={() => handleDeny(request.id)}
                isPending={approveMutation.isPending || denyMutation.isPending}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function FollowRequestItem({ 
  request, 
  onApprove, 
  onDeny, 
  isPending 
}: { 
  request: any; 
  onApprove: () => void; 
  onDeny: () => void; 
  isPending: boolean;
}) {
  const { data: requester } = useGetProfileById(request.requester);

  return (
    <div className="flex items-center justify-between gap-4 p-3 border rounded-lg">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {requester && <ProfileAvatar avatar={requester.avatar} username={requester.username} size="sm" />}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{requester?.displayName || 'Unknown'}</p>
          <p className="text-xs text-muted-foreground truncate">@{requester?.username || 'unknown'}</p>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button 
          size="sm" 
          onClick={onApprove} 
          disabled={isPending}
        >
          Approve
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onDeny} 
          disabled={isPending}
        >
          Deny
        </Button>
      </div>
    </div>
  );
}
