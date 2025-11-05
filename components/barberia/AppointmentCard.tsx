import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Appointment {
  id: string;
  service: string;
  barber: string;
  date: string;
  time: string;
  price: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit?: () => void;
  onCancel?: () => void;
}

export function AppointmentCard({ appointment, onEdit, onCancel }: AppointmentCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return colors.icon;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.serviceInfo}>
          <Text style={[styles.service, { color: colors.text }]}>
            {appointment.service}
          </Text>
          <Text style={[styles.barber, { color: colors.icon }]}>
            con {appointment.barber}
          </Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
            {getStatusText(appointment.status)}
          </Text>
        </View>
      </View>

      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTime}>
          <IconSymbol name="calendar" size={16} color={colors.icon} />
          <Text style={[styles.dateText, { color: colors.text }]}>
            {appointment.date}
          </Text>
        </View>
        
        <View style={styles.dateTime}>
          <IconSymbol name="clock" size={16} color={colors.icon} />
          <Text style={[styles.timeText, { color: colors.text }]}>
            {appointment.time}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.price, { color: colors.primary }]}>
          ${appointment.price}
        </Text>
        
        {appointment.status === 'confirmed' && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity 
                style={[styles.actionButton, { borderColor: colors.primary }]}
                onPress={onEdit}
              >
                <IconSymbol name="pencil" size={16} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.primary }]}>
                  Editar
                </Text>
              </TouchableOpacity>
            )}
            
            {onCancel && (
              <TouchableOpacity 
                style={[styles.actionButton, { borderColor: '#F44336' }]}
                onPress={onCancel}
              >
                <IconSymbol name="xmark" size={16} color="#F44336" />
                <Text style={[styles.actionText, { color: '#F44336' }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  service: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  barber: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});