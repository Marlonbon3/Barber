import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  icon: string;
}

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
}

export function ServiceCard({ service, onPress }: ServiceCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} 
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <IconSymbol 
          name={service.icon as any} 
          size={32} 
          color={colors.primary} 
        />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {service.name}
        </Text>
        <Text style={[styles.description, { color: colors.icon }]}>
          {service.description}
        </Text>
        
        <View style={styles.details}>
          <Text style={[styles.price, { color: colors.primary }]}>
            ${service.price}
          </Text>
          <View style={styles.durationContainer}>
            <IconSymbol name="clock" size={16} color={colors.icon} />
            <Text style={[styles.duration, { color: colors.icon }]}>
              {service.duration}
            </Text>
          </View>
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
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 14,
    marginLeft: 4,
  },
});