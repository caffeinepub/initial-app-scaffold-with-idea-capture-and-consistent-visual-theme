import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerProfile } from '../../hooks/useProfiles';
import { Home, Compass, MessageCircle, PlusSquare, User, Shield } from 'lucide-react';
import { UserRole } from '../../backend';

export function MobileTabBar() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerProfile();

  const isAuthenticated = !!identity;
  const isAdminOrOfficer = profile?.role === UserRole.admin || profile?.role === UserRole.officer;

  if (!isAuthenticated) return null;

  const currentPath = routerState.location.pathname;

  const tabs = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: PlusSquare, label: 'Create', path: '/create' },
    { icon: User, label: 'Profile', path: profile ? `/profile/${profile.username}` : '/' },
  ];

  if (isAdminOrOfficer) {
    tabs.push({ icon: Shield, label: 'Moderation', path: '/admin' });
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.path || (tab.path === '/messages' && currentPath.startsWith('/messages'));
          return (
            <button
              key={tab.path}
              onClick={() => navigate({ to: tab.path as any })}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
