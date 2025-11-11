import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../components/auth/AuthContext';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { supabase } from '../../utils/database';

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  owner_id: string;
};

export default function ServicesManagement() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [durationPickerVisible, setDurationPickerVisible] = useState(false);

  // Opciones de duración predefinidas (en minutos)
  const durationOptions = [
    { label: '15 minutos', value: 15 },
    { label: '30 minutos', value: 30 },
    { label: '45 minutos', value: 45 },
    { label: '1 hora', value: 60 },
    { label: '1 hora 15 min', value: 75 },
    { label: '1 hora 30 min', value: 90 },
    { label: '1 hora 45 min', value: 105 },
    { label: '2 horas', value: 120 },
    { label: '2 horas 30 min', value: 150 },
    { label: '3 horas', value: 180 },
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading services:', error);
        Alert.alert('Error', 'No se pudieron cargar los servicios');
        return;
      }

      const mappedServices: Service[] = data?.map(service => ({
        id: String(service.id),
        name: service.name || '',
        price: service.price || 0,
        duration: service.duration || 30,
        owner_id: service.owner_id || '',
      })) || [];

      setServices(mappedServices);
    } catch (error) {
      console.error('Error loading services:', error);
      Alert.alert('Error', 'Error inesperado al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear la duración para mostrar
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutos`;
    } else if (minutes === 60) {
      return '1 hora';
    } else if (minutes % 60 === 0) {
      return `${minutes / 60} horas`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours} hora${hours > 1 ? 's' : ''} ${mins} min`;
    }
  };

  const openAdd = () => {
    setEditing(null);
    setName('');
    setPrice('');
    setDuration('30'); // Duración por defecto de 30 minutos
    setModalVisible(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setName(s.name);
    setPrice(String(s.price));
    setDuration(String(s.duration));
    setModalVisible(true);
  };

  const selectDuration = (durationValue: number) => {
    setDuration(String(durationValue));
    setDurationPickerVisible(false);
  };

  const saveService = async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresa el nombre del servicio.');
      return;
    }

    const priceNum = Number.parseFloat(price) || 0;
    const durationNum = Number.parseInt(duration, 10) || 30;

    try {
      if (editing) {
        // Actualizar servicio existente
        const { error } = await supabase
          .from('services')
          .update({
            name: name.trim(),
            price: priceNum,
            duration: durationNum,
          })
          .eq('id', editing.id);

        if (error) {
          console.error('Error updating service:', error);
          Alert.alert('Error', 'No se pudo actualizar el servicio');
          return;
        }
      } else {
        // Crear nuevo servicio
        const { error } = await supabase
          .from('services')
          .insert([{
            name: name.trim(),
            price: priceNum,
            duration: durationNum,
            owner_id: user?.id || null,
          }]);

        if (error) {
          console.error('Error creating service:', error);
          Alert.alert('Error', 'No se pudo crear el servicio');
          return;
        }
      }

      await loadServices();
      setModalVisible(false);
      Alert.alert('Éxito', editing ? 'Servicio actualizado correctamente' : 'Servicio creado correctamente');
    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert('Error', 'Error inesperado al guardar el servicio');
    }
  };

  const confirmDelete = (s: Service) => {
    Alert.alert('Eliminar servicio', `¿Eliminar ${s.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Eliminar', 
        style: 'destructive', 
        onPress: () => {
          deleteService(s.id).catch(console.error);
        }
      },
    ]);
  };

  const deleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        console.error('Error deleting service:', error);
        Alert.alert('Error', 'No se pudo eliminar el servicio');
        return;
      }

      await loadServices();
      Alert.alert('Éxito', 'Servicio eliminado correctamente');
    } catch (error) {
      console.error('Error deleting service:', error);
      Alert.alert('Error', 'Error inesperado al eliminar el servicio');
    }
  };

  if (loading) {
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
        </View>

        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.icon }]}>
            Cargando servicios...
          </Text>
        </View>
      </View>
    );
  }

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
        {services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="scissors" size={48} color={colors.icon} />
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              No hay servicios registrados
            </Text>
          </View>
        ) : (
          services.map((service) => (
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
                    <Text style={[styles.servicePrice, { color: '#4CAF50' }]}>
                      ${service.price.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.durationContainer}>
                    <IconSymbol name="clock" size={16} color={colors.icon} />
                    <Text style={[styles.serviceDuration, { color: colors.icon }]}>
                      {service.duration} min
                    </Text>
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
          ))
        )}
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
            <TouchableOpacity
              style={[styles.durationButton, { borderColor: colors.border }]}
              onPress={() => setDurationPickerVisible(true)}
            >
              <Text style={[styles.durationButtonText, { color: colors.text }]}>
                {duration ? formatDuration(Number.parseInt(duration, 10)) : 'Seleccionar duración'}
              </Text>
              <IconSymbol name="chevron.right" size={16} color={colors.icon} />
            </TouchableOpacity>

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

      {/* Modal del Picker de Duración */}
      <Modal visible={durationPickerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerModalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.pickerModalTitle, { color: colors.text }]}>Seleccionar Duración</Text>
            
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {durationOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    { 
                      backgroundColor: Number.parseInt(duration, 10) === option.value 
                        ? 'rgba(212, 175, 55, 0.2)' 
                        : 'transparent',
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => selectDuration(option.value)}
                >
                  <Text style={[
                    styles.optionText, 
                    { 
                      color: Number.parseInt(duration, 10) === option.value 
                        ? '#D4AF37' 
                        : colors.text 
                    }
                  ]}>
                    {option.label}
                  </Text>
                  {Number.parseInt(duration, 10) === option.value && (
                    <IconSymbol name="checkmark.circle.fill" size={20} color="#D4AF37" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              onPress={() => setDurationPickerVisible(false)} 
              style={[styles.closePickerButton, { backgroundColor: colors.border }]}
            >
              <Text style={[styles.closePickerText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
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
    borderColor: '#D4AF37',
    backgroundColor: '#000000',
    color: '#D4AF37',
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
  // Estilos para el botón de duración
  durationButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    backgroundColor: '#000000',
    borderColor: '#D4AF37',
  },
  durationButtonText: {
    fontSize: 16,
    color: '#D4AF37',
  },
  // Estilos para el modal del picker
  pickerModalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 25,
    maxHeight: '80%',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  pickerModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#D4AF37',
  },
  optionsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  closePickerButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  closePickerText: {
    fontSize: 16,
    fontWeight: '600',
  },
});