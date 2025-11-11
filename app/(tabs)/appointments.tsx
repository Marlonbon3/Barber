
import { AppointmentCard } from '@/components/barberia/AppointmentCard';
import { CustomButton } from '@/components/barberia/CustomButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/utils/database';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Appointment {
  id: string;
  service: string;
  barber: string;
  date: string;
  time: string;
  price: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Estados para las citas desde la base de datos
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [customerid, setCustomerid] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para el modal de edición
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [editingNotes, setEditingNotes] = useState('');

  // useEffect para obtener el customerid del usuario autenticado
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCustomerid(user?.id || null);
    };
    
    getCurrentUser();
  }, []);

  // Función reutilizable para cargar citas
  const reloadAppointments = useCallback(async (isRefreshing = false) => {
    if (!customerid) {
      console.log('⏳ Esperando customerid...');
      return;
    }

    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoadingAppointments(true);
      }
      console.log('🔍 Cargando citas desde la base de datos para el usuario:', customerid);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            id,
            name
          ),
          profiles!fk_barber (
            id,
            first_name,
            last_name
          )
        `)
        .eq('user_id', customerid)
        .eq('status', 'confirmed') // Solo citas confirmadas en "Mis Citas"
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      
      if (error) {
        console.error('❌ Error al cargar citas:', error);
        setAppointments([]);
      } else {
        console.log('✅ Citas cargadas:', data);
        const mappedAppointments = data?.map(appointment => {
          return {
            id: appointment.id,
            service: appointment.services?.name || 'Servicio',
            barber: appointment.profiles?.first_name || 'Barbero',
            date: formatDate(appointment.date),
            time: appointment.time,
            price: appointment.price || 0,
            status: appointment.status,
            customer_name: appointment.customer_name,
            customer_phone: appointment.customer_phone,
            notes: appointment.notes,
          };
        }) || [];
        
        setAppointments(mappedAppointments);
      }
    } catch (error) {
      console.error('❌ Error inesperado al cargar citas:', error);
      setAppointments([]);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoadingAppointments(false);
      }
    }
  }, [customerid]);

  // Función para refresh manual
  const onRefresh = useCallback(() => {
    reloadAppointments(true);
  }, [reloadAppointments]);

  // useEffect para cargar las citas al iniciar el componente
  useEffect(() => {
    reloadAppointments();
  }, [reloadAppointments]);

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    // Normalizar casos donde la fecha viene como 'YYYY-MM-DD' o 'YYYY-MM-DDTHH:MM:SSZ'
    // Para evitar errores por timezone (new Date('YYYY-MM-DD') interpreta como UTC) parseamos la parte YYYY-MM-DD
    let ymd = dateString;
    if (!ymd) return '';
    if (ymd.includes('T')) {
      ymd = ymd.split('T')[0];
    }

    const parts = ymd.split('-');
    if (parts.length !== 3) {
      // fallback: intentar construir con Date directamente
      const fallback = new Date(dateString);
      return fallback.toDateString() === new Date().toDateString() ? 'Hoy' : fallback.toDateString();
    }

    const year = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10) - 1; // month index 0-based
    const day = Number.parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
    }
  };

  const upcomingAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const pastAppointments = appointments.filter(apt => apt.status === 'completed');

  const handleEditAppointment = (appointmentId: string) => {
    console.log('Editar cita:', appointmentId);
    
    // Encontrar la cita a editar
    const appointmentToEdit = appointments.find(apt => apt.id === appointmentId);
    if (appointmentToEdit) {
      setEditingAppointment(appointmentToEdit);
      setEditingNotes(appointmentToEdit.notes || '');
      setEditModalVisible(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingAppointment) return;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          notes: editingNotes,
        })
        .eq('id', editingAppointment.id)
        .eq('user_id', customerid);
      
      if (error) {
        console.error('❌ Error al actualizar la cita:', error);
        Alert.alert('Error', 'No se pudo actualizar la cita. Intenta nuevamente.');
        return;
      }
      
      console.log('✅ Cita actualizada exitosamente');
      Alert.alert('Éxito', 'Cita actualizada exitosamente');
      
      // Cerrar modal y limpiar estados
      setEditModalVisible(false);
      setEditingAppointment(null);
      setEditingNotes('');
      
      // Recargar las citas
      await reloadAppointments();
      
    } catch (error) {
      console.error('❌ Error inesperado al actualizar la cita:', error);
      Alert.alert('Error', 'Error inesperado. Intenta nuevamente.');
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingAppointment(null);
    setEditingNotes('');
  };

  const confirmCancelAppointment = (appointment: any) => {
    Alert.alert(
      'Cancelar Cita',
      `¿Estás seguro de que quieres cancelar tu cita?\n\nServicio: ${appointment.services?.name}\nBarbero: ${appointment.profiles?.first_name} ${appointment.profiles?.last_name}\nFecha: ${appointment.date}\nHora: ${appointment.time}\nPrecio: $${appointment.price}\n\nEsta acción no se puede deshacer.`,
      [
        {
          text: 'No, mantener cita',
          style: 'cancel'
        },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => handleCancelAppointment(appointment.id)
        }
      ]
    );
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    console.log('Cancelar cita:', appointmentId);
    
    try {
      // Actualizar el status de la cita a 'cancelled' con información de cancelación por usuario
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          cancelled_by: 'user',
          cancelled_reason: 'Cancelada por usuario'
        })
        .eq('id', appointmentId)
        .eq('user_id', customerid); // Asegurar que solo el usuario pueda cancelar sus citas
      
      if (error) {
        console.error('❌ Error al cancelar la cita:', error);
        Alert.alert('Error', 'No se pudo cancelar la cita. Intenta nuevamente.');
        return;
      }
      
      console.log('✅ Cita cancelada exitosamente');
      Alert.alert('Éxito', 'Cita cancelada exitosamente');
      
      // Recargar las citas para mostrar los cambios
      await reloadAppointments();
      
    } catch (error) {
      console.error('❌ Error inesperado al cancelar la cita:', error);
      Alert.alert('Error', 'Error inesperado. Intenta nuevamente.');
    }
  };

  const handleScheduleNew = () => {
    // Navegar a la pantalla de agendar cita usando push
    router.push('/explore');
  };

  const handleViewHistory = () => {
    // Navegar a la pantalla de historial
    router.push('/history');
  };

  if (loadingAppointments) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <IconSymbol name="clock" size={48} color={colors.icon} />
          <ThemedText style={[styles.loadingText, { color: colors.icon }]}>
            Cargando tus citas...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#D4AF37']}
            tintColor="#D4AF37"
          />
        }
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Mis Citas
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            Gestiona tus citas agendadas
          </ThemedText>
        </ThemedView>

        {appointments.length === 0 ? (
          <>
            <ThemedView style={styles.emptyContainer}>
              <IconSymbol name="calendar.badge.clock" size={80} color={colors.icon} />
              <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
                No tienes citas agendadas
              </ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: colors.icon }]}>
                ¡Agenda tu primera cita y disfruta de nuestros servicios!
              </ThemedText>
            </ThemedView>
            
            <View style={styles.buttonContainer}>
              <CustomButton
                title="Agendar Cita"
                onPress={handleScheduleNew}
                size="large"
              />
              <CustomButton
                title="Historial de Citas"
                onPress={handleViewHistory}
                variant="outline"
                size="large"
              />
            </View>
          </>
        ) : (
          <>
            {upcomingAppointments.length > 0 && (
              <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Próximas Citas
                </ThemedText>
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onEdit={() => handleEditAppointment(appointment.id)}
                    onCancel={() => confirmCancelAppointment(appointment)}
                  />
                ))}
              </ThemedView>
            )}

            {pastAppointments.length > 0 && (
              <ThemedView style={styles.section}>
                {pastAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onEdit={() => handleEditAppointment(appointment.id)}
                    onCancel={() => confirmCancelAppointment(appointment)}
                  />
                ))}
              </ThemedView>
            )}

            <View style={styles.buttonContainer}>
              <CustomButton
                title="Agendar Cita"
                onPress={handleScheduleNew}
                size="large"
                style={styles.primaryButton}
              />
              <CustomButton
                title="Historial de Citas"
                onPress={handleViewHistory}
                variant="outline"
                size="large"
                style={styles.historyButton}
              />
            </View>
          </>
        )}

        <ThemedView style={[styles.infoContainer, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
          <ThemedText style={[styles.infoTitle, { color: colors.text }]}>
            Información Importante
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: colors.icon }]}>
            • Puedes cancelar tu cita hasta 2 horas antes sin costo
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: colors.icon }]}>
            • Cancelaciones tardías pueden aplicar un cargo del 50%
          </ThemedText>
        </ThemedView>
      </ScrollView>

      {/* Modal de Edición */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Editar Cita
            </ThemedText>
            
            {editingAppointment && (
              <View style={styles.appointmentInfo}>
                <ThemedText style={styles.infoLabel}>Servicio: {editingAppointment.service}</ThemedText>
                <ThemedText style={styles.infoLabel}>Barbero: {editingAppointment.barber}</ThemedText>
                <ThemedText style={styles.infoLabel}>Fecha: {editingAppointment.date}</ThemedText>
                <ThemedText style={styles.infoLabel}>Hora: {editingAppointment.time}</ThemedText>
              </View>
            )}
            
            <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
              Notas adicionales:
            </ThemedText>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.background, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={editingNotes}
              onChangeText={setEditingNotes}
              placeholder="Agregar notas especiales..."
              placeholderTextColor={colors.icon}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveEdit}
              >
                <ThemedText style={styles.saveButtonText}>Guardar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    paddingLeft: 4,
  },
  newAppointmentButton: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    marginTop: 8,
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  // Estilos para el modal de edición
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  appointmentInfo: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    // backgroundColor se define dinámicamente con colors.primary
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    flex: 1,
  },
  primaryButton: {
    // Usar tamaño por defecto del CustomButton
  },
  historyButton: {
    // Usar tamaño por defecto del CustomButton
  },
  secondaryButton: {
    // Se mantiene el estilo outline del CustomButton
  },
});