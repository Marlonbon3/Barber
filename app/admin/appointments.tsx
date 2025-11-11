import { supabase } from '@/utils/database';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';


export default function AppointmentsManagement() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // fetch a la base de datos tabla appointments
  const [appointments, setAppointments] = useState<any[]>([]);
  const [barberID, setBarberID] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  
  // useEffect para obtener el barberID del usuario autenticado
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setBarberID(user?.id || null);
    };
    
    getCurrentUser();
  }, []);

  // Función optimizada para cargar citas
  const fetchAppointments = useCallback(async (showRefreshing = false) => {
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
      console.log('🔍 Cargando citas para barber:', barberID);
      
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
        .order('time', { ascending: true })
        .eq('barber_id', barberID);
        
      if (error) {
        console.error('Error fetching appointments:', error);
        setAppointments([]);
      } else {
        console.log('✅ Citas cargadas:', data);
        // Mapear los datos para que coincidan con la estructura esperada en la UI
        const mappedAppointments = data?.map(appointment => ({
          id: appointment.id,
          client: appointment.customer_name || 'Cliente',
          service: appointment.services?.name || 'Servicio',
          time: appointment.time,
          barber: 'Barbero', // En este caso el barbero es el usuario actual
          price: `$${appointment.services?.price || appointment.price || 0}`,
          status: appointment.status === 'confirmed' ? 'Confirmada' : 
                  appointment.status === 'pending' ? 'Pendiente' : 
                  appointment.status === 'in_progress' ? 'En Proceso' : 'Pendiente',
          date: appointment.date,
          notes: appointment.notes,
          customer_phone: appointment.customer_phone,
        })) || [];
        
        setAppointments(mappedAppointments);
        setLastUpdate(new Date());
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

  // useEffect para cargar las citas cuando tenemos el barberID
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // useEffect para auto-actualización cada 30 segundos
  useEffect(() => {
    if (!barberID) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-actualizando citas...');
      fetchAppointments();
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, [barberID, fetchAppointments]);

  // Función para refresh manual
  const onRefresh = useCallback(() => {
    fetchAppointments(true);
  }, [fetchAppointments]);

  // Filtrar citas por estado
  const pendingAppointments = appointments.filter(app => app.status === 'Pendiente');
  const confirmedAppointments = appointments.filter(app => app.status === 'Confirmada');
  const inProcessAppointments = appointments.filter(app => app.status === 'En Proceso');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmada': return '#4CAF50';
      case 'Pendiente': return '#FF9800';
      case 'En Proceso': return '#2196F3';
      default: return colors.icon;
    }
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
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Gestión de Citas
          </Text>
          <Image
            source={{ uri: 'https://media.tenor.com/2nKSTDDekOgAAAAM/scissors-barber.gif' }}
            style={styles.headerGif}
            contentFit="contain"
          />
        </View>
        <View style={styles.updateInfo}>
          {loading && !refreshing && (
            <IconSymbol name="clock.arrow.circlepath" size={14} color="#D4AF37" />
          )}
          {!loading && (
            <IconSymbol name="clock" size={14} color={colors.icon} />
          )}
          <Text style={[styles.updateText, { color: colors.icon }]}>
            {loading && !refreshing ? 'Actualizando...' : `Última actualización: ${lastUpdate.toLocaleTimeString()}`}
          </Text>
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
        {/* Sección de citas en espera */}
        {pendingAppointments.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Citas en Espera ({pendingAppointments.length})
            </Text>
            {pendingAppointments.map((appointment) => (
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
                    <IconSymbol name="clock" size={16} color="#4CAF50" />
                    <Text style={[styles.timeText, { color: colors.text }]}>
                      {appointment.time}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <IconSymbol name="person" size={16} color="#2196F3" />
                    <Text style={[styles.barberText, { color: colors.text }]}>
                      {appointment.barber}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <IconSymbol name="dollarsign.circle" size={16} color="#4CAF50" />
                    <Text style={[styles.priceText, { color: colors.text }]}>
                      {appointment.price}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Sección de citas confirmadas */}
        {confirmedAppointments.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Citas Confirmadas ({confirmedAppointments.length})
            </Text>
            {confirmedAppointments.map((appointment) => (
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
                    <IconSymbol name="clock" size={16} color="#4CAF50" />
                    <Text style={[styles.timeText, { color: colors.text }]}>
                      {appointment.time}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <IconSymbol name="person" size={16} color="#2196F3" />
                    <Text style={[styles.barberText, { color: colors.text }]}>
                      {appointment.barber}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <IconSymbol name="dollarsign.circle" size={16} color="#4CAF50" />
                    <Text style={[styles.priceText, { color: colors.text }]}>
                      {appointment.price}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Sección de citas en proceso */}
        {inProcessAppointments.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Citas en Proceso ({inProcessAppointments.length})
            </Text>
            {inProcessAppointments.map((appointment) => (
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
                    <IconSymbol name="clock" size={16} color="#4CAF50" />
                    <Text style={[styles.timeText, { color: colors.text }]}>
                      {appointment.time}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <IconSymbol name="person" size={16} color="#2196F3" />
                    <Text style={[styles.barberText, { color: colors.text }]}>
                      {appointment.barber}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <IconSymbol name="dollarsign.circle" size={16} color="#4CAF50" />
                    <Text style={[styles.priceText, { color: colors.text }]}>
                      {appointment.price}
                    </Text>
                  </View>
                  {/* ass gif */}
                        <View>
                          <Image
                          style={styles.image}
                          source="https://media1.tenor.com/m/PMZcTk_3i-sAAAAC/ass.gif"
                          contentFit="cover"
                          transition={1000}
                        />
                        </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {
          // Si no hay citas en ninguna categoría
          pendingAppointments.length === 0 &&
          confirmedAppointments.length === 0 &&
          inProcessAppointments.length === 0 && (
            <View style={styles.section}>
              <View style={styles.noCitasContainer}>
                <Image
                  source={{ uri: 'https://media.tenor.com/AF6yIbPWid0AAAAi/vulgo-phx-limpar.gif' }}
                  style={styles.gifImage}
                  contentFit="contain"
                />
                <Text style={[styles.noCitasTitle, { color: colors.text }]}>
                  Todo tranquilo por aquí 💈
                </Text>
                <Text style={[styles.noCitasSubtitle, { color: colors.icon }]}>
                  No hay citas programadas en este momento. ¡Perfecto momento para descansar!
                </Text>
              </View>
            </View>
          )
        }
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
  appointmentCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#D4AF37',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceText: {
    fontSize: 14,
    marginLeft: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    marginLeft: 8,
  },
  barberText: {
    fontSize: 14,
    marginLeft: 8,
  },
  priceText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  updateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0553',
  },
  noCitasContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  gifImage: {
    width: 500,
    height: 150,
    borderRadius: 12,
    marginBottom: 20,
  },
  noCitasTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  noCitasSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  headerGif: {
    width: 30,
    height: 30,
    borderRadius: 6,
  },
});