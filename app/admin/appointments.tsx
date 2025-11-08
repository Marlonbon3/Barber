import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { supabase } from '../../utils/database';
import { useEffect, useState, useCallback } from 'react';

interface Appointment {
  id: string;
  service_id: number;
  barber_id: number;
  date: string;
  time: string;
  price: number;
  status: string;
  customer_name: string;
  customer_phone: string;
  notes: string | null;
  user_id: string;
  services: {
    name: string;
    duration: string;
  } | null;
  barbers: {
    name: string;
  } | null;
}

interface FormattedAppointment {
  id: string;
  client: string;
  service: string;
  time: string;
  date: string;
  status: string;
  phone: string;
  barber: string;
  price: string;
  duration: string;
  notes: string;
}

export default function AppointmentsManagement() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [appointmentsList, setAppointmentsList] = useState<FormattedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        return;
      }

      if (!user) {
        console.error('User not authenticated');
        return;
      }

      // Build the base query - CORREGIDO según tu estructura de BD
      let query = supabase
        .from('appointments')
        .select(`
          id,
          service_id,
          barber_id,
          date,
          time,
          price,
          status,
          customer_name,
          customer_phone,
          notes,
          user_id,
          services:service_id (
            name,
            duration
          ),
          barbers:barber_id (
            name
          )
        `)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      // Get user role and filter if not admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Si el usuario no es admin, filtrar por user_id (no por owner_id)
      if (!profile?.role || profile.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      const { data: appointmentsData, error: appointmentsError } = await query;

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        throw appointmentsError;
      }

      console.log('Appointments data:', appointmentsData); // Para debugging

      if (appointmentsData) {
        const formattedAppointments = appointmentsData.map((apt: any) => ({
          id: apt.id,
          client: apt.customer_name || 'Sin nombre',
          service: apt.services?.name || 'N/A',
          time: apt.time ? apt.time.substring(0, 5) : 'N/A',
          date: apt.date ? new Date(apt.date).toLocaleDateString('es-ES') : 'N/A',
          status: apt.status === 'pending' ? 'Pendiente' : 
                  apt.status === 'confirmed' ? 'Confirmada' : 
                  apt.status === 'in_progress' ? 'En Proceso' : 
                  apt.status || 'Desconocido',
          phone: apt.customer_phone || 'N/A',
          barber: apt.barbers?.name || 'N/A',
          price: apt.price ? `$${apt.price}` : 'N/A',
          duration: apt.services?.duration || 'N/A',
          notes: apt.notes || ''
        }));
        setAppointmentsList(formattedAppointments);
      }
    } catch (error) {
      console.error('Error in fetchAppointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  // Filtrar citas por estado
  const pendingAppointments = appointmentsList.filter(apt => apt.status === 'Pendiente');
  const confirmedAppointments = appointmentsList.filter(apt => apt.status === 'Confirmada');
  const inProcessAppointments = appointmentsList.filter(apt => apt.status === 'En Proceso');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmada': return '#4CAF50';
      case 'Pendiente': return '#FF9800';
      case 'En Proceso': return '#2196F3';
      default: return colors.icon;
    }
  };

  const renderAppointmentSection = (appointments: FormattedAppointment[], title: string) => {
    if (appointments.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title} ({appointments.length})
        </Text>
        {appointments.map((appointment) => (
          <TouchableOpacity
            key={appointment.id}
            style={[styles.appointmentCard, { backgroundColor: colors.card }]}
            onPress={() => {
              // Aquí puedes agregar navegación a detalles de la cita
              console.log('Appointment pressed:', appointment.id);
            }}
          >
            <View style={styles.appointmentHeader}>
              <Text style={[styles.clientName, { color: colors.text }]}>
                {appointment.client}
              </Text>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(appointment.status) }
              ]}>
                <Text style={styles.statusText}>{appointment.status}</Text>
              </View>
            </View>
            
            <View style={styles.appointmentDetails}>
              <View style={styles.detailRow}>
                <IconSymbol name="scissors" size={16} color="#D4AF37" />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {appointment.service}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <IconSymbol name="clock" size={16} color="#4CAF50" />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {appointment.time} - {appointment.date}
                </Text>
                <Text style={[styles.durationText, { color: colors.text }]}>
                  ({appointment.duration})
                </Text>
              </View>

              <View style={styles.detailRow}>
                <IconSymbol name="person" size={16} color="#2196F3" />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {appointment.barber}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <IconSymbol name="dollarsign.circle" size={16} color="#4CAF50" />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {appointment.price}
                </Text>
              </View>

              {appointment.notes && (
                <View style={styles.detailRow}>
                  <IconSymbol name="text.alignleft" size={16} color="#666" />
                  <Text style={[styles.notesText, { color: colors.text }]}>
                    {appointment.notes}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="arrow.left" size={20} color="#D4AF37" />
          <Text style={[styles.backText, { color: colors.text }]}>Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Gestión de Citas
        </Text>
      </View>
      
      <ScrollView 
        style={styles.appointmentsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderAppointmentSection(pendingAppointments, 'Citas en Espera')}
        {renderAppointmentSection(confirmedAppointments, 'Citas Confirmadas')}
        {renderAppointmentSection(inProcessAppointments, 'Citas en Proceso')}

        {appointmentsList.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol name="calendar" size={48} color={colors.icon} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No hay citas programadas
            </Text>
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: '#D4AF37' }]}
              onPress={fetchAppointments}
            >
              <Text style={styles.refreshButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  appointmentsList: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#D4AF37',
  },
  appointmentCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  appointmentDetails: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  durationText: {
    fontSize: 12,
    marginLeft: 8,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  notesText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});