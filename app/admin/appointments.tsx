import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function AppointmentsManagement() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const appointments = [
    { 
      id: 1,
      client: 'Juan Pérez', 
      service: 'Corte Clásico', 
      time: '09:00 AM',
      date: 'Hoy',
      status: 'Confirmada',
      phone: '+57 300 123 4567',
      barber: 'Carlos Mendoza',
      price: '$15.000'
    },
    { 
      id: 2,
      client: 'María García', 
      service: 'Corte + Barba', 
      time: '10:30 AM',
      date: 'Hoy',
      status: 'Pendiente',
      phone: '+57 301 234 5678',
      barber: 'Luis Rodríguez',
      price: '$25.000'
    },
    { 
      id: 3,
      client: 'Pedro López', 
      service: 'Barba Completa', 
      time: '12:00 PM',
      date: 'Hoy',
      status: 'En Proceso',
      phone: '+57 302 345 6789',
      barber: 'Carlos Mendoza',
      price: '$12.000'
    },
    { 
      id: 4,
      client: 'Ana Martínez', 
      service: 'Corte Clásico', 
      time: '02:30 PM',
      date: 'Hoy',
      status: 'Pendiente',
      phone: '+57 303 456 7890',
      barber: 'Miguel Torres',
      price: '$15.000'
    },
    { 
      id: 5,
      client: 'Luis Torres', 
      service: 'Corte + Barba', 
      time: '04:00 PM',
      date: 'Hoy',
      status: 'Pendiente',
      phone: '+57 304 567 8901',
      barber: 'Luis Rodríguez',
      price: '$25.000'
    },
    { 
      id: 6,
      client: 'Carlos Ruiz', 
      service: 'Corte Clásico', 
      time: '05:30 PM',
      date: 'Hoy',
      status: 'Confirmada',
      phone: '+57 305 678 9012',
      barber: 'Carlos Mendoza',
      price: '$15.000'
    },
  ];

  // Filtrar citas por estado
  const pendingAppointments = appointments.filter(apt => apt.status === 'Pendiente');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'Confirmada');
  const inProcessAppointments = appointments.filter(apt => apt.status === 'En Proceso');

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
        <Text style={[styles.title, { color: colors.text }]}>
          Gestión de Citas
        </Text>
      </View>
      
      <ScrollView style={styles.appointmentsList}>
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
});