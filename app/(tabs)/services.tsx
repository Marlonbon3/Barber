import { ServiceCard } from '@/components/barberia/ServiceCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/utils/database';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function ServicesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // useEffect para cargar servicios al iniciar el componente
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingServices(true);
        console.log('🔄 Cargando servicios desde la base de datos...');
        
        const { data, error } = await supabase
          .from('services')
          .select('id, name, price, duration');

        if (error) {
          console.error('❌ Error al cargar servicios:', error);
          setServices([]);
        } else {
          console.log('✅ Servicios cargados exitosamente:', data);
          
          const mappedServices = data?.map((service) => ({
            id: service.id,
            name: service.name || 'Servicio',
            price: service.price || 0,
            duration: service.duration || 30,
            icon: 'scissors'
          })) || [];
          
          setServices(mappedServices);
        }
      } catch (error) {
        console.error('❌ Error inesperado al cargar servicios:', error);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  const handleServicePress = (service: any) => {
    // Aquí podrías navegar a una pantalla de detalles del servicio
    // o directamente a agendar cita con ese servicio preseleccionado
    console.log('Servicio seleccionado:', service.name);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Nuestros Servicios
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
          Elige el servicio perfecto para ti
        </ThemedText>
      </ThemedView>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loadingServices ? (
          <View style={styles.loadingContainer}>
            <ThemedText style={[styles.loadingText, { color: colors.icon }]}>
              Cargando servicios disponibles...
            </ThemedText>
          </View>
        ) : services.length === 0 ? (
          <View style={styles.noDataContainer}>
            <IconSymbol name="scissors" size={48} color={colors.icon} />
            <ThemedText style={[styles.noDataText, { color: colors.icon }]}>
              No hay servicios disponibles en este momento
            </ThemedText>
          </View>
        ) : (
          <>
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onPress={() => handleServicePress(service)}
              />
            ))}
            
            <ThemedView style={styles.footer}>
              <ThemedText style={[styles.footerText, { color: colors.icon }]}>
                * Los precios pueden variar según la complejidad del servicio
              </ThemedText>
              <ThemedText style={[styles.footerText, { color: colors.icon }]}>
                * Todos nuestros servicios incluyen consulta personalizada
              </ThemedText>
            </ThemedView>
          </>
        )}
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
  footer: {
    padding: 20,
    paddingTop: 30,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});