import React, { useState } from 'react';
import type { AuthState, LoginMethod, Screen, BusinessProfile } from '../types';
import { AuthContext } from './AuthContext';

const defaultState: AuthState = {
  screen: 'login',
  loginMethod: 'mobile',
  loginValue: '',
  isNewUser: false,
  businessProfile: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);

  const setScreen = (screen: Screen) =>
    setState((prev) => ({ ...prev, screen }));

  const setLoginMethod = (loginMethod: LoginMethod) =>
    setState((prev) => ({ ...prev, loginMethod }));

  const setLoginValue = (loginValue: string) =>
    setState((prev) => ({ ...prev, loginValue }));

  const setIsNewUser = (isNewUser: boolean) =>
    setState((prev) => ({ ...prev, isNewUser }));

  const setBusinessProfile = (businessProfile: BusinessProfile) =>
    setState((prev) => ({ ...prev, businessProfile }));

  const reset = () => setState(defaultState);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        setScreen,
        setLoginMethod,
        setLoginValue,
        setIsNewUser,
        setBusinessProfile,
        reset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
