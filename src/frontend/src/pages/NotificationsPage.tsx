import { useGetNotifications, useMarkNotificationAsRead } from '../hooks/useNotifications';
import { useGetPendingFollowRequests } from '../hooks/useFollowRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Bell, AlertCircle } from 'lucide-react';
import { FollowRequestsPanel } from '../components/profile/FollowRequestsPanel';

export function NotificationsPage() {
  const { data: notifications = [], isLoading, error } = useGetNotifications();
  const { data: followRequests = [] } = useGetPendingFollowRequests();
  const markAsReadMutation = useMarkNotificationAsRead();

  const handleNotificationClick = (notificationId: bigint) => {
    markAsReadMutation.mutate(notificationId);
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      {isLoading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load notifications</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <div className="space-y-6">
          {followRequests.length > 0 && (
            <FollowRequestsPanel />
          )}

          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>Stay updated with your activity</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id.toString()}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          notification.read ? 'bg-background' : 'bg-muted/50'
                        } hover:bg-muted`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm flex-1">{notification.content}</p>
                          {!notification.read && (
                            <Badge variant="default" className="shrink-0">New</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(Number(notification.timeCreated) / 1000000).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
