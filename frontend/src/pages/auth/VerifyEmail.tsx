import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { verifyEmail as verifyEmailService } from '@/services/emailVerificationService';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const result = await verifyEmailService(token);
        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Your email has been verified successfully!');
        } else {
          throw new Error(result.message);
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.message ||
          'Email verification failed. The link may have expired or is invalid.'
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'verifying' && (
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'verifying' && 'Verifying Your Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'verifying' && 'Please wait while we verify your email address...'}
            {message}
          </CardDescription>
        </CardHeader>

        {(status === 'success' || status === 'error') && (
          <CardContent className="space-y-4">
            {status === 'success' && (
              <div className="space-y-4">
                <p className="text-sm text-center text-muted-foreground">
                  You can now log in to your account and access all features.
                </p>
                <Button
                  intent="primary"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Go to Login
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <p className="text-sm text-center text-muted-foreground">
                  Please contact support if you continue to experience issues.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    intent="cancel"
                    className="w-full sm:w-auto"
                    onClick={() => navigate('/register-school')}
                  >
                    Register Again
                  </Button>
                  <Button
                    intent="primary"
                    className="w-full sm:w-auto"
                    onClick={() => navigate('/login')}
                  >
                    Go to Login
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
