import { ServiceCard } from '@/components/barberia/ServiceCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScrollView, StyleSheet } from 'react-native';

export default function ServicesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const services = [
    {
      id: '1',
      name: 'Corte Clásico',
      description: 'Corte tradicional con tijera y máquina, incluye lavado y secado',
      price: 25,
      duration: 45,
      icon: 'scissors',
    },
    {
      id: '2',
      name: 'Corte Moderno',
      description: 'Cortes modernos y actuales según las últimas tendencias',
      price: 35,
      duration: 60,
      icon: 'star.fill',
    },
    {
      id: '3',
      name: 'Arreglo de Barba',
      description: 'Recorte, perfilado y arreglo completo de barba con aceites',
      price: 20,
      duration: 30,
      icon: 'face.smiling',
    },
    {
      id: '4',
      name: 'Corte + Barba',
      description: 'Paquete completo: corte de cabello y arreglo de barba',
      price: 40,
      duration: 75,
      icon: 'crown.fill',
    },
    {
      id: '5',
      name: 'Afeitado Clásico',
      description: 'Afeitado tradicional con navaja, toallas calientes y aftershave',
      price: 30,
      duration: 45,
      icon: 'rectangle.and.pencil.and.ellipsis',
    },
    {
      id: '6',
      name: 'Tratamiento Capilar',
      description: 'Lavado profundo, masaje y tratamiento nutritivo para el cabello',
      price: 45,
      duration: 60,
      icon: 'drop.fill',
    },
    {
      id: '7',
      name: 'Corte Infantil',
      description: 'Corte especial para niños menores de 12 años',
      price: 18,
      duration: 30,
      icon: 'figure.child',
    },
    {
      id: '8',
      name: 'Evento Especial',
      description: 'Peinado y arreglo completo para ocasiones especiales',
      price: 60,
      duration: 90,
      icon: 'sparkles',
    },
  ];

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
});