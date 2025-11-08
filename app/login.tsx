import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../components/auth/AuthContext';
import { IconSymbol } from '../components/ui/icon-symbol';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { supabase } from '../utils/database';

export default function LoginScreen() {
  const { signIn, setRole } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { width } = Dimensions.get('window');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Responsive sizing
  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width <= 414;
  
  const responsiveSize = {
    logoSize: isSmallDevice ? 60 : isMediumDevice ? 70 : 80,
    titleSize: isSmallDevice ? 28 : isMediumDevice ? 32 : 36,
    subtitleSize: isSmallDevice ? 14 : 16,
    inputPadding: isSmallDevice ? 12 : 16,
    buttonHeight: isSmallDevice ? 48 : 52,
    spacing: isSmallDevice ? 16 : 20,
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setIsLoading(true);
    
    try {
      await signIn(email, password);
      setIsLoading(false);
      
      // Obtener el usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();

      // Intentar obtener el rol desde la tabla `profiles` (se crea en register.tsx)
      // Si no existe, intentar `user_metadata.role`, y como último recurso la
      // tabla `user_roles` para mantener compatibilidad con implementaciones previas.
      let role: string | null = null;

      if (user?.id) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (!profileError) {
            // profileData puede ser un objeto con { role }
            role = (profileData as any)?.role ?? null;
          }
        } catch (err) {
          // continuar con otros intentos de fallback
          role = null;
        }
      }

      // Fallback a user_metadata (si lo usan en Supabase Auth)
      if (!role) {
        role = (user as any)?.user_metadata?.role ?? null;
      }

      // Último recurso: tabla user_roles si existe (compatibilidad)
      if (!role) {
        try {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user?.id)
            .single();
          role = roleData?.role ?? null;
        } catch (err) {
          role = null;
        }
      }

      const isBarber = role === 'barber';

      // Actualizar role en el AuthContext para que layouts que dependan
      // de él (p. ej. AdminLayout) lo tengan inmediatamente.
      try {
        setRole?.(role);
      } catch (err) {
        console.error('Error setting role in context:', err);
      }
      
      Alert.alert(
        'Inicio de Sesión Exitoso',
        '¡Bienvenido a BarberLine!',
        [{ 
          text: 'Continuar', 
          onPress: () => {
            if (isBarber) {
              router.replace('/admin');
            } else {
              router.replace('/(tabs)');
            }
          }
        }]
      );
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      Alert.alert(
        'Error', 
        error.message === 'Invalid login credentials'
          ? 'Credenciales inválidas'
          : 'No se pudo iniciar sesión'
      );
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={[styles.header, { marginTop: responsiveSize.spacing * 2 }]}>
          <View style={[styles.logoContainer, { 
            backgroundColor: colors.primary,
            width: responsiveSize.logoSize,
            height: responsiveSize.logoSize,
          }]}>
            <IconSymbol 
              name="scissors" 
              size={responsiveSize.logoSize * 0.5} 
              color="#FFFFFF" 
            />
          </View>
          
          <Text style={[styles.title, { 
            color: colors.text,
            fontSize: responsiveSize.titleSize,
            marginTop: responsiveSize.spacing
          }]}>
            BarberLine
          </Text>
          
          <Text style={[styles.subtitle, { 
            color: colors.icon,
            fontSize: responsiveSize.subtitleSize,
            marginTop: 8
          }]}>
            Inicia sesión en tu cuenta
          </Text>
        </View>

        {/* Form Section */}
        <View style={[styles.formContainer, { marginTop: responsiveSize.spacing * 2 }]}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Email
            </Text>
            <View style={[styles.inputWrapper, { 
              borderColor: colors.border,
              backgroundColor: colors.card
            }]}>
              <IconSymbol 
                name="envelope.fill" 
                size={20} 
                color={colors.icon} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, { 
                  color: colors.text,
                  fontSize: 16,
                  paddingVertical: responsiveSize.inputPadding
                }]}
                placeholder="tu@email.com"
                placeholderTextColor={colors.icon}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Contraseña
            </Text>
            <View style={[styles.inputWrapper, { 
              borderColor: colors.border,
              backgroundColor: colors.card
            }]}>
              <IconSymbol 
                name="lock.fill" 
                size={20} 
                color={colors.icon} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, { 
                  color: colors.text,
                  fontSize: 16,
                  paddingVertical: responsiveSize.inputPadding
                }]}
                placeholder="••••••••"
                placeholderTextColor={colors.icon}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <IconSymbol 
                  name={showPassword ? "eye.slash.fill" : "eye.fill"} 
                  size={20} 
                  color={colors.icon} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, { 
              backgroundColor: colors.primary,
              height: responsiveSize.buttonHeight,
              marginTop: responsiveSize.spacing
            }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.buttonText}>Iniciando sesión...</Text>
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

        </View>

        {/* Register Section */}
        <View style={styles.registerContainer}>
          <Text style={[styles.registerText, { color: colors.icon }]}>
            ¿No tienes cuenta?{' '}
          </Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>
              Regístrate aquí
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});