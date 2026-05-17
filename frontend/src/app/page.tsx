import LoginGate from '@/components/auth/LoginGate';
import TodayDashboard from '@/components/dashboard/TodayDashboard';

export default function Home() {
  return (
    <LoginGate>
      <TodayDashboard />
    </LoginGate>
  );
}
