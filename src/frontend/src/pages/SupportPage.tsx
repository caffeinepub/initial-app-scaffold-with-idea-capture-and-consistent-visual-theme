import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { IssueCategory } from '../types/missing-backend-types';
import { useSubmitSupportIssue } from '../hooks/useSupport';
import { PageHeader } from '../components/layout/PageHeader';

export function SupportPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<IssueCategory>(IssueCategory.technical);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submitIssue = useSubmitSupportIssue();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }

    try {
      await submitIssue.mutateAsync({ category, description: description.trim() });
      setSuccess(true);
      setDescription('');
      setTimeout(() => {
        navigate({ to: '/' });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit support issue');
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <PageHeader 
        title="Report a Problem" 
        description="Let us know if you're experiencing any issues"
      />

      <Card>
        <CardHeader>
          <CardTitle>Submit Support Issue</CardTitle>
          <CardDescription>
            Describe the problem you're facing and we'll look into it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Support issue submitted successfully! Redirecting...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as IssueCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={IssueCategory.technical}>Technical Issue</SelectItem>
                  <SelectItem value={IssueCategory.account}>Account Issue</SelectItem>
                  <SelectItem value={IssueCategory.featureRequest}>Feature Request</SelectItem>
                  <SelectItem value={IssueCategory.other}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail..."
                rows={6}
                disabled={submitIssue.isPending}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/' })}
                disabled={submitIssue.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitIssue.isPending || !description.trim()}>
                {submitIssue.isPending ? 'Submitting...' : 'Submit Issue'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
