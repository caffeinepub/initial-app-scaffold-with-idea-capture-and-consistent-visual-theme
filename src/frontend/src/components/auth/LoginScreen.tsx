import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { LogIn } from 'lucide-react';

export function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/assets/generated/social-logo.dim_512x512.png" 
              alt="Social" 
              className="w-20 h-20 rounded-2xl object-cover"
            />
          </div>
          <CardTitle className="text-2xl">Welcome to Social</CardTitle>
          <CardDescription>
            Sign in with Internet Identity to connect with friends and share moments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full gap-2"
            size="lg"
          >
            <LogIn className="w-5 h-5" />
            {isLoggingIn ? 'Signing in...' : 'Sign in with Internet Identity'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
