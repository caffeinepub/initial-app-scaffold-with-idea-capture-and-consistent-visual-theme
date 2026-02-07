import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, Save } from 'lucide-react';
import { useGetFeatureFlags, useUpdateFeatureFlags } from '../../hooks/useFeatureFlags';
import { useBackendErrorToast } from '../../hooks/useBackendErrorToast';

export function FeatureFlagsPanel() {
  const { data: flags, isLoading, error } = useGetFeatureFlags();
  const setFlags = useUpdateFeatureFlags();
  const { showError, showSuccess } = useBackendErrorToast();

  const [filtersEnabled, setFiltersEnabled] = useState(flags?.filtersEnabled ?? false);
  const [musicEnabled, setMusicEnabled] = useState(flags?.musicEnabled ?? false);

  // Update local state when flags are loaded
  if (flags && (filtersEnabled !== flags.filtersEnabled || musicEnabled !== flags.musicEnabled)) {
    setFiltersEnabled(flags.filtersEnabled);
    setMusicEnabled(flags.musicEnabled);
  }

  const handleSave = async () => {
    try {
      await setFlags.mutateAsync({ filtersEnabled, musicEnabled });
      showSuccess('Feature flags updated successfully');
    } catch (err) {
      showError(err, 'Failed to update feature flags');
    }
  };

  const hasChanges = flags && (filtersEnabled !== flags.filtersEnabled || musicEnabled !== flags.musicEnabled);

  return (
    <Card className="border-2 border-accent/20 shadow-strong">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
        <CardTitle className="text-accent">Feature Flags</CardTitle>
        <CardDescription className="font-medium">Enable or disable platform features</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Loading feature flags...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="font-medium">
              {error instanceof Error ? error.message : 'Failed to load feature flags'}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && flags && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/20">
              <div className="space-y-0.5">
                <Label htmlFor="filters" className="text-base font-bold">
                  Filters
                </Label>
                <p className="text-sm text-muted-foreground font-medium">
                  Enable photo filters for posts
                </p>
              </div>
              <Switch
                id="filters"
                checked={filtersEnabled}
                onCheckedChange={setFiltersEnabled}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-secondary/5 to-accent/5 border-2 border-secondary/20">
              <div className="space-y-0.5">
                <Label htmlFor="music" className="text-base font-bold">
                  Music
                </Label>
                <p className="text-sm text-muted-foreground font-medium">
                  Enable music for stories
                </p>
              </div>
              <Switch
                id="music"
                checked={musicEnabled}
                onCheckedChange={setMusicEnabled}
              />
            </div>

            {hasChanges && (
              <Button
                onClick={handleSave}
                disabled={setFlags.isPending}
                className="w-full font-semibold"
              >
                <Save className="w-4 h-4 mr-2" />
                {setFlags.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
