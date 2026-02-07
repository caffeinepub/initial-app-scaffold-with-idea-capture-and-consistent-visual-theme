import { Link, useNavigate } from '@tanstack/react-router';
import { Home, Search, MessageCircle, PlusSquare, User, Shield } from 'lucide-react';
import { useGetCallerProfile } from '../../hooks/useProfiles';
import { useCallerRole } from '../../hooks/useCallerRole';

export function MobileTabBar() {
  const navigate = useNavigate();
  const { data: profile } = useGetCallerProfile();
  const { isAdmin, isOfficer, isLoading: roleLoading } = useCallerRole();

  const handleProfileClick = () => {
    if (profile) {
      navigate({ to: '/profile/$username', params: { username: profile.username } });
    } else {
      navigate({ to: '/settings' });
    }
  };

  const showModeration = !roleLoading && (isAdmin || isOfficer);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t-2 border-primary/30 shadow-strong">
      <div className="flex items-center justify-around h-16 px-2">
        <Link
          to="/"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-primary [&.active]:text-primary transition-all hover:scale-110 [&.active]:scale-110 relative [&.active]:after:absolute [&.active]:after:top-0 [&.active]:after:left-1/2 [&.active]:after:-translate-x-1/2 [&.active]:after:w-12 [&.active]:after:h-1 [&.active]:after:bg-primary [&.active]:after:rounded-b-full"
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1 font-semibold">Home</span>
        </Link>

        <Link
          to="/explore"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-secondary [&.active]:text-secondary transition-all hover:scale-110 [&.active]:scale-110 relative [&.active]:after:absolute [&.active]:after:top-0 [&.active]:after:left-1/2 [&.active]:after:-translate-x-1/2 [&.active]:after:w-12 [&.active]:after:h-1 [&.active]:after:bg-secondary [&.active]:after:rounded-b-full"
        >
          <Search className="h-6 w-6" />
          <span className="text-xs mt-1 font-semibold">Explore</span>
        </Link>

        <Link
          to="/messages"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-accent [&.active]:text-accent transition-all hover:scale-110 [&.active]:scale-110 relative [&.active]:after:absolute [&.active]:after:top-0 [&.active]:after:left-1/2 [&.active]:after:-translate-x-1/2 [&.active]:after:w-12 [&.active]:after:h-1 [&.active]:after:bg-accent [&.active]:after:rounded-b-full"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs mt-1 font-semibold">Messages</span>
        </Link>

        <Link
          to="/create"
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-primary [&.active]:text-primary transition-all hover:scale-110 [&.active]:scale-110 relative [&.active]:after:absolute [&.active]:after:top-0 [&.active]:after:left-1/2 [&.active]:after:-translate-x-1/2 [&.active]:after:w-12 [&.active]:after:h-1 [&.active]:after:bg-primary [&.active]:after:rounded-b-full"
        >
          <PlusSquare className="h-6 w-6" />
          <span className="text-xs mt-1 font-semibold">Create</span>
        </Link>

        {showModeration && (
          <Link
            to="/admin"
            className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-destructive [&.active]:text-destructive transition-all hover:scale-110 [&.active]:scale-110 relative [&.active]:after:absolute [&.active]:after:top-0 [&.active]:after:left-1/2 [&.active]:after:-translate-x-1/2 [&.active]:after:w-12 [&.active]:after:h-1 [&.active]:after:bg-destructive [&.active]:after:rounded-b-full"
          >
            <Shield className="h-6 w-6" />
            <span className="text-xs mt-1 font-semibold">Moderation</span>
          </Link>
        )}

        <button
          onClick={handleProfileClick}
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-primary transition-all hover:scale-110"
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1 font-semibold">Profile</span>
        </button>
      </div>
    </nav>
  );
}
