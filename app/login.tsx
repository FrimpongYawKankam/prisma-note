import { PageTransition } from '../src/components/ui/PageTransition';
import LoginScreenComponent from '../src/screens/auth/LoginScreen';

export default function LoginScreen() {
  return (
    <PageTransition duration={350}>
      <LoginScreenComponent />
    </PageTransition>
  );
}
