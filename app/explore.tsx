import { useAuth } from '@/components/auth/AuthContext';
import { BarberCard } from '@/components/barberia/BarberCard';
import { CustomButton } from '@/components/barberia/CustomButton';
import { ServiceCard } from '@/components/barberia/ServiceCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/utils/database';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function BookAppointmentScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [occupiedCountsByTime, setOccupiedCountsByTime] = useState<Record<string, number>>({});
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [customerid, setCustomerid] = useState<string | null>(null);

  // useEffect para obtener el customerid del usuario autenticado
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCustomerid(user?.id || null);
    };
    
    getCurrentUser();
  }, []);

  // Generar slots desde 10:00 AM hasta 11:00 PM (30 mins) y aplicar filtros por día más adelante
  const generateBaseTimeSlots = (startHour = 10, endHour = 23) => {
    const slots: string[] = [];
    for (let h = startHour; h <= endHour; h++) {
      // 0 and 30 minutes
      for (const m of [0, 30]) {
        // Si estamos en la última hora (endHour) y minuto es 30, saltarlo para evitar pasar de endHour:00
        if (h === endHour && m === 30) continue;
        let displayHour = h;
        let meridiem = 'AM';
        if (h === 0) displayHour = 12;
        else if (h >= 12) {
          meridiem = 'PM';
          if (h > 12) displayHour = h - 12;
        }
        const timeString = `${displayHour}:${m.toString().padStart(2, '0')} ${meridiem}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateBaseTimeSlots(10, 23);

  // Generar fechas dinámicamente
  const generateDates = () => {
    const today = new Date();
    const dates: string[] = [];

    const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const fullDay = dayNamesFull[date.getDay()];
      const shortDay = dayNamesShort[date.getDay()];
      const initial = fullDay.charAt(0).toUpperCase();

      let dayLabel;
      if (i === 0) {
        dayLabel = `${initial} - Hoy`;
      } else if (i === 1) {
        dayLabel = `${initial} - Mañana`;
      } else {
        dayLabel = `${initial} - ${shortDay}`;
      }

      const formattedDate = `${dayLabel}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
      dates.push(formattedDate);
    }

    return dates;
  };

  const dates = generateDates();

  // Función auxiliar para formatear fecha para la base de datos
  const formatDateForDB = (date: string) => {
    const parts = date.split(', ')[1].split(' ');
    const day = parts[0];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthIndex = monthNames.indexOf(parts[1]);
    const year = new Date().getFullYear();
    return `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.padStart(2, '0')}`; // Formato YYYY-MM-DD
  };

  const handleNotesChange = (text: string) => {
    // Limitar a 200 caracteres para las notas
    if (text.length <= 200) {
      setNotes(text);
    }
  };





  // useEffect para cargar servicios al iniciar el componente
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingServices(true);
        console.log('🔍 Cargando servicios desde la base de datos...');
        
        const { data, error } = await supabase
          .from('services')
          .select('id, name, price, duration, owner_id');
        
        if (error) {
          console.error('❌ Error al cargar servicios:', error);
          setServices([]);
        } else {
          console.log('✅ Servicios cargados:', data);
          // Mapear los datos para que coincidan con la estructura esperada
          const mappedServices = data?.map(service => ({
            id: String(service.id),
            name: service.name || 'Servicio',
            description: `Servicio profesional de ${service.duration || 30} minutos`,
            price: service.price || 0,
            duration: `${service.duration || 30} min`,
            owner_id: service.owner_id || null,
            icon: 'scissors'
          })) || [];
          
          setServices(mappedServices);
        }
      } catch (error) {
        console.error('❌ Error inesperado al cargar servicios:', error);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  // useEffect para cargar barberos al iniciar el componente
  useEffect(() => {
    const loadBarbers = async () => {
      try {
        setLoadingBarbers(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('role', 'barber');
        
        if (error) {
          // En caso de error, usar datos por defecto
          setBarbers([]);
        } else {
          // Mapear los datos para que coincidan con la estructura esperada
          const mappedBarbers = data?.map(barber => ({
            id: String(barber.id),
            name: `${barber.first_name || ''} ${barber.last_name || ''}`.trim() || 'Barbero',
            
          })) || [];
          
          setBarbers(mappedBarbers);
        }
      } catch (error) {
        console.error('❌ Error inesperado al cargar barberos:', error);
        setBarbers([]);
      } finally {
        setLoadingBarbers(false);
      }
    };

    loadBarbers();
  }, []);

  // useEffect para consultar horas ocupadas cuando cambien fecha o barbero
  useEffect(() => {
    const loadOccupiedTimes = async () => {
      if (selectedDate && selectedBarber) {
        const occupied = await fetchOccupiedTimes(selectedDate, String(selectedBarber.id));
        setOccupiedTimes(occupied);
        setOccupiedCountsByTime({});
      } else if (selectedDate && !selectedBarber) {
        // Cuando no hay barbero seleccionado, consultar todas las citas para la fecha
        const counts = await fetchOccupiedCountsByTime(selectedDate);
        setOccupiedCountsByTime(counts);
        setOccupiedTimes([]);
      } else {
        setOccupiedTimes([]);
        setOccupiedCountsByTime({});
      }
    };

    loadOccupiedTimes();
  }, [selectedDate, selectedBarber]);

  // Función para consultar horas ocupadas incluyendo duración del servicio
  const fetchOccupiedTimes = async (date: string, barberId: string) => {
    const formattedDate = formatDateForDB(date);
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        time,
        services (
          duration
        )
      `)
      .eq('date', formattedDate)
      .eq('barber_id', barberId)
      .neq('status', 'cancelled'); // Excluir citas canceladas
    
    if (error || !data) {
      return [];
    }
    
    // Calcular todas las horas que deben estar bloqueadas
    const blockedTimes = new Set<string>();
    
    for (const appointment of data) {
      const startTime = appointment.time;
      const duration = (appointment.services as any)?.duration || 30;
      
      console.log(`🔒 Procesando cita: ${startTime} (${duration} min)`);
      
      // Calcular cuántos slots de 30 minutos ocupará esta cita
      const slotsToBlock = Math.ceil(duration / 30);
      const startMinutes = convertTimeToMinutes(startTime);
      
      // Bloquear todos los slots necesarios (incluyendo el de inicio)
      for (let i = 0; i < slotsToBlock; i++) {
        const slotMinutes = startMinutes + (i * 30);
        const slotTime = convertMinutesToTime(slotMinutes);
        if (slotTime && timeSlots.includes(slotTime)) {
          blockedTimes.add(slotTime);
          console.log(`🚫 Bloqueando slot: ${slotTime}`);
        }
      }
    }
    
    console.log('🚫 Horarios bloqueados finales:', Array.from(blockedTimes));
    return Array.from(blockedTimes);
  };



  // Función auxiliar para convertir tiempo a minutos
  const convertTimeToMinutes = (time: string): number => {
    const [timePart, meridiem] = time.split(' ');
    const [hourStr, minuteStr] = timePart.split(':');
    let hour = Number.parseInt(hourStr, 10);
    const minute = Number.parseInt(minuteStr || '0', 10);
    
    if (meridiem === 'PM' && hour !== 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    
    return hour * 60 + minute;
  };

  // Función auxiliar para convertir minutos a tiempo
  const convertMinutesToTime = (totalMinutes: number): string | null => {
    if (totalMinutes >= 24 * 60) return null; // No permitir horas después de medianoche
    
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    
    let displayHour = hour;
    const meridiem = hour >= 12 ? 'PM' : 'AM';
    
    if (hour === 0) displayHour = 12;
    else if (hour > 12) displayHour = hour - 12;
    
    const timeString = `${displayHour}:${minute.toString().padStart(2, '0')} ${meridiem}`;
    return timeString;
  };

  // Función para consultar la cantidad de barberos ocupados por hora para una fecha
  const fetchOccupiedCountsByTime = async (date: string) => {
    const formattedDate = formatDateForDB(date);

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        time, 
        barber_id,
        services (
          duration
        )
      `)
      .eq('date', formattedDate)
      .neq('status', 'cancelled');

    if (error || !data) {
      return {};
    }

    // Contar barberos ocupados por cada hora considerando la duración
    const barberOccupiedSlots = new Set<string>();
    
    for (const apt of data) {
      const startTime = apt.time;
      const barberId = apt.barber_id;
      const duration = (apt.services as any)?.duration || 30;
      
      // Calcular cuántos slots de 30 minutos ocupará esta cita
      const slotsToBlock = Math.ceil(duration / 30);
      const startMinutes = convertTimeToMinutes(startTime);
      
      // Marcar todos los slots ocupados por este barbero
      for (let i = 0; i < slotsToBlock; i++) {
        const slotMinutes = startMinutes + (i * 30);
        const slotTime = convertMinutesToTime(slotMinutes);
        if (slotTime && timeSlots.includes(slotTime)) {
          barberOccupiedSlots.add(`${slotTime}::${barberId}`);
        }
      }
    }

    // Contar cuántos barberos están ocupados por hora
    const counts: Record<string, number> = {};
    for (const entry of barberOccupiedSlots) {
      const [time] = entry.split('::');
      counts[time] = (counts[time] || 0) + 1;
    }

    return counts;
  };

  // Filtrar horarios disponibles
  // Filtrar horarios disponibles y excluir horas pasadas si la fecha seleccionada es hoy
  const availableTimeSlots = timeSlots.filter((time) => {
    // Si hay un barbero seleccionado, usar occupiedTimes (por barbero)
    if (selectedBarber) {
      if (occupiedTimes.includes(time)) return false;
    } else if (selectedDate) {
      // Si no hay barbero seleccionado, usar counts por hora: si todos los barberos están ocupados, excluir
      const occupiedCount = occupiedCountsByTime[time] || 0;
      // Si conocemos la cantidad de barberos cargados, sólo mostrar si hay al menos un barbero libre
      if (barbers && barbers.length > 0 && occupiedCount >= barbers.length) return false;
    }

    // Si no hay fecha seleccionada, mantener la lógica actual (se muestra mensaje en UI)
    if (!selectedDate) return true;

    // Determinar cuántos días desde hoy representa la fecha seleccionada usando el arreglo `dates`
    const selectedIndex = dates.indexOf(selectedDate);
    if (selectedIndex === -1) return true; // si no lo encontramos, no filtrar por tiempo

    // Construir un objeto Date para el slot combinando la fecha seleccionada y la hora del slot
    const now = new Date();
    const slotDate = new Date(now);
    slotDate.setDate(now.getDate() + selectedIndex);

    // Parsear la hora (p.ej. "9:30 AM") a hora y minutos 24h
    const [timePart, meridiem] = time.split(' ');
    const [hourStr, minuteStr] = timePart.split(':');
    let hour = Number.parseInt(hourStr, 10);
    const minute = Number.parseInt(minuteStr || '0', 10);
    const m = (meridiem || '').toUpperCase();
    if (m === 'PM' && hour !== 12) hour += 12;
    if (m === 'AM' && hour === 12) hour = 0;

    slotDate.setHours(hour, minute, 0, 0);

    // Aplicar regla por día: Lunes-Viernes -> 10:00-23:00, Sáb-Dom -> 10:00-19:00
    const dayOfWeek = slotDate.getDay(); // 0 = Domingo, 6 = Sábado
    const slotMinutes = convertTimeToMinutes(time);
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Fin de semana: hasta 19:00 (19*60)
      if (slotMinutes > 19 * 60) return false;
    } else {
      // Entre semana: hasta 23:00 (23*60). Como generamos timeSlots desde 10:00 no comprobamos límite inferior.
      if (slotMinutes > 23 * 60) return false;
    }

    // Mantener el slot sólo si está en el futuro respecto a ahora
    return slotDate > now;
  });

  console.log('🕐 Horarios totales:', timeSlots);
  console.log('🚫 Horarios ocupados:', occupiedTimes);
  console.log('✅ Horarios disponibles (filtrados):', availableTimeSlots);

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

  const handleBookAppointment = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para agendar una cita');
      return;
    }

    // Delay verdaderamente aleatorio antes de proceder al pago
    const timestamp = Date.now();
    const randomBase = Math.random();
    const timestampSeed = (timestamp % 1000) / 1000;
    const combinedRandom = (randomBase + timestampSeed + Math.random()) % 1;
    const randomDelay = Math.floor(combinedRandom * 1500 + 500); // 500ms a 2000ms
    console.log(`⏱️ Aplicando delay de ${randomDelay}ms antes de proceder al pago (seed: ${timestamp})...`);
    await new Promise(resolve => setTimeout(resolve, randomDelay));

    // Validar que el usuario no tenga más de 3 citas activas
    try {
      const { data: existingAppointments, error: countError } = await supabase
        .from('appointments')
        .select('id')
        .eq('user_id', customerid)
        .in('status', ['confirmed', 'pending', 'in_progress']);

      if (countError) {
        console.error('Error al verificar citas existentes:', countError);
        Alert.alert('Error', 'Error al validar las citas existentes. Intenta nuevamente.');
        return;
      }

      if (existingAppointments && existingAppointments.length >= 3) {
        Alert.alert(
          'Límite de citas alcanzado',
          'Ya tienes 3 citas activas. Cancela o completa alguna cita existente antes de agendar una nueva.',
          [
            { 
              text: 'Ver mis citas', 
              onPress: () => router.push('/(tabs)/appointments')
            },
            { text: 'OK' }
          ]
        );
        return;
      }
    } catch (error) {
      console.error('Error inesperado al validar citas:', error);
      Alert.alert('Error', 'Error inesperado. Intenta nuevamente.');
      return;
    }

    // Navegar a la pantalla de pago con todos los datos de la cita
    const appointmentDate = formatDateForDB(selectedDate);
    
    router.push({
      pathname: '/payment',
      params: {
        serviceId: selectedService.id.toString(),
        serviceName: selectedService.name,
        servicePrice: selectedService.price.toString(),
        barberId: selectedBarber.id,
        barberName: selectedBarber.name,
        selectedDate: appointmentDate,
        selectedTime: selectedTime,
        notes: notes,
      }
    });
  };

  const resetForm = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedDate('');
    setSelectedTime('');
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
        return true; // Ya no necesitamos validar datos del usuario
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
            
            {loadingServices ? (
              <View style={styles.loadingContainer}>
                <ThemedText style={[styles.loadingText, { color: colors.icon }]}>
                  Cargando servicios disponibles...
                </ThemedText>
              </View>
            ) : services.length === 0 ? (
              <View style={styles.noDataContainer}>
                <IconSymbol name="scissors" size={48} color={colors.icon} />
                <ThemedText style={[styles.noDataText, { color: colors.icon }]}>
                  No hay servicios disponibles en este momento
                </ThemedText>
              </View>
            ) : (
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
            )}
          </ThemedView>
        );

      case 2:
        return (
          <ThemedView style={styles.stepContent}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              Elige tu Barbero
            </ThemedText>
            
            {loadingBarbers ? (
              <View style={styles.loadingContainer}>
                <ThemedText style={[styles.loadingText, { color: colors.icon }]}>
                  Cargando barberos disponibles...
                </ThemedText>
              </View>
            ) : barbers.length === 0 ? (
              <View style={styles.noDataContainer}>
                <IconSymbol name="person.slash" size={48} color={colors.icon} />
                <ThemedText style={[styles.noDataText, { color: colors.icon }]}>
                  No hay barberos disponibles en este momento
                </ThemedText>
              </View>
            ) : (
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
            )}
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
                {(() => {
                  if (!selectedDate) {
                    return (
                      <View style={styles.selectDateContainer}>
                        <IconSymbol name="calendar" size={48} color={colors.icon} />
                        <Text style={[styles.selectDateText, { color: colors.icon }]}>
                          Por favor selecciona una fecha para ver los horarios disponibles
                        </Text>
                      </View>
                    );
                  }
                  
                  if (availableTimeSlots.length > 0) {
                    return availableTimeSlots.map((time) => (
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
                    ));
                  }
                  
                  return (
                    <View style={styles.noTimesContainer}>
                      <Text style={[styles.noTimesText, { color: colors.icon }]}>
                        No hay horarios disponibles para esta fecha y barbero.
                      </Text>
                    </View>
                  );
                })()}
              </View>
            </ScrollView>
          </ThemedView>
        );

      case 4:
        return (
          <ThemedView style={styles.stepContent}>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              Confirmar Cita
            </ThemedText>
            
            <ScrollView 
              style={styles.formContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Información del usuario */}
              <View style={[styles.summaryContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>Información del Cliente</Text>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.icon }]}>Nombre:</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {user?.user_metadata?.full_name || user?.email || 'Usuario'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.icon }]}>Email:</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{user?.email}</Text>
                </View>
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
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedService?.duration}</Text>
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
            title="Proceder al Pago"
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
  noTimesContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noTimesText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  selectDateContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectDateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
});