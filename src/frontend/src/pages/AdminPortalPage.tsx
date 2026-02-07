import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { UserModerationPanel } from '../components/admin/UserModerationPanel';
import { PostModerationPanel } from '../components/admin/PostModerationPanel';
import { FeatureFlagsPanel } from '../components/admin/FeatureFlagsPanel';
import { SupportIssuesPanel } from '../components/admin/SupportIssuesPanel';
import { Shield } from 'lucide-react';

export function AdminPortalPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="bg-card rounded-xl border-2 border-destructive/30 shadow-strong p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-xl shadow-soft">
            <Shield className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-destructive to-destructive/70 bg-clip-text text-transparent">Moderation Portal</h1>
        </div>
        <p className="text-muted-foreground font-medium">
          Manage users, moderate content, and configure platform settings
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50 border-2 border-primary/20 shadow-soft">
          <TabsTrigger 
            value="users" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold py-3 transition-all data-[state=active]:scale-105"
          >
            Users
          </TabsTrigger>
          <TabsTrigger 
            value="posts" 
            className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-md font-semibold py-3 transition-all data-[state=active]:scale-105"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger 
            value="features" 
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md font-semibold py-3 transition-all data-[state=active]:scale-105"
          >
            Features
          </TabsTrigger>
          <TabsTrigger 
            value="support" 
            className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground data-[state=active]:shadow-md font-semibold py-3 transition-all data-[state=active]:scale-105"
          >
            Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserModerationPanel />
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <PostModerationPanel />
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <FeatureFlagsPanel />
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <SupportIssuesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
