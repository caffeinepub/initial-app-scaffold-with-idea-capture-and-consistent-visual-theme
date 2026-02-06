import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'instabook-theme';

export type Theme = 'light' | 'dark';

export function initializeTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  const theme = (stored === 'dark' ? 'dark' : 'light') as Theme;
  
  // Apply theme immediately to prevent flash
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  return theme;
}

export function useThemePreference() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored === 'dark' ? 'dark' : 'light') as Theme;
  });

  const isDark = theme === 'dark';

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const newTheme = (e.newValue === 'dark' ? 'dark' : 'light') as Theme;
        setThemeState(newTheme);
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { theme, isDark, setTheme, toggleTheme };
}
