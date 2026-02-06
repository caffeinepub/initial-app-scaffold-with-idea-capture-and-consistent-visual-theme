import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreatePost } from '../hooks/usePosts';
import { useGetCallerProfile } from '../hooks/useProfiles';
import { fileToUint8Array } from '../utils/postImage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, Image as ImageIcon, X } from 'lucide-react';

const MAX_IMAGE_SIZE = 5_000_000; // 5MB

export function CreatePostPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  const createPost = useCreatePost();
  const { data: profile } = useGetCallerProfile();

  const isBlocked = profile?.blocked || false;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError('');
    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!caption.trim() && !selectedFile) {
      setError('Please add a caption or image');
      return;
    }

    try {
      let imageData: Uint8Array | null = null;
      
      if (selectedFile) {
        imageData = await fileToUint8Array(selectedFile);
      }

      createPost.mutate(
        {
          caption: caption.trim(),
          image: imageData,
        },
        {
          onSuccess: () => {
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
            }
            navigate({ to: '/' });
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : 'Failed to create post');
          },
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    }
  };

  if (isBlocked) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your account has been restricted. You can view content but cannot create posts, comment, or interact with others.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Post</CardTitle>
          <CardDescription>Share a moment with your followers</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!previewUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Select Image
                </Button>
              ) : (
                <div className="relative aspect-square max-w-sm bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Maximum file size: 5MB</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/' })}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPost.isPending || (!caption.trim() && !selectedFile)}
              >
                {createPost.isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
