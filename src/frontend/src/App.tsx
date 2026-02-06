import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { AppLayout } from './components/AppLayout';
import { RequireAuth } from './components/auth/RequireAuth';
import { RequireRole } from './components/auth/RequireRole';
import { HomeFeedPage } from './pages/HomeFeedPage';
import { ExplorePage } from './pages/ExplorePage';
import { ProfilePage } from './pages/ProfilePage';
import { CreatePostPage } from './pages/CreatePostPage';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { MessagesPage } from './pages/MessagesPage';
import { ConversationPage } from './pages/ConversationPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SupportPage } from './pages/SupportPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <RequireAuth>
      <HomeFeedPage />
    </RequireAuth>
  ),
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/explore',
  component: () => (
    <RequireAuth>
      <ExplorePage />
    </RequireAuth>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$username',
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
});

const createPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: () => (
    <RequireAuth>
      <CreatePostPage />
    </RequireAuth>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <RequireAuth>
      <RequireRole>
        <AdminPortalPage />
      </RequireRole>
    </RequireAuth>
  ),
});

const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/post/$postId',
  component: () => (
    <RequireAuth>
      <PostDetailPage />
    </RequireAuth>
  ),
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages',
  component: () => (
    <RequireAuth>
      <MessagesPage />
    </RequireAuth>
  ),
});

const conversationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages/$peer',
  component: () => (
    <RequireAuth>
      <ConversationPage />
    </RequireAuth>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <RequireAuth>
      <SettingsPage />
    </RequireAuth>
  ),
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: () => (
    <RequireAuth>
      <NotificationsPage />
    </RequireAuth>
  ),
});

const supportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/support',
  component: () => (
    <RequireAuth>
      <SupportPage />
    </RequireAuth>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  exploreRoute,
  profileRoute,
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
