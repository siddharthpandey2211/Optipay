import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/useAuth';
import { LoginScreen } from './screens/LoginScreen';
import { OtpScreen } from './screens/OtpScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { DashboardScreen } from './screens/DashboardScreen';

function AppRouter() {
  const { screen } = useAuth();

  switch (screen) {
    case 'login':
      return <LoginScreen />;
    case 'otp':
      return <OtpScreen />;
    case 'register':
      return <RegisterScreen />;
    case 'dashboard':
      return <DashboardScreen />;
    default:
      return <LoginScreen />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
