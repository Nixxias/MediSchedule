import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useNavigation } from '@/lib/navigation';
import { loginSchema, type LoginData } from '@shared/schema';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const DoctorLogin = () => {
  const { setPage } = useNavigation();
  const [loginError, setLoginError] = useState('');

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const login = useMutation({
    mutationFn: async (data: LoginData) => {
      return apiRequest('POST', '/api/login', data);
    },
    onSuccess: () => {
      setPage('dashboard');
      window.location.href = '/dashboard';
    },
    onError: (error: any) => {
      setLoginError(error.message || 'Nieprawidłowe. Spróbuj ponownie.');
    },
  });

  const onSubmit = (data: LoginData) => {
    setLoginError('');
    login.mutate(data);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900">Panel logowania dla Lekarza</h2>
          <p className="mt-1 text-sm text-gray-500">
            Zaloguj się proszę niezbędnymi danymi, aby uzyskać dostęp do panelu.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nazwa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasło</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Hasło" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Button type="submit" disabled={login.isPending}>
                  {login.isPending ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>
          </Form>

          {loginError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {loginError}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4 text-sm text-gray-500">
            <p>
              Tylko dla potrzeb testu strony :D
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>Nazwa: dr-smith, Hasło: password1234</li>
              <li>Nazwa: dr-johnson, Hasło: password1233</li>
              <li>Nazwa: dr-williams, Hasło: password1232</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
