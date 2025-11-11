import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { supabase } from '../../utils/database';

interface Barber {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: string;
  status: 'active' | 'inactive';
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Verificar si el usuario es el dueño
  useEffect(() => {
    const checkOwner = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Si no es el dueño, redirigir
      if (user?.email !== 'jaimeb@gmail.com') {
        Alert.alert('Acceso Denegado', 'Solo el dueño puede gestionar barberos');
        router.back();
      }
    };
    
    checkOwner();
  }, []);

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

      const mappedBarbers = data?.map(barber => ({
        id: barber.id,
        first_name: barber.first_name || '',
        last_name: barber.last_name || '',
        phone: barber.phone || null,
        role: barber.role || 'barber',
        status: barber.status || 'active',
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
    // Verificar si ya hay 4 barberos
    if (barbers.length >= 4) {
      Alert.alert('Límite Alcanzado', 'Solo se permiten máximo 4 barberos en la barbería.');
      return;
    }
    
    setEditing(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setModalVisible(true);
  };

  const openEdit = (barber: Barber) => {
    setEditing(barber);
    setFirstName(barber.first_name);
    setLastName(barber.last_name);
    setPhone(barber.phone || '');
    setPassword(''); // No necesario para edición
    setConfirmPassword('');
    setModalVisible(true);
  };

  const saveBarber = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    // Para crear nuevo barbero, validar contraseña
    if (!editing) {
      if (!password.trim() || password.length < 6) {
        Alert.alert('Contraseña requerida', 'La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden.');
        return;
      }
    }

    try {
      if (editing) {
        // Actualizar barbero existente
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            phone: phone || null
          })
          .eq('id', editing.id);

        if (error) {
          console.error('Error updating barber:', error);
          Alert.alert('Error', 'No se pudo actualizar el barbero');
          return;
        }

        Alert.alert('Éxito', 'Barbero actualizado correctamente');
      } else {
        // Crear nuevo barbero completo
        console.log('🔧 Creando nuevo barbero...');
        
        // 1. Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: `${firstName.trim()} ${lastName.trim()}`,
              role: 'barber'
            }
          }
        });

        if (authError) {
          console.error('Error creating auth user:', authError);
          if (authError.message.includes('User already registered')) {
            Alert.alert('Error', 'Ya existe un usuario con este email. Usa un email diferente.');
          } else {
            Alert.alert('Error', `No se pudo crear el usuario: ${authError.message}`);
          }
          return;
        }

        if (!authData.user) {
          Alert.alert('Error', 'No se pudo crear el usuario.');
          return;
        }

        console.log('✅ Usuario creado en Auth:', authData.user.id);

        // 2. Crear/actualizar perfil en la tabla profiles
          const { error: profileError } = await supabase
          .from('profiles')
          .upsert([{
            id: authData.user.id,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: phone.trim() || null,
            role: 'barber',
            status: 'active'
          }]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          Alert.alert('Error', `Usuario creado pero no se pudo completar el perfil: ${profileError.message}`);
          return;
        }

        console.log('✅ Perfil creado exitosamente');
        Alert.alert('Éxito', `Barbero ${firstName} ${lastName} creado correctamente. Puede iniciar sesión con el email: ${email}`);
      }

      await loadBarbers();
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving barber:', error);
      Alert.alert('Error', 'Error inesperado al guardar el barbero');
    }
  };



  const confirmDeleteBarber = (barber: Barber) => {
    Alert.alert(
      'Eliminar Barbero',
      `¿Estás seguro de que quieres ELIMINAR a ${barber.first_name} ${barber.last_name}?\n\n⚠️ ADVERTENCIA: Esta acción:\n• Eliminará permanentemente al barbero\n• Cancelará todas sus citas pendientes\n• No se puede deshacer\n\n¿Continuar con la eliminación?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sí, ELIMINAR',
          style: 'destructive',
          onPress: () => {
            deleteBarber(barber).catch(console.error);
          }
        }
      ]
    );
  };

  const deleteBarber = async (barber: Barber) => {
    try {
      // Primero cancelar todas las citas pendientes del barbero
      const { error: appointmentsError } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          cancelled_by: 'admin',
          cancelled_reason: 'Barbero eliminado del sistema'
        })
        .eq('barber_id', barber.id)
        .in('status', ['confirmed', 'pending']);

      if (appointmentsError) {
        console.error('Error cancelling appointments:', appointmentsError);
      }

      // Luego eliminar el perfil del barbero
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', barber.id);

      if (error) {
        console.error('Error deleting barber:', error);
        Alert.alert('Error', 'No se pudo eliminar el barbero');
        return;
      }

      await loadBarbers();
      Alert.alert('Barbero Eliminado', `${barber.first_name} ${barber.last_name} ha sido eliminado del sistema. Sus citas pendientes han sido canceladas.`);
    } catch (error) {
      console.error('Error deleting barber:', error);
      Alert.alert('Error', 'Error inesperado al eliminar el barbero');
    }
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
          Barberos ({barbers.length}/4)
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
                { backgroundColor: colors.card }
              ]}
            >
              <View style={styles.barberHeader}>
                <Text style={[styles.barberName, { color: colors.text }]}>
                  {`${barber.first_name} ${barber.last_name}`}
                </Text>
              </View>

              <View style={styles.barberInfo}>
                {barber.phone && (
                  <View style={styles.infoRow}>
                    <IconSymbol name="phone" size={14} color="#2196F3" />
                    <Text style={[styles.infoText, { color: colors.icon }]}>
                      {barber.phone}
                    </Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <IconSymbol name="person.badge" size={14} color="#2196F3" />
                  <Text style={[styles.infoText, { color: colors.icon }]}>
                    {barber.role === 'barber' ? 'Barbero' : barber.role}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => openEdit(barber)}
                >
                  <IconSymbol name="pencil" size={16} color="#D4AF37" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => confirmDeleteBarber(barber)}
                >
                  <IconSymbol name="trash" size={16} color="#E53935" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editing ? 'Editar Barbero' : 'Agregar Barbero'}
            </Text>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
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
            {!editing && (
              <>
                <TextInput
                  placeholder="Contraseña"
                  placeholderTextColor={colors.icon}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                />
                <TextInput
                  placeholder="Confirmar contraseña"
                  placeholderTextColor={colors.icon}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                />
              </>
            )}
            </ScrollView>

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
        </KeyboardAvoidingView>
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
  barberInfo: {
    marginBottom: 8,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
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
  },
  modalScrollView: {
    maxHeight: 400,
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