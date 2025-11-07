import { AppointmentCard } from '@/components/barberia/AppointmentCard';
import { CustomButton } from '@/components/barberia/CustomButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Estado simulado de citas
  const [appointments] = useState([
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

  const upcomingAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const pastAppointments = appointments.filter(apt => apt.status === 'completed');

  const handleEditAppointment = (appointmentId: string) => {
    console.log('Editar cita:', appointmentId);
    // Aquí iría la lógica para editar la cita
  };

  const handleCancelAppointment = (appointmentId: string) => {
    console.log('Cancelar cita:', appointmentId);
    // Aquí iría la lógica para cancelar la cita
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
});