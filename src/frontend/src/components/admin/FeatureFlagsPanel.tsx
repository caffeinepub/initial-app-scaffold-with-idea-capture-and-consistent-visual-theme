import { useGetFeatureFlags, useUpdateFeatureFlags } from '../../hooks/useFeatureFlags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import { useBackendErrorToast } from '../../hooks/useBackendErrorToast';

export function FeatureFlagsPanel() {
  const { data: flags, isLoading, error } = useGetFeatureFlags();
  const updateMutation = useUpdateFeatureFlags();
  const { showError, showSuccess } = useBackendErrorToast();

  const handleToggle = async (field: 'filtersEnabled' | 'musicEnabled', value: boolean) => {
    if (!flags) return;

    try {
      await updateMutation.mutateAsync({
        ...flags,
        [field]: value,
      });
      showSuccess('Feature flag updated successfully');
    } catch (err) {
      showError(err, 'Failed to update feature flag');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>Enable or disable platform features</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>Enable or disable platform features</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message || 'Failed to load feature flags'}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Flags</CardTitle>
        <CardDescription>Enable or disable platform features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="admin-filters" className="flex-1">
            <div>
              <p className="font-medium">Filters</p>
              <p className="text-sm text-muted-foreground">Allow users to add filters to posts</p>
            </div>
          </Label>
          <Switch
            id="admin-filters"
            checked={flags?.filtersEnabled || false}
            onCheckedChange={(checked) => handleToggle('filtersEnabled', checked)}
            disabled={updateMutation.isPending}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="admin-music" className="flex-1">
            <div>
              <p className="font-medium">Music</p>
              <p className="text-sm text-muted-foreground">Allow users to add music to posts</p>
            </div>
          </Label>
          <Switch
            id="admin-music"
            checked={flags?.musicEnabled || false}
            onCheckedChange={(checked) => handleToggle('musicEnabled', checked)}
            disabled={updateMutation.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
