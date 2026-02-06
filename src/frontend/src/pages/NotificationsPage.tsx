import { useGetNotifications, useMarkNotificationAsRead } from '../hooks/useNotifications';
import { useGetPendingFollowRequests } from '../hooks/useFollowRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Bell, AlertCircle, CheckCheck } from 'lucide-react';
import { FollowRequestsPanel } from '../components/profile/FollowRequestsPanel';
import { PageHeader } from '../components/layout/PageHeader';

export function NotificationsPage() {
  const { data: notifications = [], isLoading, error, refetch } = useGetNotifications();
  const { data: followRequests = [] } = useGetPendingFollowRequests();
  const markAsReadMutation = useMarkNotificationAsRead();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notificationId: bigint) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <PageHeader 
        title="Notifications" 
        description={unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'Stay updated with your activity'}
        actions={
          unreadCount > 0 ? (
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {unreadCount} new
            </Badge>
          ) : null
        }
      />

      {isLoading && (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load notifications. Please try again.</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <div className="space-y-6">
          {followRequests.length > 0 && (
            <FollowRequestsPanel />
          )}

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                All Notifications
              </CardTitle>
              <CardDescription>
                {notifications.length === 0 
                  ? 'No notifications yet' 
                  : `${notifications.length} total notification${notifications.length === 1 ? '' : 's'}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <CheckCheck className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-1">All caught up!</p>
                  <p className="text-sm text-muted-foreground">You have no notifications at the moment</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id.toString()}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                          notification.read 
                            ? 'bg-background border-border' 
                            : 'bg-accent/10 border-accent/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm flex-1 leading-relaxed">{notification.content}</p>
                          {!notification.read && (
                            <Badge variant="default" className="shrink-0 font-semibold">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
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
