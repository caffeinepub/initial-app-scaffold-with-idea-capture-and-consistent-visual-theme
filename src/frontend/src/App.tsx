import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { AppLayout } from './components/AppLayout';
import { RequireAuth } from './components/auth/RequireAuth';
import { RequireRole } from './components/auth/RequireRole';
import { HomeFeedPage } from './pages/HomeFeedPage';
import { ExplorePage } from './pages/ExplorePage';
import { ProfilePage } from './pages/ProfilePage';
import { FollowersFollowingPage } from './pages/FollowersFollowingPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { MessagesPage } from './pages/MessagesPage';
import { ConversationPage } from './pages/ConversationPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SupportPage } from './pages/SupportPage';
import { Button } from './components/ui/button';
import { AlertCircle } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function RouteErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  // Extract user-friendly message from error
  const errorMessage = error.message || 'An unexpected error occurred while loading this page.';
  
  // Don't show internal React error codes in production
  const displayMessage = errorMessage.includes('Minified React error')
    ? 'Something went wrong while loading this page. Please try again.'
    : errorMessage;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          {displayMessage}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: AppLayout,
  errorComponent: RouteErrorFallback,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <RequireAuth>
      <HomeFeedPage />
    </RequireAuth>
  ),
  errorComponent: RouteErrorFallback,
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/explore',
  component: () => (
    <RequireAuth>
      <ExplorePage />
    </RequireAuth>
  ),
  errorComponent: RouteErrorFallback,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$username',
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
  errorComponent: RouteErrorFallback,
});

const followersFollowingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$username/$type',
  component: () => (
    <RequireAuth>
      <FollowersFollowingPage />
    </RequireAuth>
  ),
  errorComponent: RouteErrorFallback,
});

const createPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: () => (
    <RequireAuth>
      <CreatePostPage />
    </RequireAuth>
  ),
  errorComponent: RouteErrorFallback,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <RequireAuth>
      <RequireRole requiredRole="officer">
        <AdminPortalPage />
      </RequireRole>
    </RequireAuth>
  ),
  errorComponent: RouteErrorFallback,
});

const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/post/$postId',
  component: () => (
    <RequireAuth>
      <PostDetailPage />
    </RequireAuth>
  ),
  errorComponent: RouteErrorFallback,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages',
  component: () => (
    <RequireAuth>
      <MessagesPage />
    </RequireAuth>
  ),
  errorComponent: RouteErrorFallback,
});

const conversationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages/$peer',
  component: () => (
    <RequireAuth>
      <ConversationPage />
    </RequireAuth>
  ),
  errorComponent: RouteErrorFallback,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <RequireAuth>
      <SettingsPage />
    </RequireAuth>
  ),
  errorComponent: RouteErrorFallback,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: () => (
    <RequireAuth>
      <NotificationsPage />
    </RequireAuth>
  ),
  errorComponent: RouteErrorFallback,
});

const supportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/support',
  component: () => (
    <RequireAuth>
      <SupportPage />
    </RequireAuth>
  ),
  errorComponent: RouteErrorFallback,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  exploreRoute,
  profileRoute,
  followersFollowingRoute,
  createPostRoute,
  adminRoute,
  postDetailRoute,
  messagesRoute,
  conversationRoute,
  settingsRoute,
  notificationsRoute,
  supportRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
