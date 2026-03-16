import { createContext } from 'react';
import type { AuthState, LoginMethod, Screen, BusinessProfile } from '../types';

export interface AuthContextType extends AuthState {
  setScreen: (screen: Screen) => void;
  setLoginMethod: (method: LoginMethod) => void;
  setLoginValue: (value: string) => void;
  setIsNewUser: (isNew: boolean) => void;
  setBusinessProfile: (profile: BusinessProfile) => void;
  reset: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
