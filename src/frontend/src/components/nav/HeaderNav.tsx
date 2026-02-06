import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '../ui/button';
import { Bell, Settings } from 'lucide-react';
import { useGetCallerProfile } from '../../hooks/useProfiles';
import { useGetNotifications } from '../../hooks/useNotifications';
import { useCallerRole } from '../../hooks/useCallerRole';
import { ProfileAvatar } from '../profile/ProfileAvatar';

export function HeaderNav() {
  const navigate = useNavigate();
  const { data: profile } = useGetCallerProfile();
  const { data: notifications = [] } = useGetNotifications();
  const { isOfficer, isLoading: roleLoading } = useCallerRole();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/generated/instabook-mark.dim_128x128.png" alt="Instabook" className="h-8 w-8" />
            <span className="font-display text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Instabook
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary [&.active]:text-primary"
            >
              Home
            </Link>
            <Link
              to="/explore"
              className="text-sm font-medium transition-colors hover:text-primary [&.active]:text-primary"
            >
              Explore
            </Link>
            <Link
              to="/messages"
              className="text-sm font-medium transition-colors hover:text-primary [&.active]:text-primary"
            >
              Messages
            </Link>
            {!roleLoading && isOfficer && (
              <Link
                to="/admin"
                className="text-sm font-medium transition-colors hover:text-primary [&.active]:text-primary"
              >
                Moderation
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate({ to: '/notifications' })}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {profile ? (
            <button
              onClick={() => navigate({ to: '/profile/$username', params: { username: profile.username } })}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <ProfileAvatar avatar={profile.avatar} username={profile.username} size="sm" />
            </button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/settings' })}
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
