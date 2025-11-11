import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { supabase } from '../../utils/database';

interface Barber {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  specialties: string[];
  rating: number;
  experience: string;
  status: 'active' | 'inactive';
  avatar_url: string | null;
}

export default function BarbersManagement() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Barber | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [specialtiesText, setSpecialtiesText] = useState('');

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'barber');

      if (error) {
        console.error('Error loading barbers:', error);
        Alert.alert('Error', 'No se pudieron cargar los barberos');
        return;
      }

      const mappedBarbers: Barber[] = data?.map(barber => ({
        id: barber.id,
        first_name: barber.first_name || '',
        last_name: barber.last_name || '',
        email: barber.email || '',
        phone: barber.phone || null,
        specialties: barber.specialties || ['Cortes generales'],
        rating: barber.rating || 4.5,
        experience: barber.experience || 'Experiencia profesional',
        status: barber.status || 'active',
        avatar_url: barber.avatar_url || null,
      })) || [];

      setBarbers(mappedBarbers);
    } catch (error) {
      console.error('Error loading barbers:', error);
      Alert.alert('Error', 'Error inesperado al cargar barberos');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setExperience('');
    setSpecialtiesText('');
    setModalVisible(true);
  };

  const openEdit = (barber: Barber) => {
    setEditing(barber);
    setFirstName(barber.first_name);
    setLastName(barber.last_name);
    setEmail(barber.email);
    setPhone(barber.phone || '');
    setExperience(barber.experience);
    setSpecialtiesText(barber.specialties.join(', '));
    setModalVisible(true);
  };

  const saveBarber = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    const specialtiesArray = specialtiesText.split(',').map(s => s.trim()).filter(s => s.length > 0);

    try {
      if (editing) {
        // Actualizar barbero existente
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
            experience: experience || 'Experiencia profesional',
            specialties: specialtiesArray.length > 0 ? specialtiesArray : ['Cortes generales']
          })
          .eq('id', editing.id);

        if (error) {
          console.error('Error updating barber:', error);
          Alert.alert('Error', 'No se pudo actualizar el barbero');
          return;
        }
      } else {
        // Crear nuevo barbero (requiere crear usuario primero)
        Alert.alert('Información', 'Para agregar un nuevo barbero, primero debe registrarse como usuario y luego cambiar su rol a barbero.');
        setModalVisible(false);
        return;
      }

      await loadBarbers();
      setModalVisible(false);
      Alert.alert('Éxito', editing ? 'Barbero actualizado correctamente' : 'Barbero agregado correctamente');
    } catch (error) {
      console.error('Error saving barber:', error);
      Alert.alert('Error', 'Error inesperado al guardar el barbero');
    }
  };

  const toggleBarberStatus = async (barber: Barber) => {
    const newStatus = barber.status === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', barber.id);

      if (error) {
        console.error('Error updating barber status:', error);
        Alert.alert('Error', 'No se pudo cambiar el estado del barbero');
        return;
      }

      await loadBarbers();
      Alert.alert('Éxito', `Barbero ${newStatus === 'active' ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      console.error('Error toggling barber status:', error);
      Alert.alert('Error', 'Error inesperado al cambiar el estado');
    }
  };

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

  if (loading) {
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
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.icon }]}>
            Cargando barberos...
          </Text>
        </View>
      </View>
    );
  }

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
        <TouchableOpacity 
          style={styles.addButton}
          onPress={openAdd}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.barbersList}>
        {barbers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="person.slash" size={48} color={colors.icon} />
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              No hay barberos registrados
            </Text>
          </View>
        ) : (
          barbers.map((barber) => (
            <View
              key={barber.id}
              style={[
                styles.barberCard, 
                { backgroundColor: colors.card },
                barber.status === 'inactive' && styles.inactiveCard
              ]}
            >
              <View style={styles.barberHeader}>
                <Text style={[styles.barberName, { color: colors.text }]}>
                  {`${barber.first_name} ${barber.last_name}`}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: barber.status === 'active' ? '#4CAF50' : '#F44336' }
                ]}>
                  <Text style={styles.statusText}>
                    {barber.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Text>
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
              
              <Text style={[styles.experienceText, { color: colors.icon }]}>
                {barber.experience}
              </Text>
              
              <View style={styles.specialtiesContainer}>
                {barber.specialties.map((specialty) => (
                  <View key={specialty} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => openEdit(barber)}
                >
                  <IconSymbol name="pencil" size={16} color="#D4AF37" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, barber.status === 'active' ? styles.deactivateBtn : styles.activateBtn]}
                  onPress={() => toggleBarberStatus(barber)}
                >
                  <IconSymbol 
                    name={barber.status === 'active' ? 'pause' : 'play'} 
                    size={16} 
                    color={barber.status === 'active' ? '#F44336' : '#4CAF50'} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editing ? 'Editar Barbero' : 'Agregar Barbero'}
            </Text>

            <TextInput
              placeholder="Nombre"
              placeholderTextColor={colors.icon}
              value={firstName}
              onChangeText={setFirstName}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              placeholder="Apellido"
              placeholderTextColor={colors.icon}
              value={lastName}
              onChangeText={setLastName}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.icon}
              value={email}
              onChangeText={setEmail}
              editable={!editing}
              style={[styles.input, { color: colors.text, borderColor: colors.border, opacity: editing ? 0.6 : 1 }]}
            />
            <TextInput
              placeholder="Teléfono (opcional)"
              placeholderTextColor={colors.icon}
              value={phone}
              onChangeText={setPhone}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              placeholder="Experiencia"
              placeholderTextColor={colors.icon}
              value={experience}
              onChangeText={setExperience}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            <TextInput
              placeholder="Especialidades (separadas por comas)"
              placeholderTextColor={colors.icon}
              value={specialtiesText}
              onChangeText={setSpecialtiesText}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)} 
                style={styles.modalBtnSecondary}
              >
                <Text style={[styles.modalBtnText, { color: colors.primary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={saveBarber} 
                style={[styles.modalBtnPrimary, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>
                  {editing ? 'Guardar' : 'Agregar'}
                </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#D4AF37',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
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
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
  },
  experienceText: {
    fontSize: 14,
    marginBottom: 8,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  activateBtn: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  deactivateBtn: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
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
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 16,
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
  },
});