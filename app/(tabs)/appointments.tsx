import { AppointmentCard } from '@/components/barberia/AppointmentCard';
import { CustomButton } from '@/components/barberia/CustomButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
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

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
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
        {appointments.length === 0 && (
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

      {/* Modal de edición */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
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
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
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
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  appointmentInfo: {
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
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  saveButton: {
    marginLeft: 8,
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
});