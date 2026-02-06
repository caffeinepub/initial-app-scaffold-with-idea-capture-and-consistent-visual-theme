import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { UserModerationPanel } from '../components/admin/UserModerationPanel';
import { PostModerationPanel } from '../components/admin/PostModerationPanel';
import { FeatureFlagsPanel } from '../components/admin/FeatureFlagsPanel';
import { SupportIssuesPanel } from '../components/admin/SupportIssuesPanel';

export function AdminPortalPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Moderation Portal</h1>
        <p className="text-muted-foreground">
          Manage users, moderate content, and configure platform features
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserModerationPanel />
        </TabsContent>

        <TabsContent value="posts">
          <PostModerationPanel />
        </TabsContent>

        <TabsContent value="features">
          <FeatureFlagsPanel />
        </TabsContent>

        <TabsContent value="support">
          <SupportIssuesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
