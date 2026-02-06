import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerProfile } from '../../hooks/useProfiles';
import { useGetNotifications } from '../../hooks/useNotifications';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Home, Compass, MessageCircle, PlusSquare, User, Shield, Settings, Bell } from 'lucide-react';
import { UserRole } from '../../backend';

export function HeaderNav() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerProfile();
  const { data: notifications = [] } = useGetNotifications();

  const isAuthenticated = !!identity;
  const isAdminOrOfficer = profile?.role === UserRole.admin || profile?.role === UserRole.officer;
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate({ to: '/' })}>
          <img 
            src="/assets/generated/instabook-logo.dim_512x512.png" 
            alt="Instabook" 
            className="w-9 h-9 rounded-lg object-cover"
          />
          <span className="font-bold text-lg hidden sm:inline">Instabook</span>
        </div>

        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/' })}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/explore' })}
              className="gap-2"
            >
              <Compass className="w-4 h-4" />
              Explore
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/messages' })}
              className="gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Messages
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/create' })}
              className="gap-2"
            >
              <PlusSquare className="w-4 h-4" />
              Create
            </Button>
            {profile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/profile/$username', params: { username: profile.username } })}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </Button>
            )}
            {isAdminOrOfficer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/admin' })}
                className="gap-2"
              >
                <Shield className="w-4 h-4" />
                Moderation
              </Button>
            )}
          </nav>
        )}

        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/notifications' })}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: '/settings' })}>
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
