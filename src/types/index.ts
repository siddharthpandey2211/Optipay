export type LoginMethod = 'mobile' | 'email';

export type Screen = 'login' | 'otp' | 'register' | 'dashboard';

export interface BusinessProfile {
  name: string;
  location: string;
  currency: string;
}

export interface AuthState {
  screen: Screen;
  loginMethod: LoginMethod;
  loginValue: string;
  isNewUser: boolean;
  businessProfile: BusinessProfile | null;
}
