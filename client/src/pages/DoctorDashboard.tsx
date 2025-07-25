import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useNavigation } from '@/lib/navigation';
import { Appointment } from '@shared/schema';
import { AuthStatus } from '@/lib/queryClient';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';



const DoctorDashboard = () => {
  const { setPage } = useNavigation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Błąd usuwania')
      return res.json()
    },
    onSuccess: () => {
      toast({ title: 'Sukces', description: 'Wizyta została usunięta.' })
      queryClient.invalidateQueries({ queryKey: ['/api/my-appointments'] })
    },
    onError: () => {
      toast({ title: 'Błąd', description: 'Nie udało się usunąć wizyty.', variant: 'destructive' })
    },
  })

  const { data: authStatus = { isAuthenticated: false }, isLoading: authLoading } = useQuery<AuthStatus>({
    queryKey: ['/api/auth/status'],
  });

  useEffect(() => {
    if (!authLoading && !authStatus?.isAuthenticated) {
      setPage('login');
    }
  }, [authStatus, authLoading, setPage]);

  const { data: doctorAppointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/my-appointments'],
    enabled: !!authStatus?.isAuthenticated,
  });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    return `${hour > 12 ? hour - 12 : hour}:${minutes || '00'} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch (error) {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Zatwierdzone</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">W trakcie</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Anulowane</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Zakończone</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (authLoading || appointmentsLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-xl font-medium">Ładowanie panelu lekarza...</div>
      </div>
    );
  }

  if (!authStatus?.isAuthenticated) {
    return null;
  }

  const today = format(new Date(), 'yyyy-MM-dd');

  const todayAppointments = doctorAppointments?.filter(
    appointment => appointment.appointmentDate === today
  ) || [];

  const upcomingAppointments = doctorAppointments?.filter(
    appointment => appointment.appointmentDate > today
  ) || [];

  const pastAppointments = doctorAppointments?.filter(
    appointment => appointment.appointmentDate < today
  ) || [];

  return (
    <div className="px-4 py-6 sm:px-0">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Panel Lekarza</CardTitle>
            <CardDescription className="text-lg">
              Witaj ponownie, {authStatus?.user?.fullName}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Wszystkie wizyty</TabsTrigger>
          <TabsTrigger value="today">Dzisiejsze wizyty</TabsTrigger>
          <TabsTrigger value="upcoming">Nadchodzące wizyty</TabsTrigger>
          <TabsTrigger value="past">Minione wizyty</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Wszystkie wizyty</CardTitle>
              <CardDescription>
                Pokaż wszystkie wizyty pacjentów
              </CardDescription>
            </CardHeader>
            <CardContent>
              {doctorAppointments && doctorAppointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pacjent</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Czas</TableHead>
                      <TableHead>Kontakt</TableHead>
                      <TableHead>Powód</TableHead>
                      <TableHead>Status</TableHead>
                       <TableHead>Akcje</TableHead> 
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctorAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="font-medium">{appointment.firstName} {appointment.lastName}</div>
                        </TableCell>
                        <TableCell>{formatDate(appointment.appointmentDate)}</TableCell>
                        <TableCell>{formatTime(appointment.appointmentTime)}</TableCell>
                        <TableCell>
                          <div>{appointment.email}</div>
                          <div className="text-gray-500">{appointment.phone}</div>
                        </TableCell>
                        <TableCell>{appointment.reason}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell>
                          <button onClick={() => deleteAppointment.mutate(appointment.id.toString())}>
                            Usuń
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Nie znaleziono wizyty.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>Dzisiejsze wizyty</CardTitle>
              <CardDescription>
                Twoje umówione spotkania na dzień {format(new Date(), 'MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayAppointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pacjent</TableHead>
                      <TableHead>Czas</TableHead>
                      <TableHead>Kontakt</TableHead>
                      <TableHead>Powód</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="font-medium">{appointment.firstName} {appointment.lastName}</div>
                        </TableCell>
                        <TableCell>{formatTime(appointment.appointmentTime)}</TableCell>
                        <TableCell>
                          <div>{appointment.email}</div>
                          <div className="text-gray-500">{appointment.phone}</div>
                        </TableCell>
                        <TableCell>{appointment.reason}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
Brak umówionych wizyt.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Nadchodzące wizyty</CardTitle>
              <CardDescription>
                Pokaż najbliższe wizyty.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pacjent</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Czas</TableHead>
                      <TableHead>Kontakt</TableHead>
                      <TableHead>Powód</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="font-medium">{appointment.firstName} {appointment.lastName}</div>
                        </TableCell>
                        <TableCell>{formatDate(appointment.appointmentDate)}</TableCell>
                        <TableCell>{formatTime(appointment.appointmentTime)}</TableCell>
                        <TableCell>
                          <div>{appointment.email}</div>
                          <div className="text-gray-500">{appointment.phone}</div>
                        </TableCell>
                        <TableCell>{appointment.reason}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
Brak nadchodzących wizyt
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Minione Wizyty</CardTitle>
              <CardDescription>
Pokaż swoje minione wizyty
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pastAppointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pacjent</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Czas</TableHead>
                      <TableHead>Kontakt</TableHead>
                      <TableHead>Powód</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="font-medium">{appointment.firstName} {appointment.lastName}</div>
                        </TableCell>
                        <TableCell>{formatDate(appointment.appointmentDate)}</TableCell>
                        <TableCell>{formatTime(appointment.appointmentTime)}</TableCell>
                        <TableCell>
                          <div>{appointment.email}</div>
                          <div className="text-gray-500">{appointment.phone}</div>
                        </TableCell>
                        <TableCell>{appointment.reason}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
Brak przebytych wizyt.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
  
};

export default DoctorDashboard;
