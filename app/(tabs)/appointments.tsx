import { AppointmentCard } from '@/components/barberia/AppointmentCard';
import { CustomButton } from '@/components/barberia/CustomButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/utils/database';
import { router } from 'expo-router';
<<<<<<< HEAD
import { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
=======
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Appointment {
  id: string;
  service: string;
  barber: string;
  date: string;
  time: string;
  price: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}
>>>>>>> 212973aba12ee9426bf40034e18ab4bdfa568271

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
<<<<<<< HEAD
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
=======
  // Estado de citas
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      service: 'Corte Moderno',
      barber: 'Carlos Mendez',
      date: 'Viernes, 15 Nov',
      time: '2:30 PM',
      price: 35,
      status: 'confirmed' as const,
    },
    {
      id: '2',
      service: 'Corte + Barba',
      barber: 'Miguel Torres',
      date: 'Lunes, 18 Nov',
      time: '11:00 AM',
      price: 40,
      status: 'confirmed' as const,
    },
    {
      id: '3',
      service: 'Afeitado Clásico',
      barber: 'Roberto Silva',
      date: 'Miércoles, 13 Nov',
      time: '4:00 PM',
      price: 30,
      status: 'completed' as const,
    },
  ]);
>>>>>>> 212973aba12ee9426bf40034e18ab4bdfa568271

  // Estado para el modal de edición
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Días disponibles (próximos 14 días)
  const availableDates = [
    'Lunes, 11 Nov',
    'Martes, 12 Nov', 
    'Miércoles, 13 Nov',
    'Jueves, 14 Nov',
    'Viernes, 15 Nov',
    'Sábado, 16 Nov',
    'Lunes, 18 Nov',
    'Martes, 19 Nov',
    'Miércoles, 20 Nov',
    'Jueves, 21 Nov',
    'Viernes, 22 Nov',
    'Sábado, 23 Nov',
  ];

  // Horarios disponibles
  const availableTimes = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM',
  ];

  const upcomingAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const pastAppointments = appointments.filter(apt => apt.status === 'completed');

  const handleEditAppointment = (appointmentId: string) => {
<<<<<<< HEAD
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
=======
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setEditingAppointment(appointment);
      setSelectedDate(appointment.date);
      setSelectedTime(appointment.time);
      setEditModalVisible(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editingAppointment || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Por favor selecciona fecha y hora');
      return;
    }

    setAppointments(prev => prev.map(apt => 
      apt.id === editingAppointment.id 
        ? { ...apt, date: selectedDate, time: selectedTime }
        : apt
    ));

    setEditModalVisible(false);
    setEditingAppointment(null);
    setSelectedDate('');
    setSelectedTime('');
    
    Alert.alert('Éxito', 'Cita actualizada correctamente');
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingAppointment(null);
    setSelectedDate('');
    setSelectedTime('');
  };

  const confirmCancellation = (appointmentId: string) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, status: 'cancelled' as const }
        : apt
    ));
    Alert.alert('Cita Cancelada', 'Tu cita ha sido cancelada exitosamente');
  };

  const handleCancelAppointment = (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    Alert.alert(
      'Cancelar Cita',
      `¿Estás seguro que deseas cancelar tu cita de ${appointment.service} el ${appointment.date} a las ${appointment.time}?`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: () => confirmCancellation(appointmentId),
        },
      ]
    );
>>>>>>> 212973aba12ee9426bf40034e18ab4bdfa568271
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

<<<<<<< HEAD
      {/* Modal de Edición */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
=======
      {/* Modal de edición */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
>>>>>>> 212973aba12ee9426bf40034e18ab4bdfa568271
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
<<<<<<< HEAD
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
=======
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Editar Cita
            </Text>
            
            {editingAppointment && (
              <View style={styles.appointmentInfo}>
                <Text style={[styles.appointmentService, { color: colors.text }]}>
                  {editingAppointment.service}
                </Text>
                <Text style={[styles.appointmentBarber, { color: colors.icon }]}>
                  con {editingAppointment.barber}
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Selecciona una fecha
              </Text>
              <ScrollView 
                style={styles.optionsContainer}
                showsVerticalScrollIndicator={false}
              >
                {availableDates.map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.optionButton,
                      { 
                        backgroundColor: selectedDate === date ? colors.primary : colors.card,
                        borderColor: colors.border 
                      }
                    ]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[
                      styles.optionText,
                      { 
                        color: selectedDate === date ? '#fff' : colors.text 
                      }
                    ]}>
                      {date}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Selecciona una hora
              </Text>
              <View style={styles.timeGrid}>
                {availableTimes.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeButton,
                      { 
                        backgroundColor: selectedTime === time ? colors.primary : colors.card,
                        borderColor: colors.border 
                      }
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[
                      styles.timeText,
                      { 
                        color: selectedTime === time ? '#fff' : colors.text 
                      }
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
>>>>>>> 212973aba12ee9426bf40034e18ab4bdfa568271
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
<<<<<<< HEAD
                <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
=======
                <Text style={styles.cancelButtonText}>Cancelar</Text>
>>>>>>> 212973aba12ee9426bf40034e18ab4bdfa568271
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveEdit}
              >
<<<<<<< HEAD
                <ThemedText style={styles.saveButtonText}>Guardar</ThemedText>
=======
                <Text style={styles.saveButtonText}>Guardar</Text>
>>>>>>> 212973aba12ee9426bf40034e18ab4bdfa568271
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
<<<<<<< HEAD
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
=======
  // Estilos del modal
>>>>>>> 212973aba12ee9426bf40034e18ab4bdfa568271
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
<<<<<<< HEAD
    maxWidth: 400,
    padding: 24,
=======
    padding: 20,
>>>>>>> 212973aba12ee9426bf40034e18ab4bdfa568271
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalTitle: {
<<<<<<< HEAD
=======
    fontSize: 20,
    fontWeight: 'bold',
>>>>>>> 212973aba12ee9426bf40034e18ab4bdfa568271
    textAlign: 'center',
    marginBottom: 20,
  },
  appointmentInfo: {
<<<<<<< HEAD
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
=======
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 8,
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appointmentBarber: {
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
>>>>>>> 212973aba12ee9426bf40034e18ab4bdfa568271
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
<<<<<<< HEAD
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
=======
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
>>>>>>> 212973aba12ee9426bf40034e18ab4bdfa568271
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
<<<<<<< HEAD
  },
  saveButton: {
    // backgroundColor se define dinámicamente con colors.primary
=======
    marginRight: 8,
  },
  saveButton: {
    marginLeft: 8,
>>>>>>> 212973aba12ee9426bf40034e18ab4bdfa568271
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
<<<<<<< HEAD
=======
  // Estilos para los selectores
  optionsContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  optionButton: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  optionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeButton: {
    width: '30%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
>>>>>>> 212973aba12ee9426bf40034e18ab4bdfa568271
});