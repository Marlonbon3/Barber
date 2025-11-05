import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CustomButton } from '@/components/barberia/CustomButton';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const quickActions = [
    {
      title: 'Agendar Cita',
      subtitle: 'Reserva tu próxima cita',
      icon: 'calendar.badge.plus',
      onPress: () => router.push('/(tabs)/explore'),
      color: colors.primary,
    },
    {
      title: 'Ver Servicios',
      subtitle: 'Explora nuestros servicios',
      icon: 'scissors',
      onPress: () => router.push('/(tabs)/services'),
      color: colors.secondary,
    },
    {
      title: 'Mis Citas',
      subtitle: 'Gestiona tus reservas',
      icon: 'list.bullet',
      onPress: () => router.push('/(tabs)/appointments'),
      color: colors.primary,
    },
  ];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: colors.background, dark: colors.background }}
      headerImage={
        <View style={[styles.heroContainer, { backgroundColor: colors.primary }]}>
          <IconSymbol
            size={80}
            name="scissors"
            color={colorScheme === 'dark' ? colors.background : '#2C1810'}
          />
          <Text style={[styles.heroTitle, { color: colorScheme === 'dark' ? colors.background : '#2C1810' }]}>
            Barberhub
          </Text>
          <Text style={[styles.heroSubtitle, { color: colorScheme === 'dark' ? colors.background : '#2C1810' }]}>
            Estilo y tradición desde 1985
          </Text>
        </View>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Bienvenido</ThemedText>
        <HelloWave />
      </ThemedView>
      
      <ThemedView style={styles.welcomeContainer}>
        <ThemedText style={styles.welcomeText}>
          Descubre la experiencia única de nuestra barbería. Ofrecemos servicios de corte de cabello, 
          arreglo de barba y cuidado personal con más de 35 años de experiencia.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.hoursContainer}>
        <ThemedText type="subtitle" style={styles.hoursTitle}>
          Horarios de Atención
        </ThemedText>
        <View style={styles.hoursGrid}>
          <View style={styles.hoursRow}>
            <ThemedText style={styles.dayText}>Lunes - Viernes</ThemedText>
            <ThemedText style={[styles.timeText, { color: colors.primary }]}>9:00 AM - 7:00 PM</ThemedText>
          </View>
          <View style={styles.hoursRow}>
            <ThemedText style={styles.dayText}>Sábados</ThemedText>
            <ThemedText style={[styles.timeText, { color: colors.primary }]}>8:00 AM - 6:00 PM</ThemedText>
          </View>
          <View style={styles.hoursRow}>
            <ThemedText style={styles.dayText}>Domingos</ThemedText>
            <ThemedText style={[styles.timeText, { color: colors.secondary }]}>Cerrado</ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.actionsContainer}>
        <ThemedText type="subtitle" style={styles.actionsTitle}>
          Acciones Rápidas
        </ThemedText>
        
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={action.onPress}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
              <IconSymbol name={action.icon as any} size={24} color={action.color} />
            </View>
            
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>
                {action.title}
              </Text>
              <Text style={[styles.actionSubtitle, { color: colors.icon }]}>
                {action.subtitle}
              </Text>
            </View>
            
            <IconSymbol name="chevron.right" size={20} color={colors.icon} />
          </TouchableOpacity>
        ))}
      </ThemedView>

      <ThemedView style={styles.contactContainer}>
        <ThemedText type="subtitle" style={styles.contactTitle}>
          Contacto
        </ThemedText>
        
        <View style={styles.contactInfo}>
          <View style={styles.contactRow}>
            <IconSymbol name="phone.fill" size={20} color={colors.primary} />
            <ThemedText style={styles.contactText}>+1 (555) 123-4567</ThemedText>
          </View>
          
          <View style={styles.contactRow}>
            <IconSymbol name="location.fill" size={20} color={colors.primary} />
            <ThemedText style={styles.contactText}>123 Calle Principal, Ciudad</ThemedText>
          </View>
          
          <View style={styles.contactRow}>
            <IconSymbol name="envelope.fill" size={20} color={colors.primary} />
            <ThemedText style={styles.contactText}>info@barberiaelite.com</ThemedText>
          </View>
        </View>
        
        <CustomButton
          title="Llamar Ahora"
          onPress={() => {}}
          variant="outline"
          style={styles.callButton}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  welcomeContainer: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  hoursContainer: {
    marginBottom: 24,
  },
  hoursTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  hoursGrid: {
    gap: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionsTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
  },
  contactContainer: {
    marginBottom: 24,
  },
  contactTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  contactInfo: {
    gap: 12,
    marginBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 16,
  },
  callButton: {
    marginTop: 8,
  },
});