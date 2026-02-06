import { Link, useNavigate } from '@tanstack/react-router';
import { Home, Search, MessageCircle, PlusSquare, User, Shield } from 'lucide-react';
import { useGetCallerProfile } from '../../hooks/useProfiles';
import { useCallerRole } from '../../hooks/useCallerRole';

export function MobileTabBar() {
  const navigate = useNavigate();
  const { data: profile } = useGetCallerProfile();
  const { isOfficer, isLoading: roleLoading } = useCallerRole();

  const handleProfileClick = () => {
    if (profile) {
      navigate({ to: '/profile/$username', params: { username: profile.username } });
    } else {
      navigate({ to: '/settings' });
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex items-center justify-around h-16 px-2">
        <Link
          to="/"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-primary [&.active]:text-primary transition-colors"
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link
          to="/explore"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-primary [&.active]:text-primary transition-colors"
        >
          <Search className="h-6 w-6" />
          <span className="text-xs mt-1">Explore</span>
        </Link>

        <Link
          to="/messages"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-primary [&.active]:text-primary transition-colors"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Messages</span>
        </Link>

        <Link
          to="/create"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-primary [&.active]:text-primary transition-colors"
        >
          <PlusSquare className="h-6 w-6" />
          <span className="text-xs mt-1">Create</span>
        </Link>

        {!roleLoading && isOfficer && (
          <Link
            to="/admin"
            className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-primary [&.active]:text-primary transition-colors"
          >
            <Shield className="h-6 w-6" />
            <span className="text-xs mt-1">Moderation</span>
          </Link>
        )}

        <button
          onClick={handleProfileClick}
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-primary transition-colors"
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
}
