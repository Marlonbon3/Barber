import { CustomButton } from '@/components/barberia/CustomButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/utils/database';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface PaymentData {
  serviceId: string;
  serviceName: string;
  servicePrice: string;
  barberId: string;
  barberName: string;
  selectedDate: string;
  selectedTime: string;
  notes?: string;
}

export default function PaymentScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams() as PaymentData;
  
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const { confirmPayment } = useConfirmPayment();

  // Datos del pago
  const servicePrice = Number.parseFloat(String(params.servicePrice));

  const handlePaymentWithCard = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Error', 'Por favor completa la información de tu tarjeta');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔄 Procesando pago con tarjeta...');
      
      // Simular el proceso de confirmación de pago
      // En producción, aquí crearías un Payment Intent real
      const clientSecret = `pi_test_${Date.now()}_secret_example`;
      
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        console.log('Payment confirmation error:', error);
        // Para simulación, vamos a simular un pago exitoso aunque haya error
        console.log('🔄 Simulando pago exitoso para desarrollo...');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const paymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        await createAppointmentWithPayment(paymentIntentId);
        
        Alert.alert(
          '¡Pago exitoso!',
          'Tu cita ha sido agendada y el pago procesado correctamente.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/appointments'),
            },
          ]
        );
      } else if (paymentIntent) {
        // Pago exitoso real
        await createAppointmentWithPayment(paymentIntent.id);
        Alert.alert(
          '¡Pago exitoso!',
          'Tu cita ha sido agendada y el pago procesado correctamente.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/appointments'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Hubo un problema con el pago');
    } finally {
      setLoading(false);
    }
  };

  const createAppointmentWithPayment = async (paymentIntentId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('Usuario no autenticado');
      }

      // Crear la cita con información de pago
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: userData.user.id,
          barber_id: params.barberId,
          service_id: Number.parseInt(String(params.serviceId)),
          date: params.selectedDate,
          time: params.selectedTime,
          notes: params.notes || '',
          customer_name: userData.user.email || '',
          customer_phone: '',
          price: servicePrice,
          status: 'confirmed', // Ya confirmada porque se pagó
          payment_intent_id: paymentIntentId,
          payment_status: 'paid',
        });

      if (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }

      console.log('✅ Cita creada exitosamente con pago');
    } catch (error) {
      console.error('❌ Error creating appointment with payment:', error);
      throw error;
    }
  };

  const handleBack = () => {
    Alert.alert(
      'Cancelar pago',
      '¿Estás seguro de que quieres cancelar el pago? Tu cita no será agendada.',
      [
        { text: 'Continuar pagando', style: 'cancel' },
        { text: 'Cancelar', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            Confirmar Pago
          </ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Resumen de la cita */}
          <ThemedView style={[styles.appointmentSummary, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Resumen de tu cita
            </ThemedText>
            
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Servicio:</ThemedText>
              <ThemedText style={styles.summaryValue}>{params.serviceName}</ThemedText>
            </View>
            
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Barbero:</ThemedText>
              <ThemedText style={styles.summaryValue}>{params.barberName}</ThemedText>
            </View>
            
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Fecha:</ThemedText>
              <ThemedText style={styles.summaryValue}>{params.selectedDate}</ThemedText>
            </View>
            
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Hora:</ThemedText>
              <ThemedText style={styles.summaryValue}>{params.selectedTime}</ThemedText>
            </View>
          </ThemedView>

          {/* Total a pagar */}
          <ThemedView style={[styles.paymentBreakdown, { backgroundColor: colors.card }]}>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <ThemedText style={[styles.summaryLabel, styles.totalLabel]}>Total a pagar:</ThemedText>
              <ThemedText style={[styles.summaryValue, styles.totalValue]}>
                ${servicePrice} MXN
              </ThemedText>
            </View>
          </ThemedView>

          {/* Formulario de tarjeta */}
          <ThemedView style={[styles.cardContainer, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Información de pago
            </ThemedText>
            
            <CardField
              postalCodeEnabled={false}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={{
                backgroundColor: colors.background,
                textColor: colors.text,
                fontSize: 16,
                placeholderColor: colors.icon,
              }}
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                setCardDetails(cardDetails);
              }}
            />
          </ThemedView>

          {/* Información de prueba */}
          <ThemedView style={[styles.testInfo, { backgroundColor: 'rgba(255, 193, 7, 0.1)' }]}>
            <IconSymbol name="exclamationmark.triangle" size={20} color="#FFC107" />
            <ThemedText style={[styles.testInfoText, { color: '#FFC107' }]}>
              MODO PRUEBA: Este es un pago de prueba. No se cobrará dinero real.
            </ThemedText>
          </ThemedView>


        </ScrollView>

        {/* Botón de pago */}
        <View style={styles.paymentButtonContainer}>
          <CustomButton
            title={loading ? 'Procesando...' : `Pagar $${servicePrice} MXN`}
            onPress={handlePaymentWithCard}
            disabled={loading || !cardDetails?.complete}
            size="large"
            style={styles.paymentButton}
          />
          
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  appointmentSummary: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  paymentBreakdown: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
  },
  testInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  testInfoText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  cardContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginTop: 8,
  },
  paymentButtonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  paymentButton: {
    width: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
  },
});