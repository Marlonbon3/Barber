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
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Estados para las citas desde la base de datos
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [customerid, setCustomerid] = useState<string | null>(null);
  
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
  const reloadAppointments = useCallback(async () => {
    if (!customerid) {
      console.log('⏳ Esperando customerid...');
      return;
    }

    try {
      setLoadingAppointments(true);
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
      setLoadingAppointments(false);
    }
  }, [customerid]);

  // useEffect para cargar las citas al iniciar el componente
  useEffect(() => {
    reloadAppointments();
  }, [customerid]);

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
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

  const handleCancelAppointment = async (appointmentId: string) => {
    console.log('Cancelar cita:', appointmentId);
    
    try {
      // Actualizar el status de la cita a 'cancelled'
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
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

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Mis Citas
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
          Gestiona tus reservas
        </ThemedText>
      </ThemedView>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Botón para agendar nueva cita */}
        <ThemedView style={styles.actionContainer}>
          <CustomButton
            title="Agendar Nueva Cita"
            onPress={handleScheduleNew}
            variant="primary"
            size="large"
            style={styles.scheduleButton}
          />
        </ThemedView>

        {/* Indicador de carga */}
        {loadingAppointments ? (
          <ThemedView style={styles.loadingContainer}>
            <IconSymbol name="clock" size={48} color={colors.icon} />
            <ThemedText style={[styles.loadingText, { color: colors.icon }]}>
              Cargando tus citas...
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            {/* Citas próximas */}
            {upcomingAppointments.length > 0 && (
              <ThemedView style={styles.section}>
                <View style={styles.sectionHeader}>
                  <IconSymbol name="calendar" size={24} color={colors.primary} />
                  <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Próximas Citas
                  </ThemedText>
                </View>
                
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onEdit={() => handleEditAppointment(appointment.id)}
                    onCancel={() => handleCancelAppointment(appointment.id)}
                  />
                ))}
              </ThemedView>
            )}

            {/* Historial de citas */}
            {pastAppointments.length > 0 && (
              <ThemedView style={styles.section}>
                <View style={styles.sectionHeader}>
                  <IconSymbol name="checkmark.circle.fill" size={24} color={colors.secondary} />
                  <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Historial
                  </ThemedText>
                </View>
                
                {pastAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </ThemedView>
            )}

            {/* Estado vacío */}
            {!loadingAppointments && appointments.length === 0 && (
              <ThemedView style={styles.emptyState}>
                <IconSymbol name="calendar.badge.exclamationmark" size={64} color={colors.icon} />
                <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                  No tienes citas programadas
                </ThemedText>
                <ThemedText style={[styles.emptySubtitle, { color: colors.icon }]}>
                  ¡Agenda tu primera cita y disfruta de nuestros servicios!
                </ThemedText>
                <CustomButton
                  title="Agendar Mi Primera Cita"
                  onPress={handleScheduleNew}
                  variant="primary"
                  style={styles.emptyButton}
                />
              </ThemedView>
            )}
          </>
        )}

        {/* Información adicional */}
        <ThemedView style={styles.infoContainer}>
          <ThemedText style={[styles.infoTitle, { color: colors.text }]}>
            Política de Cancelación
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: colors.icon }]}>
            • Puedes cancelar tu cita hasta 2 horas antes sin costo
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: colors.icon }]}>
            • Cancelaciones tardías pueden aplicar un cargo del 50%
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: colors.icon }]}>
            • Para reagendar, contacta directamente a la barbería
          </ThemedText>
          
          <View style={styles.contactInfo}>
            <IconSymbol name="phone.fill" size={16} color={colors.primary} />
            <Text style={[styles.contactText, { color: colors.primary }]}>
              +1 (555) 123-4567
            </Text>
          </View>
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
  scrollContent: {
    paddingBottom: 20,
  },
  actionContainer: {
    padding: 16,
  },
  scheduleButton: {
    marginBottom: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
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
    marginBottom: 8,
    lineHeight: 20,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  contactText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
});