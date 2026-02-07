import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { LogOut, AlertCircle, Moon, Sun, Info } from 'lucide-react';
import { APP_VERSION } from '../constants/appVersion';
import { useThemePreference } from '../hooks/useThemePreference';
import { PageHeader } from '../components/layout/PageHeader';

export function SettingsPage() {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { isDark, setTheme } = useThemePreference();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <PageHeader 
        title="Settings" 
        description="Manage your account and preferences"
      />

      <div className="space-y-6">
        {/* Appearance Section */}
        <Card className="border-2 border-primary/20 shadow-strong">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardTitle className="flex items-center gap-2 text-primary">
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </CardTitle>
            <CardDescription className="font-medium">Customize how Instabook looks on your device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border-2 border-primary/10">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base font-bold">
                  Dark Theme
                </Label>
                <p className="text-sm text-muted-foreground font-medium">
                  Switch between light and dark mode
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={isDark}
                onCheckedChange={handleThemeChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card className="border-2 border-secondary/20 shadow-strong">
          <CardHeader className="bg-gradient-to-r from-secondary/10 to-accent/10">
            <CardTitle className="text-secondary">Account</CardTitle>
            <CardDescription className="font-medium">Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-12 border-2 font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all hover:scale-[1.02]"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </Button>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="border-2 border-accent/20 shadow-strong">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
            <CardTitle className="text-accent">Support</CardTitle>
            <CardDescription className="font-medium">Get help and report issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-12 border-2 font-semibold hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all hover:scale-[1.02]"
              onClick={() => navigate({ to: '/support' })}
            >
              <AlertCircle className="w-5 h-5" />
              <span>Report a problem</span>
            </Button>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card className="border-2 border-primary/20 shadow-strong">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Info className="w-5 h-5" />
              About
            </CardTitle>
            <CardDescription className="font-medium">Application information</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50">
                <span className="text-sm font-bold">Version</span>
                <span className="text-sm text-primary font-semibold">{APP_VERSION}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50">
                <span className="text-sm font-bold">Platform</span>
                <span className="text-sm text-secondary font-semibold">Internet Computer</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
