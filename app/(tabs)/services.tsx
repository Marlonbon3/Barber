import { ServiceCard } from '@/components/barberia/ServiceCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { supabase } from '@/utils/database';

export default function ServicesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    let channel: any = null;

    const fetch = async () => {
  const { data, error } = await supabase.from('services').select('*').order('id', { ascending: false });
      if (error) return console.error(error);
      setServices((data ?? []).map((s: any) => ({ id: s.id?.toString(), name: s.name, description: s.description ?? '', price: Number(s.price) || 0, duration: Number(s.duration) || 30, icon: s.icon ?? 'scissors' })));
    };

    fetch();

    try {
      channel = supabase
        .channel('public:services')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, (payload: any) => {
          const record = payload.new ?? payload.old;
          if (!record) return;
          setServices(prev => {
            switch (payload.eventType) {
              case 'INSERT':
                return [{ id: record.id?.toString(), name: record.name, description: record.description ?? '', price: Number(record.price) || 0, duration: Number(record.duration) || 30, icon: record.icon ?? 'scissors' }, ...prev.filter(s => s.id !== record.id?.toString())];
              case 'UPDATE':
                return prev.map(s => (s.id === record.id?.toString() ? { id: record.id?.toString(), name: record.name, description: record.description ?? '', price: Number(record.price) || 0, duration: Number(record.duration) || 30, icon: record.icon ?? 'scissors' } : s));
              case 'DELETE':
                return prev.filter(s => s.id !== record.id?.toString());
              default:
                return prev;
            }
          });
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime services subscription failed', e);
    }

    return () => {
      try {
        if (channel) supabase.removeChannel(channel);
      } catch {
        channel?.unsubscribe?.();
      }
    };
  }, []);

  const handleServicePress = (service: any) => {
    console.log('Servicio seleccionado:', service.name);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>Nuestros Servicios</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.icon }]}>Elige el servicio perfecto para ti</ThemedText>
      </ThemedView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} onPress={() => handleServicePress(service)} />
        ))}

        <ThemedView style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.icon }]}>* Los precios pueden variar según la complejidad del servicio</ThemedText>
          <ThemedText style={[styles.footerText, { color: colors.icon }]}>* Todos nuestros servicios incluyen consulta personalizada</ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
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
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  footer: {
    padding: 20,
    paddingTop: 30,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
    fontStyle: 'italic',
  },
});