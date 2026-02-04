// AWS Cognito Authentication Service
import {
  SignUpCommand,
  SignInCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
  SignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, cognitoConfig } from './config';

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
}

// Sign Up
export const signUp = async (
  email: string,
  password: string,
  fullName: string
): Promise<AuthResponse> => {
  try {
    const command = new SignUpCommand({
      ClientId: cognitoConfig.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'name',
          Value: fullName,
        },
      ],
    });

    const response = await cognitoClient.send(command);

    return {
      success: true,
      message: 'Sign up successful. Please check your email for confirmation code.',
      userId: response.UserSub,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Sign up failed',
    };
  }
};

// Confirm Sign Up (verify email)
export const confirmSignUp = async (
  email: string,
  confirmationCode: string
): Promise<AuthResponse> => {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: cognitoConfig.clientId,
      Username: email,
      ConfirmationCode: confirmationCode,
    });

    await cognitoClient.send(command);

    return {
      success: true,
      message: 'Email confirmed successfully. You can now sign in.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Email confirmation failed',
    };
  }
};

// Sign In
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const command = new SignInCommand({
      ClientId: cognitoConfig.clientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(command);

    if (response.AuthenticationResult) {
      // Store tokens in localStorage
      localStorage.setItem('accessToken', response.AuthenticationResult.AccessToken!);
      localStorage.setItem('refreshToken', response.AuthenticationResult.RefreshToken!);
      localStorage.setItem('idToken', response.AuthenticationResult.IdToken!);

      return {
        success: true,
        message: 'Sign in successful',
        accessToken: response.AuthenticationResult.AccessToken,
        refreshToken: response.AuthenticationResult.RefreshToken,
      };
    }

    return {
      success: false,
      message: 'Sign in failed',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Sign in failed',
    };
  }
};

// Forgot Password
export const forgotPassword = async (email: string): Promise<AuthResponse> => {
  try {
    const command = new ForgotPasswordCommand({
      ClientId: cognitoConfig.clientId,
      Username: email,
    });

    await cognitoClient.send(command);

    return {
      success: true,
      message: 'Password reset code sent to your email',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Password reset failed',
    };
  }
};

// Confirm Forgot Password
export const confirmForgotPassword = async (
  email: string,
  resetCode: string,
  newPassword: string
): Promise<AuthResponse> => {
  try {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: cognitoConfig.clientId,
      Username: email,
      ConfirmationCode: resetCode,
      Password: newPassword,
    });

    await cognitoClient.send(command);

    return {
      success: true,
      message: 'Password reset successful',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Password reset confirmation failed',
    };
  }
};

// Get Current User
export const getCurrentUser = async (accessToken: string): Promise<AuthUser | null> => {
  try {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    const response = await cognitoClient.send(command);

    const email = response.UserAttributes?.find((attr) => attr.Name === 'email')?.Value || '';
    const fullName = response.UserAttributes?.find((attr) => attr.Name === 'name')?.Value || '';

    return {
      userId: response.Username!,
      email,
      fullName,
      role: 'user',
    };
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

// Sign Out
export const signOut = async (): Promise<void> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      const command = new SignOutCommand({
        AccessToken: accessToken,
      });

      await cognitoClient.send(command);
    }

    // Clear tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idToken');
  } catch (error) {
    console.error('Sign out error:', error);
    // Still clear tokens even if API call fails
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idToken');
  }
};
