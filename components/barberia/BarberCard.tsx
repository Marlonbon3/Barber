import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Barber {
  id: string;
  name: string;
  specialties?: string[];
  rating?: number;
  experience?: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
}

interface BarberCardProps {
  barber: Barber;
  onPress: () => void;
}

export function BarberCard({ barber, onPress }: BarberCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} 
      onPress={onPress}
    >
      <View style={styles.photoContainer}>
        {barber.avatar_url ? (
          <Image source={{ uri: barber.avatar_url }} style={styles.photo} />
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: colors.accent }]}>
            <IconSymbol name="person.circle" size={40} color={colors.icon} />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]}>
          {barber.name}
        </Text>
        
        <View style={styles.ratingContainer}>
          <IconSymbol name="star.fill" size={16} color="#FFD700" />
          <Text style={[styles.rating, { color: colors.text }]}>
            {barber.rating || 4.5}
          </Text>
        </View>
        
        <Text style={[styles.experience, { color: colors.icon }]}>
          {barber.experience || 'Experiencia profesional'}
        </Text>
        
        <View style={styles.specialtiesContainer}>
          {barber.specialties && Array.isArray(barber.specialties) && barber.specialties.length > 0 ? (
            <>
              {barber.specialties.slice(0, 2).map((specialty, index) => (
                <View 
                  key={index}
                  style={[styles.specialtyTag, { backgroundColor: colors.primary + '20' }]}
                >
                  <Text style={[styles.specialtyText, { color: colors.primary }]}>
                    {specialty}
                  </Text>
                </View>
              ))}
              {barber.specialties.length > 2 && (
                <Text style={[styles.moreSpecialties, { color: colors.icon }]}>
                  +{barber.specialties.length - 2} más
                </Text>
              )}
            </>
          ) : (
            <View style={[styles.specialtyTag, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.specialtyText, { color: colors.primary }]}>
                Cortes generales
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
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
  photoContainer: {
    marginRight: 16,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '600',
  },
  experience: {
    fontSize: 14,
    marginBottom: 8,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  specialtyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreSpecialties: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});