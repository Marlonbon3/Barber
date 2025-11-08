import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert } from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { supabase } from '../../utils/database';

export default function BarbersManagement() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [barbers, setBarbers] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [rating, setRating] = useState('4.5');
  const [status, setStatus] = useState('Activo');

  useEffect(() => {
    let channel: any = null;

    const fetchBarbers = async () => {
      const { data, error } = await supabase.from('barbers').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching barbers', error);
        return;
      }
      setBarbers(data ?? []);
    };

    fetchBarbers();

    try {
      channel = supabase
        .channel('public:barbers')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'barbers' }, (payload: any) => {
          const record = payload.new ?? payload.old;
          if (!record) return;
          switch (payload.eventType) {
            case 'INSERT':
              setBarbers(prev => [record, ...prev.filter(b => b.id !== record.id)]);
              break;
            case 'UPDATE':
              setBarbers(prev => prev.map(b => (b.id === record.id ? record : b)));
              break;
            case 'DELETE':
              setBarbers(prev => prev.filter(b => b.id !== record.id));
              break;
            default:
              break;
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime barbers subscription failed', e);
    }

    return () => {
      try {
        if (channel) supabase.removeChannel(channel);
      } catch {
        channel?.unsubscribe?.();
      }
    };
  }, []);

  const openAdd = () => {
    setEditing(null);
    setName('');
    setSpecialties('');
    setRating('4.5');
    setStatus('Activo');
    setModalVisible(true);
  };

  const openEdit = (b: any) => {
    setEditing(b);
    setName(b.name || '');
    setSpecialties((b.specialties || []).join?.(', ') || '');
    setRating((b.rating ?? 4.5).toString());
    setStatus(b.status || 'Activo');
    setModalVisible(true);
  };

  const saveBarber = async () => {
    if (!name.trim()) return Alert.alert('Nombre requerido');
    try {
      const payload = { name, specialties: specialties.split(',').map(s => s.trim()), rating: parseFloat(rating) || 4.5, status };
      if (editing) {
        const { error } = await supabase.from('barbers').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('barbers').insert([payload]);
        if (error) throw error;
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar');
    } finally {
      setModalVisible(false);
    }
  };

  const confirmDelete = (b: any) => {
    Alert.alert('Eliminar barbero', `¿Eliminar ${b.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          const { error } = await supabase.from('barbers').delete().eq('id', b.id);
          if (error) throw error;
        } catch (err: any) {
          Alert.alert('Error', err.message || 'No se pudo eliminar');
        }
      } }
    ]);
  };

  const renderStars = (ratingVal: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IconSymbol
          key={i}
          name={i <= ratingVal ? 'star.fill' : 'star'}
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
        <Text style={[styles.title, { color: colors.text }]}>Gestión de Barberos</Text>
        <TouchableOpacity style={[styles.addBtn]} onPress={openAdd}>
          <IconSymbol name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.barbersList}>
        {barbers.map((barber) => (
          <TouchableOpacity key={barber.id} onPress={() => openEdit(barber)} onLongPress={() => confirmDelete(barber)}>
            <View
              style={[
                styles.barberCard, 
                { backgroundColor: colors.card },
                barber.status === 'Inactivo' && styles.inactiveCard
              ]}
            >
              <View style={styles.barberHeader}>
                <Text style={[styles.barberName, { color: colors.text }]}>{barber.name}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: barber.status === 'Activo' ? '#4CAF50' : '#F44336' }
                ]}>
                  <Text style={styles.statusText}>{barber.status}</Text>
                </View>
              </View>
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>{renderStars(Math.floor(barber.rating ?? 4))}</View>
                <Text style={[styles.ratingText, { color: colors.icon }]}>{(barber.rating ?? 4).toFixed(1)}</Text>
              </View>
              <View style={styles.specialtiesContainer}>
                {(barber.specialties || []).map((specialty: string) => (
                  <View key={specialty} style={styles.specialtyTag}><Text style={styles.specialtyText}>{specialty}</Text></View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{editing ? 'Editar barbero' : 'Agregar barbero'}</Text>
            <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholderTextColor={colors.icon} />
            <TextInput placeholder="Especialidades (separadas por coma)" value={specialties} onChangeText={setSpecialties} style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholderTextColor={colors.icon} />
            <TextInput placeholder="Rating" value={rating} onChangeText={setRating} keyboardType="numeric" style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholderTextColor={colors.icon} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => setStatus('Activo')} style={[styles.statusToggle, status === 'Activo' && styles.statusActive]}><Text>Activo</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setStatus('Inactivo')} style={[styles.statusToggle, status === 'Inactivo' && styles.statusActive]}><Text>Inactivo</Text></TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtnSecondary}><Text>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveBarber} style={styles.modalBtnPrimary}><Text style={{ color: '#fff' }}>{editing ? 'Guardar' : 'Agregar'}</Text></TouchableOpacity>
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
  addBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#D4AF37',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    maxWidth: 420,
    borderRadius: 12,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#D4AF37',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  statusToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  statusActive: {
    backgroundColor: '#D4AF37',
  },
  modalBtnSecondary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4AF37',
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginRight: 8,
  },
  modalBtnPrimary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
  },
});