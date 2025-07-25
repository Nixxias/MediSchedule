import { useNavigation } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { AuthStatus } from '@/lib/queryClient';
import { useLocation } from "wouter";

const Home = () => {
  const [_, navigate] = useLocation();
  const { setPage } = useNavigation();
  const { data: authStatus = { isAuthenticated: false } } = useQuery<AuthStatus>({
    queryKey: ['/api/auth/status'],
  });

  const isLoggedIn = authStatus?.isAuthenticated || false;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="rounded-lg bg-white shadow overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900">Witam w MediSchedule</h2>
          <p className="mt-3 text-base text-gray-500">
          Prosty i wygodny sposób na umówienie wizyty u lekarza. Bez zbędnych komplikacji — wystarczy wpisać swoje dane i wybrać dogodny termin.
</p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <h3 className="text-lg font-medium text-primary">Dla pacjentów</h3>
              <p className="mt-2 text-sm text-gray-500">
               Zarezerwuj swoją wizyte w prosty sposób do wybranego lekarza.
              </p>
              <Button 
                className="mt-4"
                onClick={() => {
                  setPage('appointment');
                  navigate('/appointment');
                }}
              >
                Zarezerwuj wizyte
              </Button>
            </div>
            <div className="bg-green-50 rounded-lg p-6 border border-green-100">
              <h3 className="text-lg font-medium text-primary">Dla Lekarzy</h3>
              <p className="mt-2 text-sm text-gray-500">
                Dostęp do panelu dla lekarzy.
              </p>
              <Button 
                className="mt-4 bg-primary hover:bg-green-700"
                onClick={() => {
                  if (isLoggedIn) {
                    setPage('dashboard');
                    window.location.href = '/dashboard';
                  } else {
                    setPage('login');
                    window.location.href = '/login';
                  }
                }}
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Zaloguj się do panelu'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
