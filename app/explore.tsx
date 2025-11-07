import { BarberCard } from '@/components/barberia/BarberCard';
import { CustomButton } from '@/components/barberia/CustomButton';
import { ServiceCard } from '@/components/barberia/ServiceCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function BookAppointmentScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const services = [
    {
      id: '1',
      name: 'Corte Clásico',
      description: 'Corte tradicional con tijera y máquina',
      price: 25,
      duration: 45,
      icon: 'scissors',
    },
    {
      id: '2',
      name: 'Corte Moderno',
      description: 'Cortes modernos y actuales',
      price: 35,
      duration: 60,
      icon: 'star.fill',
    },
    {
      id: '3',
      name: 'Arreglo de Barba',
      description: 'Recorte y perfilado de barba',
      price: 20,
      duration: 30,
      icon: 'face.smiling',
    },
    {
      id: '4',
      name: 'Corte + Barba',
      description: 'Paquete completo',
      price: 40,
      duration: 75,
      icon: 'crown.fill',
    },
  ];

  const barbers = [
    {
      id: '1',
      name: 'Carlos Mendez',
      specialties: ['Cortes clásicos', 'Barbas'],
      rating: 4.8,
      experience: '15 años de experiencia',
    },
    {
      id: '2',
      name: 'Miguel Torres',
      specialties: ['Cortes modernos', 'Afeitado'],
      rating: 4.9,
      experience: '12 años de experiencia',
    },
    {
      id: '3',
      name: 'Roberto Silva',
      specialties: ['Todas las técnicas', 'Eventos'],
      rating: 4.7,
      experience: '20 años de experiencia',
    },
  ];

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM'
  ];

  // Generar fechas dinámicamente
  const generateDates = () => {
    const today = new Date();
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                         'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      let dayLabel;
      if (i === 0) {
        dayLabel = 'Hoy';
      } else if (i === 1) {
        dayLabel = 'Mañana';
      } else {
        dayLabel = dayNames[date.getDay()];
      }
      
      const formattedDate = `${dayLabel}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
      dates.push(formattedDate);
    }
    
    return dates;
  };

  const dates = generateDates();

  const handlePhoneChange = (text: string) => {
    // Solo permitir números y limitar a 10 dígitos
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 10) {
      setCustomerPhone(numericText);
    }
  };

  const handleNameChange = (text: string) => {
    // Limitar a 50 caracteres para el nombre
    if (text.length <= 50) {
      setCustomerName(text);
    }
  };

  const handleNotesChange = (text: string) => {
    // Limitar a 200 caracteres para las notas
    if (text.length <= 200) {
      setNotes(text);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleBookAppointment = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (customerPhone.length !== 10) {
      Alert.alert('Error', 'El teléfono debe tener exactamente 10 dígitos');
      return;
    }

    Alert.alert(
      'Cita Agendada',
      `Tu cita ha sido agendada exitosamente!\n\nServicio: ${selectedService?.name}\nBarbero: ${selectedBarber?.name}\nFecha: ${selectedDate}\nHora: ${selectedTime}\nPrecio: $${selectedService?.price}`,
      [{ 
        text: 'OK', 
        onPress: () => {
          resetForm();
          router.push('/(tabs)/appointments');
        }
      }]
    );
  };

  const resetForm = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedDate('');
    setSelectedTime('');
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedService !== null;
      case 2:
        return selectedBarber !== null;
      case 3:
        return selectedDate !== '' && selectedTime !== '';
      case 4:
        return customerName.trim() !== '' && customerPhone.trim() !== '' && customerPhone.length === 10;
      default:
        return false;
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((stepNumber) => (
        <View key={stepNumber} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle, 
            { backgroundColor: step >= stepNumber ? colors.primary : colors.border }
          ]}>
            <Text style={[
              styles.stepNumber, 
              { color: step >= stepNumber ? '#FFF' : colors.icon }
            ]}>
              {stepNumber}
            </Text>
          </View>
          {stepNumber < 4 && (
            <View style={[
              styles.stepLine, 
              { backgroundColor: step > stepNumber ? colors.primary : colors.border }
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <ThemedView style={styles.stepContent}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              Selecciona un Servicio
            </ThemedText>
            <ScrollView showsVerticalScrollIndicator={false}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => setSelectedService(service)}
                >
                  <View style={[
                    styles.selectionBorder,
                    selectedService?.id === service.id && { borderColor: colors.primary, borderWidth: 2 }
                  ]}>
                    <ServiceCard
                      service={service}
                      onPress={() => setSelectedService(service)}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>
        );

      case 2:
        return (
          <ThemedView style={styles.stepContent}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              Elige tu Barbero
            </ThemedText>
            <ScrollView showsVerticalScrollIndicator={false}>
              {barbers.map((barber) => (
                <TouchableOpacity
                  key={barber.id}
                  onPress={() => setSelectedBarber(barber)}
                >
                  <View style={[
                    styles.selectionBorder,
                    selectedBarber?.id === barber.id && { borderColor: colors.primary, borderWidth: 2 }
                  ]}>
                    <BarberCard
                      barber={barber}
                      onPress={() => setSelectedBarber(barber)}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>
        );

      case 3:
        return (
          <ThemedView style={styles.stepContent}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              Selecciona Fecha y Hora
            </ThemedText>
            
            <ScrollView 
              style={styles.dateTimeContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Fecha</Text>
              <View style={styles.dateScrollContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.dateScroll}
                  contentContainerStyle={styles.dateScrollContent}
                >
                  {dates.map((date) => (
                    <TouchableOpacity
                      key={date}
                      style={[
                        styles.dateButton,
                        { 
                          backgroundColor: selectedDate === date ? colors.primary : colors.card,
                          borderColor: selectedDate === date ? colors.primary : colors.border
                        }
                      ]}
                      onPress={() => setSelectedDate(date)}
                    >
                      <Text style={[
                        styles.dateText,
                        { color: selectedDate === date ? '#FFF' : colors.text }
                      ]}>
                        {date}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={[styles.sectionLabel, { color: colors.text }]}>Hora disponible</Text>
              <View style={styles.timeGrid}>
                {timeSlots.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeButton,
                      { 
                        backgroundColor: selectedTime === time ? colors.primary : colors.card,
                        borderColor: selectedTime === time ? colors.primary : colors.border
                      }
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[
                      styles.timeText,
                      { color: selectedTime === time ? '#FFF' : colors.text }
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </ThemedView>
        );

      case 4:
        return (
          <ThemedView style={styles.stepContent}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              Información del Cliente
            </ThemedText>
            
            <ScrollView 
              style={styles.formContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Nombre completo * ({customerName.length}/50)
                </Text>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Ingresa tu nombre"
                  placeholderTextColor={colors.icon}
                  value={customerName}
                  onChangeText={handleNameChange}
                  maxLength={50}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Teléfono * ({customerPhone.length}/10)
                </Text>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Ingresa tu teléfono (10 dígitos)"
                  placeholderTextColor={colors.icon}
                  value={customerPhone}
                  onChangeText={handlePhoneChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Notas adicionales ({notes.length}/200)
                </Text>
                <TextInput
                  style={[styles.textArea, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Comentarios especiales (opcional)"
                  placeholderTextColor={colors.icon}
                  value={notes}
                  onChangeText={handleNotesChange}
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                />
              </View>

              {/* Resumen de la cita */}
              <View style={[styles.summaryContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>Resumen de tu cita</Text>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.icon }]}>Servicio:</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedService?.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.icon }]}>Barbero:</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedBarber?.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.icon }]}>Fecha:</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedDate}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.icon }]}>Hora:</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedTime}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.icon }]}>Duración:</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedService?.duration} min</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={[styles.summaryLabel, styles.totalLabel, { color: colors.text }]}>Total:</Text>
                  <Text style={[styles.summaryValue, styles.totalValue, { color: colors.primary }]}>${selectedService?.price}</Text>
                </View>
              </View>
            </ScrollView>
          </ThemedView>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedView style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            Agendar Cita
          </ThemedText>
          <View style={styles.backButton} />
        </ThemedView>
        <ThemedView style={styles.stepIndicatorContainer}>
          {renderStepIndicator()}
        </ThemedView>

      {renderStepContent()}

      <ThemedView style={styles.navigationContainer}>
        {step > 1 && (
          <CustomButton
            title="Anterior"
            onPress={handlePrevious}
            variant="outline"
            style={styles.navButton}
          />
        )}
        
        {step < 4 ? (
          <CustomButton
            title="Siguiente"
            onPress={handleNext}
            disabled={!canProceed()}
            style={step === 1 ? styles.fullWidthButton : styles.navButton}
          />
        ) : (
          <CustomButton
            title="Confirmar Cita"
            onPress={handleBookAppointment}
            disabled={!canProceed()}
            style={styles.navButton}
          />
        )}
      </ThemedView>
    </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  stepIndicatorContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 5,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  selectionBorder: {
    borderRadius: 12,
    marginVertical: 4,
  },
  dateTimeContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  dateScroll: {
    marginBottom: 20,
    maxHeight: 60,
  },
  dateScrollContainer: {
    marginBottom: 20,
  },
  dateScrollContent: {
    paddingHorizontal: 4,
  },
  dateButton: {
    padding: 12,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeButton: {
    width: '30%',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  summaryContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  fullWidthButton: {
    marginHorizontal: 0,
  },
});