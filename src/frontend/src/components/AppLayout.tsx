import { type ReactNode } from 'react';
import { Outlet } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import { HeaderNav } from './nav/HeaderNav';
import { MobileTabBar } from './nav/MobileTabBar';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav />
      
      <main className="flex-1 pb-20 md:pb-8">
        <Outlet />
      </main>

      <MobileTabBar />

      <footer className="hidden md:block border-t bg-muted/30 py-6">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© 2026. Built with</span>
              <Heart className="w-4 h-4 text-primary fill-primary" />
              <span>using</span>
              <a 
                href="https://caffeine.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                caffeine.ai
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Powered by Internet Computer</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
