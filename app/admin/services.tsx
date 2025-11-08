import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { supabase } from '../../utils/database';

type Service = {
  id: number;  // PostgreSQL uses int8 for the service id
  name: string;
  price: string;
  duration: string;
  owner_id?: string | null;  // UUID from auth.users.id
};

export default function ServicesManagement() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [services, setServices] = useState<Service[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setName('');
    setPrice('');
    setDuration('');
    setModalVisible(true);
  };

  // Fetch services from Supabase and subscribe realtime changes
  useEffect(() => {
    let channel: any = null;

    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching services', error);
        return;
      }
      // normalize price/duration for display and keep id as number
      const normalized = (data ?? []).map((d: any) => ({
        ...d,
        id: Number(d.id),
        price: d?.price != null ? String(d.price) : '$0',
        duration: d?.duration != null ? String(d.duration) : '30 min',
      }));
      setServices(normalized);
    };

    fetchServices();

    try {
      channel = supabase
        .channel('public:services')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, (payload: any) => {
          const raw = payload.new ?? payload.old;
          if (!raw) return;
          const record = {
            ...raw,
            id: Number(raw.id),
            price: raw?.price != null ? String(raw.price) : '$0',
            duration: raw?.duration != null ? String(raw.duration) : '30 min',
          };

          switch (payload.eventType) {
            case 'INSERT':
              setServices(prev => [record, ...prev.filter(s => s.id !== record.id)]);
              break;
            case 'UPDATE':
              setServices(prev => prev.map(s => (s.id === record.id ? record : s)));
              break;
            case 'DELETE':
              setServices(prev => prev.filter(s => s.id !== record.id));
              break;
            default:
              break;
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription failed', e);
    }

    return () => {
      try {
        if (channel) supabase.removeChannel(channel);
      } catch {
        try {
          channel?.unsubscribe?.();
        } catch {}
      }
    };
  }, []);

  const openEdit = (s: Service) => {
    setEditing(s);
    setName(s.name);
    // strip any leading $ when showing in input
    setPrice(String(s.price ?? '').replace(/^\$/,''));
    // if duration starts with a number, show only numeric portion for easier editing
    const dur = String(s.duration ?? '');
    const durNum = dur.match(/^(\d+)/);
    setDuration(durNum ? durNum[1] : dur);
    setModalVisible(true);
  };

  const saveService = () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresa el nombre del servicio.');
      return;
    }

    if (!price || isNaN(Number(price))) {
      Alert.alert('Precio inválido', 'Por favor ingresa un precio válido.');
      return;
    }

    if (!duration || isNaN(Number(duration))) {
      Alert.alert('Duración inválida', 'Por favor ingresa una duración válida en minutos.');
      return;
    }

    setIsSaving(true);

    (async () => {
      try {
        if (editing) {
          // Obtener el usuario actual para verificar permisos
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) {
            Alert.alert('Error', 'No se pudo verificar tu sesión. Por favor, inicia sesión nuevamente.');
            return;
          }

          const res = await supabase
            .from('services')
            .update({ 
              name, 
              price: price || '$0', 
              duration: duration ? (/\d+/.test(duration) ? `${duration} min` : duration) : '30 min'
            })
            .match({ 
              id: editing.id,
              owner_id: user.id // Asegurarnos que solo editamos si somos dueños
            })
            .select('*');

          if (res.error) {
            console.error('Supabase update error', res.error);
            Alert.alert('Error al actualizar', JSON.stringify(res.error, null, 2));
            return;
          }
          // optimistic update: update local list immediately so user sees changes
          if (!res.error && res.data && res.data[0]) {
            const updated = res.data[0];
            setServices(prev => prev.map(s => (s.id === updated.id ? {
              ...s,
              ...updated,
              price: updated.price != null ? String(updated.price) : '$0',
              duration: updated.duration != null ? String(updated.duration) : '30 min',
            } : s)));
          }
          setModalVisible(false);
        } else {
          // Obtener el usuario actual
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) {
            Alert.alert('Error', 'No se pudo verificar tu sesión. Por favor, inicia sesión nuevamente.');
            return;
          }

          // Crear el servicio con el owner_id del usuario actual
          const payload = {
            name,
            price: price || '$0',
            duration: duration ? (/(\d+)/.test(duration) ? `${duration} min` : duration) : '30 min',
            owner_id: user.id
          };

          console.log('Creando servicio con:', payload); // Para debug

          const res = await supabase
            .from('services')
            .insert([payload])
            .select('*');

          if (res.error) {
            console.error('Supabase insert error', res.error);
            Alert.alert('Error al crear', JSON.stringify(res.error, null, 2));
            return;
          }

          // éxito: update local list immediately using returned row (avoids having to navigate out)
          if (!res.error && res.data && res.data[0]) {
            const inserted = res.data[0];
            const row = { ...inserted, price: inserted.price != null ? String(inserted.price) : '$0', duration: inserted.duration != null ? String(inserted.duration) : '30 min' };
            setServices(prev => [row, ...prev.filter((s) => s.id !== row.id)]);
          }
          setModalVisible(false);
        }
      } catch (err: any) {
        console.error('Unexpected error saving service', err);
        Alert.alert('Error', err?.message || JSON.stringify(err));
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const confirmDelete = (s: Service) => {
    Alert.alert('Eliminar servicio', `¿Eliminar ${s.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
            try {
              // Primero verificar si hay citas asociadas
              const { data: appointments, error: appointmentsError } = await supabase
                .from('appointments')
                .select('id')
                .eq('service_id', s.id)
                .limit(1);

              if (appointmentsError) {
                console.error('Error checking appointments:', appointmentsError);
                Alert.alert('Error', 'No se pudo verificar si hay citas asociadas');
                return;
              }

              if (appointments && appointments.length > 0) {
                Alert.alert(
                  'No se puede eliminar',
                  'Este servicio tiene citas asociadas. Elimine primero las citas.'
                );
                return;
              }

              // Obtener el usuario actual para verificar permisos
              const { data: { user }, error: userError } = await supabase.auth.getUser();
              if (userError || !user) {
                Alert.alert('Error', 'No se pudo verificar tu sesión. Por favor, inicia sesión nuevamente.');
                return;
              }

              // Debug: mostrar información del servicio y usuario
              console.log('Intentando eliminar servicio:', {
                service_id: s.id,
                service_owner: s.owner_id,
                current_user: user.id
              });

              // Si no hay citas, procedemos a eliminar
              const res = await supabase
                .from('services')
                .delete()
                .match({ 
                  id: s.id,
                  owner_id: user.id // Asegurarnos que solo eliminamos si somos dueños
                })
                .select('*');

              if (res.error) {
                console.error('Error al eliminar:', res.error);
                Alert.alert('Error al eliminar', 
                  `No tienes permiso para eliminar este servicio.\nDueño: ${s.owner_id}\nUsuario actual: ${user.id}`
                );
                return;
              }

              if (!res.data || res.data.length === 0) {
                Alert.alert('Error', 
                  `No se pudo eliminar el servicio.\nDueño del servicio: ${s.owner_id}\nTu usuario: ${user.id}`
                );
                return;
              }

              // Eliminación exitosa
              setServices(prev => prev.filter(item => item.id !== s.id));
              Alert.alert('Éxito', 'Servicio eliminado correctamente');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'No se pudo eliminar');
          }
        }
      },
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
                  <Text style={[styles.servicePrice, { color: '#4CAF50' }]}>{String(service.price).startsWith('$') ? service.price : `$${service.price}`}</Text>
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
              onChangeText={(t) => setPrice(t.replace(/[^0-9.]/g, ''))}
              keyboardType="numeric"
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              placeholder="Duración (minutos)"
              placeholderTextColor={colors.icon}
              value={duration}
              onChangeText={(t) => setDuration(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtnSecondary}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveService} style={[styles.modalBtnPrimary, isSaving && { opacity: 0.6 }]} disabled={isSaving}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{isSaving ? 'Guardando...' : (editing ? 'Guardar' : 'Agregar')}</Text>
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