import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function BarbersManagement() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const barbers = [
    { 
      name: 'Carlos Mendoza', 
      specialties: ['Cortes Clásicos', 'Barbas'], 
      rating: 4.8,
      status: 'Activo'
    },
    { 
      name: 'Luis Rodríguez', 
      specialties: ['Cortes Modernos', 'Peinados'], 
      rating: 4.6,
      status: 'Activo'
    },
    { 
      name: 'Miguel Torres', 
      specialties: ['Cortes Clásicos'], 
      rating: 4.4,
      status: 'Inactivo'
    },
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IconSymbol
          key={i}
          name={i <= rating ? "star.fill" : "star"}
          size={12}
          color="#FFD700"
        />
      );
    }
    return stars;
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
          Gestión de Barberos
        </Text>
      </View>
      
      <ScrollView style={styles.barbersList}>
        {barbers.map((barber) => (
          <View
            key={barber.name}
            style={[
              styles.barberCard, 
              { backgroundColor: colors.card },
              barber.status === 'Inactivo' && styles.inactiveCard
            ]}
          >
            <View style={styles.barberHeader}>
              <Text style={[styles.barberName, { color: colors.text }]}>
                {barber.name}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: barber.status === 'Activo' ? '#4CAF50' : '#F44336' }
              ]}>
                <Text style={styles.statusText}>{barber.status}</Text>
              </View>
            </View>
            
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {renderStars(Math.floor(barber.rating))}
              </View>
              <Text style={[styles.ratingText, { color: colors.icon }]}>
                {barber.rating.toFixed(1)}
              </Text>
            </View>
            
            <View style={styles.specialtiesContainer}>
              {barber.specialties.map((specialty) => (
                <View key={specialty} style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
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
  barbersList: {
    flex: 1,
  },
  barberCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  barberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  barberName: {
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyTag: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 3,
  },
  specialtyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
});