import { Alert, Dimensions, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/components/auth/AuthContext';
import { CustomButton } from '@/components/barberia/CustomButton';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { signOut, user } = useAuth();

  // Variables responsive
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallDevice = screenWidth < 375;
  const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
  const isLargeDevice = screenWidth >= 414;
  
  // Tamaños adaptativos
  const responsiveSize = {
    heroIconSize: isSmallDevice ? 80 : isMediumDevice ? 90 : 100,
    heroTitleSize: isSmallDevice ? 28 : isMediumDevice ? 32 : 36,
    heroHeight: isSmallDevice ? 240 : isMediumDevice ? 260 : 280,
    cardPadding: isSmallDevice ? 16 : isMediumDevice ? 18 : 20,
    sectionMargin: isSmallDevice ? 20 : isMediumDevice ? 25 : 30,
    horizontalPadding: isSmallDevice ? 16 : 20,
    actionIconSize: isSmallDevice ? 48 : 54,
    contactIconSize: isSmallDevice ? 40 : 44,
  };

  const quickActions = [
    {
      title: 'Agendar Cita',
      subtitle: 'Reserva tu próxima cita',
      icon: 'calendar.badge.plus',
      onPress: () => router.push('/explore'),
      color: colors.primary,
    },
    {
      title: 'Ver Servicios',
      subtitle: 'Explora nuestros servicios',
      icon: 'scissors',
      onPress: () => router.push('/(tabs)/services'),
      color: colors.secondary,
    },
    {
      title: 'Mis Citas',
      subtitle: 'Gestiona tus reservas',
      icon: 'list.bullet',
      onPress: () => router.push('/(tabs)/appointments'),
      color: colors.primary,
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: () => {
            signOut();
            router.replace('/login');
          }
        }
      ]
    );
  };

  const handleFacebookPress = () => {
    const facebookUrl = 'https://www.facebook.com/profile.php?id=100041258745075';
    Linking.openURL(facebookUrl).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la página de Facebook');
    });
  };

  const handleLocationPress = () => {
    // Usar coordenadas GPS exactas para mayor precisión
    const latitude = 32.449799;
    const longitude = -114.740839;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    
    Linking.openURL(mapsUrl).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la ubicación en mapas');
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: colors.background, dark: colors.background }}
      headerImage={
        <View style={[styles.heroContainer, { 
          backgroundColor: colors.primary,
          height: responsiveSize.heroHeight,
          paddingHorizontal: responsiveSize.horizontalPadding
        }]}>
          <View style={styles.heroIconWrapper}>
            <Image
              source={require('@/assets/images/jaime.jpg')}
              style={[styles.heroImage, {
                width: responsiveSize.heroIconSize,
                height: responsiveSize.heroIconSize,
                borderRadius: responsiveSize.heroIconSize / 2,
                borderWidth: 3,
                borderColor: colorScheme === 'dark' ? colors.background : '#2C1810',
              }]}
              resizeMode="cover"
            />
            <View style={[styles.decorativeCircle, { 
              borderColor: colorScheme === 'dark' ? colors.background : '#2C1810',
              width: responsiveSize.heroIconSize + 20,
              height: responsiveSize.heroIconSize + 20,
              borderRadius: (responsiveSize.heroIconSize + 20) / 2,
              top: -10,
              left: -10,
            }]} />
          </View>
          <View style={styles.heroTextContainer}>
            <Text style={[styles.heroTitle, { 
              color: colorScheme === 'dark' ? colors.background : '#2C1810',
              fontSize: responsiveSize.heroTitleSize
            }]}>
              BarberJaime653
            </Text>
            <View style={[styles.titleUnderline, { backgroundColor: colorScheme === 'dark' ? colors.background : '#2C1810' }]} />
            <Text style={[styles.heroSubtitle, { color: colorScheme === 'dark' ? colors.background : '#2C1810' }]}>
              Estilo y tradición
            </Text>
          </View>
        </View>
      }>
      <ThemedView style={[styles.titleContainer, { 
        marginBottom: responsiveSize.sectionMargin,
        paddingHorizontal: responsiveSize.horizontalPadding
      }]}>
        <View style={styles.welcomeHeader}>
          <ThemedText type="title" style={styles.welcomeTitle}>
            Bienvenido{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </ThemedText>
        </View>
      </ThemedView>
      
      <ThemedView style={[styles.welcomeContainer, { 
        marginBottom: responsiveSize.sectionMargin,
        paddingHorizontal: responsiveSize.horizontalPadding
      }]}>
        <View style={[styles.welcomeCard, { 
          backgroundColor: colors.card, 
          borderColor: colors.border,
          padding: responsiveSize.cardPadding
        }]}>
          <IconSymbol name="star.fill" size={24} color={colors.primary} style={styles.welcomeIcon} />
          <ThemedText style={[styles.welcomeText, {
            fontSize: isSmallDevice ? 14 : 16
          }]}>
            Descubre la experiencia única de nuestra barbería. Ofrecemos servicios de corte de cabello, 
            arreglo de barba y cuidado personal con más de 6 años de experiencia.
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={[styles.hoursContainer, {
        marginBottom: responsiveSize.sectionMargin,
        paddingHorizontal: responsiveSize.horizontalPadding
      }]}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="clock.fill" size={24} color={colors.primary} />
          <ThemedText type="subtitle" style={styles.hoursTitle}>
            Horarios de Atención
          </ThemedText>
        </View>
        <View style={[styles.hoursCard, { 
          backgroundColor: colors.card, 
          borderColor: colors.border,
          padding: responsiveSize.cardPadding
        }]}>
          <View style={[styles.hoursRow, {
            paddingVertical: isSmallDevice ? 8 : 12
          }]}>
            <ThemedText 
              style={[styles.dayText, {
                fontSize: isSmallDevice ? 12 : isMediumDevice ? 14 : 16,
                flex: 1
              }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Lunes - Viernes
            </ThemedText>
            <ThemedText 
              style={[styles.timeText, { 
                color: colors.primary,
                fontSize: isSmallDevice ? 12 : isMediumDevice ? 14 : 16,
                flex: 1,
                textAlign: 'right'
              }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              10:00 AM - 11:00 PM
            </ThemedText>
          </View>
          <View style={[styles.hoursDivider, { backgroundColor: colors.border }]} />
          <View style={[styles.hoursRow, {
            paddingVertical: isSmallDevice ? 8 : 12
          }]}>
            <ThemedText 
              style={[styles.dayText, {
                fontSize: isSmallDevice ? 12 : isMediumDevice ? 14 : 16,
                flex: 1
              }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Sábados - Domingos
            </ThemedText>
            <ThemedText 
              style={[styles.timeText, { 
                color: colors.primary,
                fontSize: isSmallDevice ? 12 : isMediumDevice ? 14 : 16,
                flex: 1,
                textAlign: 'right'
              }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              10:00 AM - 7:00 PM
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={[styles.actionsContainer, {
        marginBottom: responsiveSize.sectionMargin,
        paddingHorizontal: responsiveSize.horizontalPadding
      }]}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="bolt.fill" size={24} color={colors.primary} />
          <ThemedText type="subtitle" style={styles.actionsTitle}>
            Acciones Rápidas
          </ThemedText>
        </View>
        
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { 
                backgroundColor: colors.card, 
                borderColor: colors.border,
                padding: responsiveSize.cardPadding
              }]}
              onPress={action.onPress}
            >
              <View style={[styles.actionIcon, { 
                backgroundColor: action.color + '15',
                width: responsiveSize.actionIconSize,
                height: responsiveSize.actionIconSize,
                borderRadius: responsiveSize.actionIconSize / 2,
                marginRight: isSmallDevice ? 12 : 16
              }]}>
                <IconSymbol name={action.icon as any} size={isSmallDevice ? 22 : 26} color={action.color} />
              </View>
              
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { 
                  color: colors.text,
                  fontSize: isSmallDevice ? 16 : 18
                }]}>
                  {action.title}
                </Text>
                <Text style={[styles.actionSubtitle, { 
                  color: colors.icon,
                  fontSize: isSmallDevice ? 12 : 14
                }]}>
                  {action.subtitle}
                </Text>
              </View>
              
              <View style={[styles.chevronContainer, { 
                backgroundColor: colors.primary + '10',
                width: isSmallDevice ? 28 : 32,
                height: isSmallDevice ? 28 : 32,
                borderRadius: isSmallDevice ? 14 : 16
              }]}>
                <IconSymbol name="chevron.right" size={isSmallDevice ? 16 : 18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={[styles.contactContainer, {
        marginBottom: responsiveSize.sectionMargin,
        paddingHorizontal: responsiveSize.horizontalPadding
      }]}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="bubble.left.and.bubble.right.fill" size={24} color={colors.primary} />
          <ThemedText type="subtitle" style={styles.contactTitle}>
            Contacto
          </ThemedText>
        </View>
        
        <View style={[styles.contactCard, { 
          backgroundColor: colors.card, 
          borderColor: colors.border,
          padding: responsiveSize.cardPadding
        }]}>
          <View style={styles.contactInfo}>
            <TouchableOpacity 
              style={[styles.contactRow, {
                paddingVertical: isSmallDevice ? 8 : 12
              }]}
              onPress={handleFacebookPress}
            >
              <View style={[styles.contactIconWrapper, { 
                backgroundColor: colors.primary + '15',
                width: responsiveSize.contactIconSize,
                height: responsiveSize.contactIconSize,
                borderRadius: responsiveSize.contactIconSize / 2,
                marginRight: isSmallDevice ? 12 : 16
              }]}>
                <IconSymbol name="globe" size={20} color={colors.primary} />
              </View>
              <View style={styles.contactTextContainer}>
                <ThemedText style={[styles.contactLabel, {
                  fontSize: isSmallDevice ? 10 : 12
                }]}>Facebook</ThemedText>
                <ThemedText style={[styles.contactText, {
                  fontSize: isSmallDevice ? 14 : 16
                }]}>Visita nuestra página</ThemedText>
              </View>
            </TouchableOpacity>
            
            <View style={[styles.contactDivider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity 
              style={[styles.contactRow, {
                paddingVertical: isSmallDevice ? 8 : 12
              }]}
              onPress={handleLocationPress}
            >
              <View style={[styles.contactIconWrapper, { 
                backgroundColor: colors.primary + '15',
                width: responsiveSize.contactIconSize,
                height: responsiveSize.contactIconSize,
                borderRadius: responsiveSize.contactIconSize / 2,
                marginRight: isSmallDevice ? 12 : 16
              }]}>
                <IconSymbol name="location.fill" size={20} color={colors.primary} />
              </View>
              <View style={styles.contactTextContainer}>
                <ThemedText style={[styles.contactLabel, {
                  fontSize: isSmallDevice ? 10 : 12
                }]}>Dirección</ThemedText>
                <ThemedText style={[styles.contactText, {
                  fontSize: isSmallDevice ? 14 : 16
                }]}>Callejón Chihuahua entre 38 y 39</ThemedText>
              </View>
            </TouchableOpacity>
          </View>
          
          <CustomButton
            title="Visitar Facebook"
            onPress={handleFacebookPress}
            variant="primary"
            style={styles.callButton}
          />
        </View>
      </ThemedView>

      {/* Login Section */}
      <ThemedView style={[styles.loginContainer, {
        marginBottom: responsiveSize.sectionMargin,
        paddingHorizontal: responsiveSize.horizontalPadding
      }]}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="person.circle.fill" size={24} color={colors.primary} />
          <ThemedText type="subtitle" style={styles.loginTitle}>
            Mi Cuenta
          </ThemedText>
        </View>
        
        <View style={[styles.loginCard, { 
          backgroundColor: colors.card, 
          borderColor: colors.border,
          padding: responsiveSize.cardPadding
        }]}>
          {user ? (
            <>
              <ThemedText style={[styles.loginDescription, { 
                color: colors.icon,
                fontSize: isSmallDevice ? 14 : 16,
                marginBottom: responsiveSize.cardPadding
              }]}>
                Sesión iniciada como: {user.email}
              </ThemedText>
              
              <CustomButton
                title="Cerrar Sesión"
                onPress={handleLogout}
                variant="outline"
                style={styles.logoutButtonFull}
              />
            </>
          ) : (
            <>
              <ThemedText style={[styles.loginDescription, { 
                color: colors.icon,
                fontSize: isSmallDevice ? 14 : 16,
                marginBottom: responsiveSize.cardPadding
              }]}>
                Inicia sesión para acceder a todas las funciones y gestionar tus citas
              </ThemedText>
              
              <View style={styles.loginButtons}>
                <CustomButton
                  title="Iniciar Sesión"
                  onPress={() => router.push('/login')}
                  variant="primary"
                  style={styles.loginButton}
                />
                <CustomButton
                  title="Registrarse"
                  onPress={() => router.push('/register')}
                  variant="outline"
                  style={styles.loginButton}
                />
              </View>
            </>
          )}
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroIconWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  heroImage: {
    // Estilos dinámicos aplicados inline
  },
  decorativeCircle: {
    position: 'absolute',
    borderWidth: 2,
    opacity: 0.3,
  },
  heroTextContainer: {
    alignItems: 'center',
  },
  heroTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  titleUnderline: {
    width: 80,
    height: 3,
    marginVertical: 8,
    borderRadius: 2,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    fontStyle: 'italic',
  },
  titleContainer: {
    // Valores dinámicos aplicados inline
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    textAlign: 'center',
  },

  welcomeContainer: {
    // Valores dinámicos aplicados inline
  },
  welcomeCard: {
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  welcomeIcon: {
    marginBottom: 12,
  },
  welcomeText: {
    lineHeight: 24,
    textAlign: 'center',
  },
  hoursContainer: {
    // Valores dinámicos aplicados inline
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  hoursTitle: {
    textAlign: 'center',
  },
  hoursCard: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  hoursDivider: {
    height: 1,
    marginVertical: 4,
    opacity: 0.5,
  },
  dayText: {
    fontWeight: '500',
    flexShrink: 1,
  },
  timeText: {
    fontWeight: 'bold',
    flexShrink: 1,
  },
  actionsContainer: {
    // Valores dinámicos aplicados inline
  },
  actionsTitle: {
    textAlign: 'center',
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  actionIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionSubtitle: {
    lineHeight: 20,
  },
  chevronContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactContainer: {
    // Valores dinámicos aplicados inline
  },
  contactTitle: {
    textAlign: 'center',
  },
  contactCard: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  contactInfo: {
    marginBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.7,
    marginBottom: 2,
  },
  contactText: {
    fontWeight: '500',
  },
  contactDivider: {
    height: 1,
    marginVertical: 4,
    opacity: 0.3,
  },
  callButton: {
    marginTop: 8,
  },
  loginContainer: {
    // Valores dinámicos aplicados inline
  },
  loginTitle: {
    textAlign: 'center',
  },
  loginCard: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  loginDescription: {
    textAlign: 'center',
    lineHeight: 22,
  },
  loginButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  loginButton: {
    flex: 1,
  },
  logoutButtonFull: {
    width: '100%',
  },
});