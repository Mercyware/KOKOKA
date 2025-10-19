import api from './api';

export interface EmailVerificationService {
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string; user?: any }>;
}

/**
 * Resend email verification
 */
export const resendVerificationEmail = async (email: string) => {
  try {
    const response = await api.post('/auth/resend-verification', { email });
    return {
      success: response.data.success || false,
      message: response.data.message || 'Verification email sent successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to resend verification email',
    };
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (token: string) => {
  try {
    const response = await api.post('/auth/verify-email', { token });
    return {
      success: response.data.success || false,
      message: response.data.message || 'Email verified successfully',
      user: response.data.user,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Email verification failed',
    };
  }
};

export default {
  resendVerificationEmail,
  verifyEmail,
};