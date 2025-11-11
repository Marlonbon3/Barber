import { AppointmentCard } from '@/components/barberia/AppointmentCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/utils/database';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Estados para las citas completadas
  const [completedAppointments, setCompletedAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customerid, setCustomerid] = useState<string | null>(null);

  // useEffect para obtener el customerid del usuario autenticado
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCustomerid(user?.id || null);
    };
    
    getCurrentUser();
  }, []);

  // Función para cargar historial de citas completadas
  const loadCompletedAppointments = useCallback(async (isRefreshing = false) => {
    if (!customerid) {
      console.log('⏳ Esperando customerid...');
      return;
    }

    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('🔍 Cargando historial de citas completadas para el usuario:', customerid);
      
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
        .in('status', ['completed', 'cancelled']) // Citas completadas y canceladas
        .order('date', { ascending: false }) // Más recientes primero
        .order('time', { ascending: false });
      
      if (error) {
        console.error('❌ Error al cargar historial de citas:', error);
        setCompletedAppointments([]);
      } else {
        console.log('✅ Historial de citas cargado:', data);
        
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
            cancelled_by: appointment.cancelled_by,
            cancelled_reason: appointment.cancelled_reason,
          };
        }) || [];
        
        setCompletedAppointments(mappedAppointments);
      }
    } catch (error) {
      console.error('❌ Error inesperado al cargar historial:', error);
      setCompletedAppointments([]);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [customerid]);

  // Función para refresh manual
  const onRefresh = useCallback(() => {
    loadCompletedAppointments(true);
  }, [loadCompletedAppointments]);

  // useEffect para cargar el historial al iniciar
  useEffect(() => {
    loadCompletedAppointments();
  }, [loadCompletedAppointments]);

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    let ymd = dateString;
    if (dateString.includes('T')) {
      ymd = dateString.split('T')[0];
    }
    
    const [year, month, day] = ymd.split('-').map(Number);
    const date = new Date(year, month - 1, day);
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
      return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedView style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/appointments')}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            <ThemedText style={styles.backText}>Volver</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            Historial de Citas
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.loadingContainer}>
          <IconSymbol name="clock" size={48} color={colors.icon} />
          <ThemedText style={[styles.loadingText, { color: colors.icon }]}>
            Cargando historial...
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          <ThemedText style={styles.backText}>Volver</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          Historial de Citas
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
          Servicios completados y cancelados
        </ThemedText>
      </ThemedView>

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
        {completedAppointments.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="checkmark.circle" size={80} color={colors.icon} />
            <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
              Sin historial aún
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: colors.icon }]}>
              Aquí aparecerán tus servicios completados y cancelados.
              ¡Agenda tu primera cita para comenzar!
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.historyContainer}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              {completedAppointments.length} cita{completedAppointments.length === 1 ? '' : 's'} en historial
            </ThemedText>
            
            {completedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                // No se pasan onEdit ni onCancel para que no aparezcan botones de acción
              />
            ))}
          </ThemedView>
        )}

        <ThemedView style={[styles.infoContainer, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
          <ThemedText style={[styles.infoTitle, { color: colors.text }]}>
            💈 Sobre tu historial
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: colors.icon }]}>
            • Se muestran servicios completados y cancelados
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: colors.icon }]}>
            • Los más recientes aparecen primero
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: colors.icon }]}>
            • Desliza hacia abajo para actualizar
          </ThemedText>
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
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 100, // Dar espacio al botón Volver
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  historyContainer: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#D4AF37',
  },
  infoContainer: {
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    paddingLeft: 8,
  },
});