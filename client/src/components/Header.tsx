import { Link } from 'wouter';
import { useNavigation, type Page } from '@/lib/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { apiRequest, AuthStatus } from '@/lib/queryClient';

const Header = () => {
  const { currentPage, setPage } = useNavigation();
  const { data: authStatus = { isAuthenticated: false } } = useQuery<AuthStatus>({
    queryKey: ['/api/auth/status'],
  });

  const isLoggedIn = authStatus?.isAuthenticated || false;

  const handleLogout = async () => {
    await apiRequest('POST', '/api/logout');
    window.location.href = '/';
  };

  const renderNavLink = (page: Page, label: string, path: string) => {
    const isActive = currentPage === page;
    return (
      <Link href={path}>
        <span
          className={`inline-flex items-center px-1 pt-1 border-b-2 cursor-pointer ${
            isActive
              ? 'border-primary text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } text-sm font-medium`}
          onClick={() => setPage(page)}
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
              <Link href="/">
                <a className="text-xl font-bold text-primary" onClick={() => setPage('home')}>
                  MediSchedule
                </a>
              </Link>
            
             <nav className="flex space-x-6">
              {renderNavLink('home', 'Strona główna', '/')}
              {renderNavLink('appointment', 'Umów wizyte', '/appointment')}
              {!isLoggedIn && renderNavLink('login', 'Dla lekarza', '/login')}
            </nav>
          </div>
          {isLoggedIn && (
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                Witaj, {authStatus?.user?.fullName}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Wyloguj
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
