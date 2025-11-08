import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
import { supabase } from '../utils/database';

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { width } = Dimensions.get('window');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Responsive sizing
  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width <= 414;
  
  const responsiveSize = {
    logoSize: isSmallDevice ? 50 : isMediumDevice ? 60 : 70,
    titleSize: isSmallDevice ? 24 : isMediumDevice ? 28 : 32,
    subtitleSize: isSmallDevice ? 14 : 16,
    inputPadding: isSmallDevice ? 12 : 16,
    buttonHeight: isSmallDevice ? 48 : 52,
    spacing: isSmallDevice ? 16 : 20,
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 10) {
      handleInputChange('phone', numericText);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const { firstName, lastName, email, phone, password, confirmPassword } = formData;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return false;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return false;
    }

    if (phone.length !== 10) {
      Alert.alert('Error', 'El teléfono debe tener exactamente 10 dígitos');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // 1. Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw new Error(authError.message);
      if (!authData?.user) throw new Error('No se pudo crear el usuario');

      // 2. Crear perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          role: 'user'
        });

      if (profileError) throw new Error(profileError.message);

      Alert.alert(
        'Cuenta Creada',
        'Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.',
        [{ text: 'Continuar', onPress: () => router.replace('/login') }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Error al crear la cuenta'
      );
    } finally {
      setIsLoading(false);
    }
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
          {/* Header with Back Button */}
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Header Section */}
          <View style={[styles.header, { marginTop: responsiveSize.spacing }]}>
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
              Crear Cuenta
            </Text>
            
            <Text style={[styles.subtitle, { 
              color: colors.icon,
              fontSize: responsiveSize.subtitleSize,
              marginTop: 8
            }]}>
              Únete a la familia BarberLine
            </Text>
          </View>

          {/* Form Section */}
          <View style={[styles.formContainer, { marginTop: responsiveSize.spacing * 1.5 }]}>
            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Nombre *
              </Text>
              <View style={[styles.inputWrapper, { 
                borderColor: colors.border,
                backgroundColor: colors.card
              }]}>
                <IconSymbol 
                  name="person.fill" 
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
                  placeholder="Tu nombre"
                  placeholderTextColor={colors.icon}
                  value={formData.firstName}
                  onChangeText={(text) => handleInputChange('firstName', text)}
                  maxLength={50}
                />
              </View>
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Apellido *
              </Text>
              <View style={[styles.inputWrapper, { 
                borderColor: colors.border,
                backgroundColor: colors.card
              }]}>
                <IconSymbol 
                  name="person.fill" 
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
                  placeholder="Tu apellido"
                  placeholderTextColor={colors.icon}
                  value={formData.lastName}
                  onChangeText={(text) => handleInputChange('lastName', text)}
                  maxLength={50}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Email *
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
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Teléfono * ({formData.phone.length}/10)
              </Text>
              <View style={[styles.inputWrapper, { 
                borderColor: colors.border,
                backgroundColor: colors.card
              }]}>
                <IconSymbol 
                  name="phone.fill" 
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
                  placeholder="1234567890"
                  placeholderTextColor={colors.icon}
                  value={formData.phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Contraseña *
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
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.icon}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  secureTextEntry={!showPassword}
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

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Confirmar Contraseña *
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
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={colors.icon}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <IconSymbol 
                    name={showConfirmPassword ? "eye.slash.fill" : "eye.fill"} 
                    size={20} 
                    color={colors.icon} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, { 
                backgroundColor: colors.primary,
                height: responsiveSize.buttonHeight,
                marginTop: responsiveSize.spacing
              }]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.buttonText}>Creando cuenta...</Text>
              ) : (
                <Text style={styles.buttonText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Section */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.icon }]}>
              ¿Ya tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>
                Inicia sesión
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
  headerContainer: {
    paddingTop: 60,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  registerButton: {
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});