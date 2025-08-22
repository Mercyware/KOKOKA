import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { GraduationCap, Loader2 } from 'lucide-react';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleOAuthSuccess } = useAuth();
  
  useEffect(() => {
    const handleOAuthCallback = () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      const error = searchParams.get('error');
      
      if (error) {
        // Handle OAuth error
        let errorMessage = 'Authentication failed';
        
        switch (error) {
          case 'oauth_failed':
            errorMessage = 'OAuth authentication failed. Please try again.';
            break;
          case 'oauth_error':
            errorMessage = 'An error occurred during authentication. Please try again.';
            break;
          default:
            errorMessage = 'Authentication failed. Please try again.';
        }
        
        navigate('/login', {
          state: {
            error: errorMessage
          }
        });
        return;
      }
      
      if (token && userParam) {
        try {
          // Decode user data
          const user = JSON.parse(decodeURIComponent(userParam));
          
          // Set token and user in auth context
          handleOAuthSuccess(token, user);
          
          // Redirect to dashboard
          navigate('/dashboard', {
            state: {
              message: `Welcome back, ${user.name}! You've successfully signed in.`
            }
          });
        } catch (error) {
          console.error('Error processing OAuth callback:', error);
          navigate('/login', {
            state: {
              error: 'Failed to process authentication. Please try again.'
            }
          });
        }
      } else {
        // Missing required parameters
        navigate('/login', {
          state: {
            error: 'Authentication incomplete. Please try again.'
          }
        });
      }
    };
    
    handleOAuthCallback();
  }, [searchParams, navigate, handleOAuthSuccess]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 dark:from-blue-950 dark:via-purple-950 dark:to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-3">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Completing Sign In
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Please wait while we complete your authentication...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
