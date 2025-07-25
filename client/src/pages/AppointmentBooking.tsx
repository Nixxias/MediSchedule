import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useNavigation } from '@/lib/navigation';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

import { appointmentFormSchema, type AppointmentFormData } from '@shared/schema';

const AppointmentBooking = () => {
  const { setPage } = useNavigation();
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      reason: '',
    },
  });

  const createAppointment = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      return apiRequest('POST', '/api/appointments', data);
    },
    onSuccess: () => {
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setPage('home');
      }, 3000);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Nieprawidłowo wykonana rezerwacja. Spróbuj ponownie',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: AppointmentFormData) => {
    createAppointment.mutate(data);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900">Umów wizyte</h2>
          <p className="mt-1 text-sm text-gray-500">
            Wypełniaj wszystkie niezbędne dane, aby móc umówić się do wybranego lekarza.
          </p>

          {showSuccess ? (
            <Alert className="mt-6 bg-green-50 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <AlertDescription>
                <h3 className="text-sm font-medium text-green-800">
                  Wizyta została prawidłowo wykonana!
                </h3>
                <p className="mt-2 text-sm text-green-700">
                  Potwierdzenie wizyty wraz z szczegółami zostały wysłane na podanego maila w formularzu.
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Imie</FormLabel>
                        <FormControl>
                          <Input placeholder="Pierwsze imie" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Nazwisko</FormLabel>
                        <FormControl>
                          <Input placeholder="Nazwisko" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Numer telefonu</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Numer telefonu z kierunkowym" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Wybierz Lekarza</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz Lekarza" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dr-smith">Dr. Smith (Lekarz Ogólny)</SelectItem>
                            <SelectItem value="dr-johnson">Dr. Johnson (Pediatra)</SelectItem>
                            <SelectItem value="dr-williams">Dr. Williams (Kardiolog)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="appointmentDate"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Data wizyty</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="appointmentTime"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Godzina wizyty</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz czas" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="09:00">9:00</SelectItem>
                            <SelectItem value="10:00">10:00</SelectItem>
                            <SelectItem value="11:00">11:00</SelectItem>
                            <SelectItem value="13:00">13:00</SelectItem>
                            <SelectItem value="13:00">12:00</SelectItem>
                            <SelectItem value="14:00">14:00</SelectItem>
                            <SelectItem value="15:00">15:00</SelectItem>
                            <SelectItem value="16:00">16:00</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-6">
                        <FormLabel>Powód wizyty</FormLabel>
                        <FormControl>
                          <Textarea
                          {...field}
                          value={field.value ?? ''}
                          placeholder="Proszę opisz swoje objawy lub powód wizyty..."
                          rows={3}
/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={createAppointment.isPending}
                  >
                    {createAppointment.isPending ? 'W trakcie...' : 'Umów wizyte'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
