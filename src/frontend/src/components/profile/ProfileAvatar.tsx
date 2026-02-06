interface ProfileAvatarProps {
  avatar?: string;
  username: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ProfileAvatar({ avatar, username, size = 'md', className = '' }: ProfileAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-lg',
    xl: 'w-32 h-32 text-2xl',
  };

  const displayAvatar = avatar || '/assets/generated/default-avatar.dim_256x256.png';

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-muted flex items-center justify-center ${className}`}>
      <img 
        src={displayAvatar} 
        alt={username}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
