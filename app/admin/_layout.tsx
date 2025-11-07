import { Redirect, Stack } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../components/auth/AuthContext';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function AdminLayout() {
  const { user, role, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Verificar si el usuario es barbero
  if (!role || role !== 'barber') {
    return <Redirect href="/login" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header del admin */}
      <View style={[styles.header, { backgroundColor: '#D4AF37', shadowColor: colors.text }]}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <IconSymbol name="scissors" size={24} color="#fff" />
            <Text style={styles.headerTitle}>Panel Administrativo</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Hola, {user?.email}</Text>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={signOut}
            >
              <IconSymbol name="arrow.right.square" size={20} color="#fff" />
              <Text style={styles.logoutText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Contenido del admin */}
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="services" />
          <Stack.Screen name="appointments" />
          <Stack.Screen name="barbers" />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  content: {
    flex: 1,
  },
});