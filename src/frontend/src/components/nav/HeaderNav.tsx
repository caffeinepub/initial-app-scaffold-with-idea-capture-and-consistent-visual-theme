import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '../ui/button';
import { Bell, Settings, Shield } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useGetCallerProfile } from '../../hooks/useProfiles';
import { useGetNotifications } from '../../hooks/useNotifications';
import { useCallerRole } from '../../hooks/useCallerRole';
import { ProfileAvatar } from '../profile/ProfileAvatar';

export function HeaderNav() {
  const navigate = useNavigate();
  const { data: profile } = useGetCallerProfile();
  const { data: notifications = [] } = useGetNotifications();
  const { isAdmin, isOfficer, isLoading: roleLoading } = useCallerRole();

  const unreadCount = notifications.filter(n => !n.read).length;
  const showModeration = !roleLoading && (isAdmin || isOfficer);

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-primary/30 bg-card/95 backdrop-blur-lg supports-[backdrop-filter]:bg-card/90 shadow-strong">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <img src="/assets/generated/instabook-mark.dim_128x128.png" alt="Instabook" className="h-9 w-9 transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Instabook
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-semibold transition-all hover:text-primary hover:scale-105 [&.active]:text-primary [&.active]:font-bold relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 after:transition-transform [&.active]:after:scale-x-100"
            >
              Home
            </Link>
            <Link
              to="/explore"
              className="text-sm font-semibold transition-all hover:text-secondary hover:scale-105 [&.active]:text-secondary [&.active]:font-bold relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-secondary after:scale-x-0 after:transition-transform [&.active]:after:scale-x-100"
            >
              Explore
            </Link>
            <Link
              to="/messages"
              className="text-sm font-semibold transition-all hover:text-accent hover:scale-105 [&.active]:text-accent [&.active]:font-bold relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-accent after:scale-x-0 after:transition-transform [&.active]:after:scale-x-100"
            >
              Messages
            </Link>
            {showModeration && (
              <Link
                to="/admin"
                className="text-sm font-semibold transition-all hover:text-destructive hover:scale-105 [&.active]:text-destructive [&.active]:font-bold flex items-center gap-1.5 relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-destructive after:scale-x-0 after:transition-transform [&.active]:after:scale-x-100"
              >
                <Shield className="h-4 w-4" />
                Moderation
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
            onClick={() => navigate({ to: '/notifications' })}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-xs font-bold shadow-glow"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-secondary/10 hover:text-secondary transition-all hover:scale-110"
            onClick={() => navigate({ to: '/settings' })}
          >
            <Settings className="h-5 w-5" />
          </Button>

          {profile && (
            <button
              onClick={() => navigate({ to: '/profile/$username', params: { username: profile.username } })}
              className="flex items-center gap-2 hover:opacity-80 transition-all hover:scale-105 ml-1 ring-2 ring-primary/20 rounded-full hover:ring-primary/40"
            >
              <ProfileAvatar avatar={profile.avatar} username={profile.username} size="sm" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
