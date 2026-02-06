import { useState } from 'react';
import { useSubmitSupportIssue } from '../hooks/useSupport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { IssueCategory } from '../backend';

export function SupportPage() {
  const [category, setCategory] = useState<IssueCategory>(IssueCategory.technical);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useSubmitSupportIssue();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      return;
    }

    try {
      await submitMutation.mutateAsync({ category, description: description.trim() });
      setDescription('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      // Error handled by mutation
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Support</h1>

      <Card>
        <CardHeader>
          <CardTitle>Submit an Issue</CardTitle>
          <CardDescription>
            Having trouble? Let us know and we'll help you out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted && (
            <Alert className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Your support request has been submitted successfully. We'll get back to you soon!
              </AlertDescription>
            </Alert>
          )}

          {submitMutation.isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to submit support request. Please try again.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as IssueCategory)}
              >
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
                placeholder="Please describe your issue in detail..."
                rows={6}
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={!description.trim() || submitMutation.isPending}
              className="w-full"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Issue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
