import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Datos simulados de citas para el dashboard
  const todayAppointments = [
    { id: 1, client: 'Juan Pérez', time: '09:00 AM', service: 'Corte Clásico', status: 'Confirmada' },
    { id: 2, client: 'María García', time: '10:30 AM', service: 'Corte + Barba', status: 'En Proceso' },
    { id: 3, client: 'Carlos López', time: '12:00 PM', service: 'Barba Completa', status: 'Pendiente' },
    { id: 4, client: 'Ana Martínez', time: '02:30 PM', service: 'Corte Clásico', status: 'Pendiente' },
    { id: 5, client: 'Luis Torres', time: '04:00 PM', service: 'Corte + Barba', status: 'Pendiente' },
  ];

  const pendingAppointments = todayAppointments.filter(apt => apt.status === 'Pendiente');
  const confirmedAppointments = todayAppointments.filter(apt => apt.status === 'Confirmada');
  const inProcessAppointments = todayAppointments.filter(apt => apt.status === 'En Proceso');

  // Función para obtener el color según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmada': return '#4CAF50';
      case 'Pendiente': return '#FF9800';
      case 'En Proceso': return '#9C27B0';
      case 'Completada': return '#2196F3';
      default: return '#757575';
    }
  };

  const menuOptions = [
    {
      title: 'Gestionar Servicios',
      subtitle: 'Agregar, editar o eliminar servicios',
      icon: 'scissors',
      route: '/admin/services',
      color: '#D4AF37',
    },
    {
      title: 'Ver Todas las Citas',
      subtitle: 'Revisar y gestionar citas programadas',
      icon: 'calendar',
      route: '/admin/appointments',
      color: '#4CAF50',
    },
    {
      title: 'Gestionar Barberos',
      subtitle: 'Administrar información del equipo',
      icon: 'person.3',
      route: '/admin/barbers',
      color: '#2196F3',
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Bienvenida */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeTitle, { color: colors.text }]}>
          Dashboard Administrativo
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.icon }]}>
          Gestiona tu barbería desde aquí
        </Text>
      </View>

      {/* Estadísticas rápidas */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <IconSymbol name="calendar" size={24} color="#4CAF50" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {todayAppointments.length}
            </Text>
            <Text style={[styles.statTitle, { color: colors.icon }]}>Citas Hoy</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <IconSymbol name="clock" size={24} color="#FF9800" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {pendingAppointments.length}
            </Text>
            <Text style={[styles.statTitle, { color: colors.icon }]}>En Espera</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <IconSymbol name="checkmark.circle" size={24} color="#2196F3" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {confirmedAppointments.length}
            </Text>
            <Text style={[styles.statTitle, { color: colors.icon }]}>Confirmadas</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <IconSymbol name="play.circle" size={24} color="#9C27B0" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {inProcessAppointments.length}
            </Text>
            <Text style={[styles.statTitle, { color: colors.icon }]}>En Proceso</Text>
          </View>
        </View>
      </View>

      {/* Sección de citas de hoy */}
      <View style={styles.todaySection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Citas de Hoy
          </Text>
          <TouchableOpacity onPress={() => router.push('/admin/appointments')}>
            <Text style={[styles.viewAllText, { color: '#D4AF37' }]}>Ver Todas</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {todayAppointments.slice(0, 4).map((appointment) => (
            <View
              key={appointment.id}
              style={[styles.appointmentCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.appointmentHeader}>
                <Text style={[styles.appointmentTime, { color: colors.text }]}>
                  {appointment.time}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(appointment.status) }
                ]}>
                  <Text style={styles.statusText}>{appointment.status}</Text>
                </View>
              </View>
              <Text style={[styles.clientName, { color: colors.text }]}>
                {appointment.client}
              </Text>
              <Text style={[styles.serviceName, { color: colors.icon }]}>
                {appointment.service}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Menú de opciones */}
      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Gestión Rápida
        </Text>
        {menuOptions.map((option) => (
          <TouchableOpacity
            key={option.title}
            style={[
              styles.menuCard,
              { backgroundColor: colors.card, shadowColor: colors.text }
            ]}
            onPress={() => router.push(option.route as any)}
          >
            <View style={[styles.menuIcon, { backgroundColor: option.color }]}>
              <IconSymbol name={option.icon as any} size={24} color="#fff" />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>
                {option.title}
              </Text>
              <Text style={[styles.menuSubtitle, { color: colors.icon }]}>
                {option.subtitle}
              </Text>
            </View>
            <IconSymbol 
              name="chevron.right" 
              size={20} 
              color={colors.icon} 
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 16,
  },
  statsSection: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  menuSubtitle: {
    fontSize: 14,
  },
  todaySection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentCard: {
    width: 200,
    padding: 15,
    borderRadius: 12,
    marginRight: 15,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  appointmentTime: {
    fontSize: 16,
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
    fontWeight: '600',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
  },
});