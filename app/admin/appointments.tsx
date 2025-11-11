import { supabase } from '@/utils/database';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  
  // Estados para el modal de cambio de estado
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  
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
      console.log('🔍 Cargando citas para barber');
      
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
        // Función para obtener el texto del estado
        const getStatusText = (status: string) => {
          switch (status) {
            case 'confirmed': return 'Confirmada';
            case 'pending': return 'Pendiente';
            case 'in_progress': return 'En Proceso';
            case 'completed': return 'Completada';
            default: return 'Confirmada';
          }
        };

        // Mapear los datos para que coincidan con la estructura esperada en la UI
        // Filtrar solo las citas que NO están canceladas (incluye completed para contar pero no mostrar)
        const mappedAppointments = data?.filter(appointment => appointment.status !== 'cancelled').map(appointment => {
          console.log(`📋 Cita ${appointment.id}: status="${appointment.status}" -> "${getStatusText(appointment.status)}"`);
          return {
            id: appointment.id,
            client: appointment.customer_name || 'Cliente',
            service: appointment.services?.name || 'Servicio',
            time: appointment.time,
            barber: 'Barbero', // En este caso el barbero es el usuario actual
            price: `$${appointment.services?.price || appointment.price || 0}`,
            status: getStatusText(appointment.status),
            date: appointment.date,
            notes: appointment.notes,
            customer_phone: appointment.customer_phone,
            originalStatus: appointment.status, // Mantener el status original para las actualizaciones
          };
        }) || [];
        
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

  // Función para abrir el modal de cambio de estado
  const openStatusModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setStatusModalVisible(true);
  };

  // Función para verificar si se puede iniciar el servicio (debe ser la hora correcta)
  const canStartService = (appointment: any) => {
    if (!appointment) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Minutos desde medianoche
    
    // Parsear la hora de la cita (formato HH:MM:SS)
    const [appointmentHour, appointmentMinute] = appointment.time.split(':').map(Number);
    const appointmentTime = appointmentHour * 60 + appointmentMinute;
    
    // Permitir iniciar el servicio 15 minutos antes y hasta 30 minutos después de la hora programada
    const bufferBefore = 15; // minutos antes
    const bufferAfter = 30;  // minutos después
    
    return currentTime >= (appointmentTime - bufferBefore) && 
           currentTime <= (appointmentTime + bufferAfter);
  };

  // Función para actualizar el estado de una cita
  const updateAppointmentStatus = async (newStatus: string) => {
    if (!selectedAppointment) return;

    try {
      console.log(`🔄 Actualizando cita ${selectedAppointment.id} de "${selectedAppointment.originalStatus}" a "${newStatus}"`);
      console.log(`🔍 BarberID actual: ${barberID}`);
      console.log(`📋 Datos de la cita seleccionada:`, selectedAppointment);
      
      // Verificar usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();
      console.log(`👤 Usuario autenticado:`, user?.id);
      console.log(`🔑 Email del usuario:`, user?.email);
      
      // Verificar el estado actual antes de actualizar
      const { data: currentData } = await supabase
        .from('appointments')
        .select('status')
        .eq('id', selectedAppointment.id)
        .single();
      
      console.log(`📊 Estado actual en BD antes de actualizar: ${currentData?.status}`);
      
      // Preparar los datos a actualizar
      const updateData: any = { status: newStatus };
      
      // Si el barbero cancela, agregar información adicional
      if (newStatus === 'cancelled') {
        updateData.cancelled_by = 'barber';
        updateData.cancelled_reason = 'Cancelada por barbero';
      }
      
      // Ahora que RLS está desactivado, intentar la actualización normal
      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', selectedAppointment.id)
        .select('*');

      if (error) {
        console.error('❌ Error al actualizar el estado de la cita:', error);
        Alert.alert('Error', 'No se pudo actualizar el estado de la cita. Intenta nuevamente.');
        return;
      }

      console.log('✅ Estado de cita actualizado exitosamente:', data);
      console.log(`✅ Nuevo estado confirmado: ${data?.[0]?.status}`);
      
      // Verificar el estado después de actualizar
      const { data: updatedData } = await supabase
        .from('appointments')
        .select('status')
        .eq('id', selectedAppointment.id)
        .single();
      
      console.log(`📊 Estado actual en BD después de actualizar: ${updatedData?.status}`);
      
      // Cerrar modal y limpiar selección
      setStatusModalVisible(false);
      setSelectedAppointment(null);
      
      // Recargar las citas para mostrar los cambios inmediatamente
      await fetchAppointments();
      
      // Mostrar mensaje de éxito
      const statusTexts = {
        'confirmed': 'confirmada',
        'in_progress': 'marcada como en proceso',
        'completed': 'completada',
        'cancelled': 'cancelada'
      };
      
      Alert.alert('Éxito', `La cita ha sido ${statusTexts[newStatus as keyof typeof statusTexts] || 'actualizada'} correctamente.`);
      
    } catch (error) {
      console.error('❌ Error inesperado al actualizar el estado:', error);
      Alert.alert('Error', 'Error inesperado al actualizar el estado.');
    }
  };

  // Función para cerrar el modal sin cambios
  const closeStatusModal = () => {
    setStatusModalVisible(false);
    setSelectedAppointment(null);
  };

  // Función para confirmar cancelación
  const confirmCancellation = () => {
    if (!selectedAppointment) return;
    
    Alert.alert(
      'Cancelar Cita',
      `¿Estás seguro de que quieres cancelar la cita de ${selectedAppointment.customer_name}?\n\nServicio: ${selectedAppointment.services?.name}\nFecha: ${selectedAppointment.date}\nHora: ${selectedAppointment.time}\n\nEsta acción no se puede deshacer.`,
      [
        {
          text: 'No, mantener cita',
          style: 'cancel'
        },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            updateAppointmentStatus('cancelled').catch(console.error);
          }
        }
      ]
    );
  };

  // Filtrar citas por estado (excluyendo canceladas)
  const confirmedAppointments = appointments.filter(app => app.status === 'Confirmada');
  const inProcessAppointments = appointments.filter(app => app.status === 'En Proceso');
  const completedAppointments = appointments.filter(app => app.status === 'Completada');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmada': return '#4CAF50';
      case 'Pendiente': return '#FF9800';
      case 'En Proceso': return '#2196F3';
      default: return colors.icon;
    }
  };

  // Función para obtener el texto de estado de actualización
  const getUpdateStatusText = () => {
    if (refreshing) return 'Refrescando datos...';
    if (loading && !refreshing) return 'Actualizando...';
    return `Última actualización: ${lastUpdate.toLocaleTimeString()}`;
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
        </View>
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => router.push('/admin/history')}
        >
          <IconSymbol name="doc.text" size={18} color="#D4AF37" />
          <Text style={[styles.historyButtonText, { color: colors.text }]}>Historial</Text>
        </TouchableOpacity>
        <View style={styles.updateInfo}>
          {loading && !refreshing && (
            <IconSymbol name="clock.arrow.circlepath" size={14} color="#D4AF37" />
          )}
          {!loading && (
            <IconSymbol name="clock" size={14} color={colors.icon} />
          )}
          <Text style={[styles.updateText, { color: colors.icon }]}>
            {getUpdateStatusText()}
          </Text>
        </View>
      </View>

      {/* Resumen de estadísticas */}
      <View style={[styles.statsContainer, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{confirmedAppointments.length}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Confirmadas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#2196F3' }]}>{inProcessAppointments.length}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>En Proceso</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{completedAppointments.length}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Completadas</Text>
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


        {/* Sección de citas confirmadas */}
        {confirmedAppointments.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Citas Confirmadas ({confirmedAppointments.length})
            </Text>
            {confirmedAppointments.map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                style={[styles.appointmentCard, { backgroundColor: colors.card }]}
                onPress={() => openStatusModal(appointment)}
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
                
                {/* Indicador de que se puede hacer tap */}
                <View style={styles.tapIndicator}>
                  <IconSymbol name="arrow.right.circle" size={16} color="#D4AF37" />
                  <Text style={[styles.tapText, { color: colors.icon }]}>
                    Tap para iniciar servicio
                  </Text>
                </View>
              </TouchableOpacity>
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
              <TouchableOpacity
                key={appointment.id}
                style={[styles.appointmentCard, { backgroundColor: colors.card }]}
                onPress={() => openStatusModal(appointment)}
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
                
                {/* Indicador de que se puede hacer tap */}
                <View style={styles.tapIndicator}>
                  <IconSymbol name="arrow.right.circle" size={16} color="#D4AF37" />
                  <Text style={[styles.tapText, { color: colors.icon }]}>
                    Tap para completar servicio
                  </Text>
                </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}



        {
          // Si no hay citas activas (confirmadas o en proceso)
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

      {/* Modal para cambiar estado de cita */}
      <Modal
        visible={statusModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeStatusModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Cambiar Estado de Cita
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeStatusModal}
              >
                <IconSymbol name="xmark" size={20} color={colors.icon} />
              </TouchableOpacity>
            </View>

            {selectedAppointment && (
              <>
                <View style={[styles.appointmentSummary, { backgroundColor: colors.card }]}>
                  <Text style={[styles.summaryTitle, { color: colors.text }]}>
                    {selectedAppointment.client}
                  </Text>
                  <Text style={[styles.summaryService, { color: colors.icon }]}>
                    {selectedAppointment.service}
                  </Text>
                  <Text style={[styles.summaryTime, { color: colors.icon }]}>
                    {selectedAppointment.time} - {selectedAppointment.date}
                  </Text>
                  <View style={[
                    styles.currentStatusBadge, 
                    { backgroundColor: getStatusColor(selectedAppointment.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.currentStatusText, 
                      { color: getStatusColor(selectedAppointment.status) }
                    ]}>
                      Estado actual: {selectedAppointment.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.statusOptions}>
                  <Text style={[styles.optionsTitle, { color: colors.text }]}>
                    Seleccionar nuevo estado:
                  </Text>
                  
                  {selectedAppointment.originalStatus === 'pending' && (
                    <TouchableOpacity
                      style={[styles.statusOption, { backgroundColor: '#4CAF50' + '20', borderColor: '#4CAF50' }]}
                      onPress={() => updateAppointmentStatus('confirmed')}
                    >
                      <IconSymbol name="checkmark.circle" size={20} color="#4CAF50" />
                      <Text style={[styles.statusOptionText, { color: '#4CAF50' }]}>
                        Confirmar Cita
                      </Text>
                    </TouchableOpacity>
                  )}

                  {selectedAppointment.originalStatus === 'confirmed' && (
                    <TouchableOpacity
                      style={[
                        styles.statusOption, 
                        { 
                          backgroundColor: canStartService(selectedAppointment) ? '#2196F3' + '20' : '#9E9E9E' + '20', 
                          borderColor: canStartService(selectedAppointment) ? '#2196F3' : '#9E9E9E' 
                        }
                      ]}
                      onPress={() => {
                        if (canStartService(selectedAppointment)) {
                          updateAppointmentStatus('in_progress');
                        } else {
                          Alert.alert(
                            'Horario no válido',
                            'Solo puedes iniciar el servicio durante la hora programada para la cita.',
                            [{ text: 'Entendido' }]
                          );
                        }
                      }}
                      disabled={!canStartService(selectedAppointment)}
                    >
                      <IconSymbol name="play.circle" size={20} color={canStartService(selectedAppointment) ? "#2196F3" : "#9E9E9E"} />
                      <Text style={[styles.statusOptionText, { color: canStartService(selectedAppointment) ? '#2196F3' : '#9E9E9E' }]}>
                        {canStartService(selectedAppointment) ? 'Iniciar Servicio' : 'Fuera de horario'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {selectedAppointment.originalStatus === 'in_progress' && (
                    <TouchableOpacity
                      style={[styles.statusOption, { backgroundColor: '#4CAF50' + '20', borderColor: '#4CAF50' }]}
                      onPress={() => updateAppointmentStatus('completed')}
                    >
                      <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
                      <Text style={[styles.statusOptionText, { color: '#4CAF50' }]}>
                        Completar Servicio
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Opción para cancelar cita (disponible para todos los estados excepto completed) */}
                  {selectedAppointment.originalStatus !== 'completed' && (
                    <TouchableOpacity
                      style={[styles.statusOption, styles.cancelOption, { backgroundColor: '#F44336' + '20', borderColor: '#F44336' }]}
                      onPress={confirmCancellation}
                    >
                      <IconSymbol name="xmark.circle" size={20} color="#F44336" />
                      <Text style={[styles.statusOptionText, { color: '#F44336' }]}>
                        Cancelar Cita
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  tapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 8,
  },
  tapText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Estilos para el modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 0,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  appointmentSummary: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryService: {
    fontSize: 16,
    marginBottom: 4,
  },
  summaryTime: {
    fontSize: 14,
    marginBottom: 12,
  },
  currentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  currentStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusOptions: {
    padding: 16,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  cancelOption: {
    marginTop: 8,
  },
  // Estilos para el botón de historial
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginBottom: 10,
  },
  historyButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
});