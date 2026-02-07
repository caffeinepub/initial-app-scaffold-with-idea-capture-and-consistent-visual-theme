import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { useSubmitSupportIssue, IssueCategory } from '../hooks/useSupport';
import { useBackendErrorToast } from '../hooks/useBackendErrorToast';
import { PageHeader } from '../components/layout/PageHeader';

export function SupportPage() {
  const [category, setCategory] = useState<string>(IssueCategory.technical);
  const [description, setDescription] = useState('');
  const submitIssue = useSubmitSupportIssue();
  const { showError, showSuccess } = useBackendErrorToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      showError(new Error('Please provide a description'), 'Validation Error');
      return;
    }

    try {
      await submitIssue.mutateAsync({ category: category as typeof IssueCategory.technical, description });
      showSuccess('Support issue submitted successfully. We will review it soon.');
      setDescription('');
      setCategory(IssueCategory.technical);
    } catch (err) {
      showError(err, 'Failed to submit support issue');
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <PageHeader
        title="Support"
        description="Need help? Submit a support request and our team will assist you."
      />

      <Card className="border-2 border-primary/20 shadow-strong">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardTitle className="text-primary">Submit Support Request</CardTitle>
          <CardDescription className="font-medium">
            Describe your issue and we'll get back to you as soon as possible
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category" className="font-semibold">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="border-2 focus:ring-2 focus:ring-primary">
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
              <Label htmlFor="description" className="font-semibold">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe your issue in detail..."
                rows={6}
                className="border-2 focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={submitIssue.isPending || !description.trim()}
              className="w-full font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            >
              {submitIssue.isPending ? 'Submitting...' : 'Submit Support Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
