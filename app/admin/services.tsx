import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

type Service = {
  id: number;
  name: string;
  price: string;
  duration: string;
};

export default function ServicesManagement() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const initialServices: Service[] = [
    { id: 1, name: 'Corte Clásico', price: '$15.000', duration: '30 min' },
    { id: 2, name: 'Barba Completa', price: '$12.000', duration: '25 min' },
    { id: 3, name: 'Corte + Barba', price: '$25.000', duration: '45 min' },
  ];

  const [services, setServices] = useState<Service[]>(initialServices);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');

  const openAdd = () => {
    setEditing(null);
    setName('');
    setPrice('');
    setDuration('');
    setModalVisible(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setName(s.name);
    setPrice(s.price);
    setDuration(s.duration);
    setModalVisible(true);
  };

  const saveService = () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresa el nombre del servicio.');
      return;
    }

    if (editing) {
      setServices((prev) => prev.map((p) => (p.id === editing.id ? { ...p, name, price, duration } : p)));
    } else {
      const newService: Service = {
        id: Date.now(),
        name,
        price: price || '$0',
        duration: duration || '30 min',
      };
      setServices((prev) => [newService, ...prev]);
    }

    setModalVisible(false);
  };

  const confirmDelete = (s: Service) => {
    Alert.alert('Eliminar servicio', `¿Eliminar ${s.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => setServices((prev) => prev.filter((p) => p.id !== s.id)) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <IconSymbol name="arrow.left" size={20} color="#D4AF37" />
          <Text style={[styles.backText, { color: colors.text }]}>Volver</Text>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Gestión de Servicios</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Administra los servicios de tu barbería
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: '#D4AF37' }]} 
          onPress={openAdd}
          activeOpacity={0.8}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.servicesList}>
        {services.map((service) => (
          <View
            key={service.id}
            style={[styles.serviceCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.serviceHeader}>
              <IconSymbol name="scissors" size={20} color="#D4AF37" />
              <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
            </View>

            <View style={styles.serviceDetails}>
              <View style={styles.serviceInfo}>
                <View style={styles.priceContainer}>
                  <Text style={[styles.servicePrice, { color: '#4CAF50' }]}>{service.price}</Text>
                </View>
                <View style={styles.durationContainer}>
                  <IconSymbol name="clock" size={16} color={colors.icon} />
                  <Text style={[styles.serviceDuration, { color: colors.icon }]}>{service.duration}</Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity 
                  style={[styles.iconBtn, styles.editBtn]} 
                  onPress={() => openEdit(service)}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="pencil" size={18} color="#D4AF37" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.iconBtn, styles.deleteBtn]} 
                  onPress={() => confirmDelete(service)}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="trash" size={18} color="#E53935" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{editing ? 'Editar servicio' : 'Agregar servicio'}</Text>

            <TextInput
              placeholder="Nombre del servicio"
              placeholderTextColor={colors.icon}
              value={name}
              onChangeText={setName}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              placeholder="Precio"
              placeholderTextColor={colors.icon}
              value={price}
              onChangeText={setPrice}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              placeholder="Duración"
              placeholderTextColor={colors.icon}
              value={duration}
              onChangeText={setDuration}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtnSecondary}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveService} style={styles.modalBtnPrimary}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{editing ? 'Guardar' : 'Agregar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  headerContainer: {
    marginBottom: 30,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 4,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 5,
  },
  servicesList: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    minWidth: 120,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 16,
  },
  serviceCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
    flex: 1,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  priceContainer: {
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDuration: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 12,
    marginLeft: 12,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: '#fff',
  },
  editBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  deleteBtn: {
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229, 57, 53, 0.3)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 25,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
    color: '#D4AF37',
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 16,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalBtnSecondary: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4AF37',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  modalBtnPrimary: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  modalBtnText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#D4AF37',
  },
});