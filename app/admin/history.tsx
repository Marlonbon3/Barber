import { supabase } from '@/utils/database';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function AppointmentHistory() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [appointments, setAppointments] = useState<any[]>([]);
  const [barberID, setBarberID] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // useEffect para obtener el barberID del usuario autenticado
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setBarberID(user?.id || null);
    };
    
    getCurrentUser();
  }, []);

  // Función para cargar el historial de citas
  const fetchHistoryAppointments = useCallback(async (showRefreshing = false) => {
    if (!barberID) {
      console.log('⏳ Esperando barberID...');
      return;
    }

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      console.log('🔍 Cargando historial de citas para barber:', barberID);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            id,
            name,
            price
          )
        `)
        .eq('barber_id', barberID)
        .in('status', ['completed', 'cancelled']) // Solo citas completadas y canceladas
        .order('date', { ascending: false })
        .order('time', { ascending: false });
        
      if (error) {
        console.error('Error fetching history appointments:', error);
        setAppointments([]);
      } else {
        console.log('✅ Historial de citas cargado:', data);
        
        // Función para obtener el texto del estado
        const getStatusText = (status: string, cancelledBy?: string) => {
          switch (status) {
            case 'completed': return 'Completada';
            case 'cancelled': 
              if (cancelledBy === 'user') return 'Cancelada por Cliente';
              if (cancelledBy === 'barber') return 'Cancelada por Barbero';
              return 'Cancelada';
            default: return status;
          }
        };

        // Mapear los datos
        const mappedAppointments = data?.map(appointment => ({
          id: appointment.id,
          client: appointment.customer_name || 'Cliente',
          service: appointment.services?.name || 'Servicio',
          time: appointment.time,
          date: appointment.date,
          price: `$${appointment.services?.price || appointment.price || 0}`,
          status: getStatusText(appointment.status, appointment.cancelled_by),
          originalStatus: appointment.status,
          cancelledBy: appointment.cancelled_by,
          cancelledReason: appointment.cancelled_reason,
          notes: appointment.notes,
          customer_phone: appointment.customer_phone,
        })) || [];
        
        setAppointments(mappedAppointments);
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
    } finally {
      if (showRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [barberID]);

  // useEffect para cargar el historial cuando tenemos el barberID
  useEffect(() => {
    fetchHistoryAppointments();
  }, [fetchHistoryAppointments]);

  // Función para refresh manual
  const onRefresh = useCallback(() => {
    fetchHistoryAppointments(true);
  }, [fetchHistoryAppointments]);

  // Función para formatear la fecha de manera legible
  const formatDate = (dateString: string) => {
    let ymd = dateString;
    if (!ymd) return '';
    if (ymd.includes('T')) {
      ymd = ymd.split('T')[0];
    }

    const parts = ymd.split('-');
    if (parts.length !== 3) {
      const fallback = new Date(dateString);
      return fallback.toLocaleDateString();
    }

    const year = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10) - 1;
    const day = Number.parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return `${dayNames[date.getDay()]}, ${day} ${monthNames[date.getMonth()]}`;
    }
  };

  // Filtrar citas por tipo
  const completedAppointments = appointments.filter(app => app.originalStatus === 'completed');
  const cancelledByUserAppointments = appointments.filter(app => app.originalStatus === 'cancelled' && app.cancelledBy === 'user');
  const cancelledByBarberAppointments = appointments.filter(app => app.originalStatus === 'cancelled' && app.cancelledBy === 'barber');

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    if (status === 'Completada') return '#4CAF50';
    if (status.includes('Cancelada por Cliente')) return '#FF9800';
    if (status.includes('Cancelada por Barbero')) return '#F44336';
    return '#9E9E9E';
  };

  // Función para obtener el ícono del estado
  const getStatusIcon = (status: string) => {
    if (status === 'Completada') return 'checkmark.circle.fill';
    if (status.includes('Cancelada por Cliente')) return 'xmark.circle';
    if (status.includes('Cancelada por Barbero')) return 'xmark.circle.fill';
    return 'clock';
  };

  if (loading) {
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
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              Historial de Citas
            </Text>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <IconSymbol name="clock.arrow.circlepath" size={48} color={colors.icon} />
          <Text style={[styles.loadingText, { color: colors.icon }]}>
            Cargando historial...
          </Text>
        </View>
      </View>
    );
  }

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
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Historial de Citas
          </Text>
        </View>
      </View>

      {/* Resumen de estadísticas del historial */}
      <View style={[styles.statsContainer, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{completedAppointments.length}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Completadas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FF9800' }]}>{cancelledByUserAppointments.length}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Canceladas por Cliente</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F44336' }]}>{cancelledByBarberAppointments.length}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Canceladas por Ti</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.appointmentsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#D4AF37']}
            tintColor="#D4AF37"
          />
        }
      >
        {appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="doc.text" size={80} color={colors.icon} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Sin historial aún
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
              Aquí aparecerán las citas completadas y canceladas
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {appointments.map((appointment) => (
              <View
                key={appointment.id}
                style={[styles.appointmentCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.appointmentHeader}>
                  <Text style={[styles.clientName, { color: colors.text }]}>
                    {appointment.client}
                  </Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(appointment.status) }
                  ]}>
                    <IconSymbol 
                      name={getStatusIcon(appointment.status)} 
                      size={12} 
                      color="#fff" 
                    />
                    <Text style={styles.statusText}>{appointment.status}</Text>
                  </View>
                </View>
                
                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <IconSymbol name="scissors" size={16} color="#D4AF37" />
                    <Text style={[styles.serviceText, { color: colors.text }]}>
                      {appointment.service}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <IconSymbol name="calendar" size={16} color="#2196F3" />
                    <Text style={[styles.dateText, { color: colors.text }]}>
                      {formatDate(appointment.date)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <IconSymbol name="clock" size={16} color="#4CAF50" />
                    <Text style={[styles.timeText, { color: colors.text }]}>
                      {appointment.time}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <IconSymbol name="dollarsign.circle" size={16} color="#4CAF50" />
                    <Text style={[styles.priceText, { color: colors.text }]}>
                      {appointment.price}
                    </Text>
                  </View>

                  {/* Mostrar motivo de cancelación si existe */}
                  {appointment.originalStatus === 'cancelled' && appointment.cancelledReason && (
                    <View style={[styles.cancellationInfo, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}>
                      <IconSymbol name="info.circle" size={14} color="#F44336" />
                      <Text style={[styles.cancellationText, { color: '#F44336' }]}>
                        {appointment.cancelledReason}
                      </Text>
                    </View>
                  )}

                  {/* Mostrar notas si existen */}
                  {appointment.notes && (
                    <View style={[styles.notesInfo, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
                      <IconSymbol name="note.text" size={14} color="#D4AF37" />
                      <Text style={[styles.notesText, { color: colors.text }]}>
                        {appointment.notes}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
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
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  appointmentsList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  historyList: {
    paddingBottom: 20,
  },
  appointmentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  appointmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
    marginLeft: 8,
  },
  timeText: {
    fontSize: 14,
    marginLeft: 8,
  },
  priceText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  cancellationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  cancellationText: {
    fontSize: 12,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  notesInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  notesText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
});