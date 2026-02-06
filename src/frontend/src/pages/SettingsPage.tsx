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
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize how Instabook looks on your device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base font-medium">
                  Dark Theme
                </Label>
                <p className="text-sm text-muted-foreground">
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
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-12"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </Button>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Support</CardTitle>
            <CardDescription>Get help and report issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-12"
              onClick={() => navigate({ to: '/support' })}
            >
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Report a problem</span>
            </Button>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              About
            </CardTitle>
            <CardDescription>Application information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Version</span>
                <span className="text-sm text-muted-foreground">{APP_VERSION}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Platform</span>
                <span className="text-sm text-muted-foreground">Internet Computer</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
