import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation';

const SERVICE_CATEGORIES = [
  { id: 'cutting', label: 'Cutting Services', icon: 'cut-outline' as const },
  { id: 'coloring', label: 'Coloring Services', icon: 'color-palette-outline' as const },
  { id: 'extensions', label: 'Extension Services', icon: 'sparkles-outline' as const },
  { id: 'toppers', label: 'Topper Services', icon: 'layers-outline' as const },
  { id: 'wigs', label: 'Wig Services', icon: 'happy-outline' as const },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const handleContinue = () => {
    navigation.navigate('Register');
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <View style={styles.logoContainer}>
          <Ionicons name="calendar" size={24} color="#D4A574" />
          <Text style={styles.logoText}>Content Calendar</Text>
        </View>
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>What services do you offer?</Text>
          <Text style={styles.subtitle}>
            Select the services you want content ideas for
          </Text>
        </View>

        <View style={styles.servicesGrid}>
          {SERVICE_CATEGORIES.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selectedServices.includes(service.id) && styles.serviceCardSelected,
              ]}
              onPress={() => toggleService(service.id)}
            >
              <Ionicons
                name={service.icon}
                size={32}
                color={selectedServices.includes(service.id) ? '#D4A574' : '#8B7355'}
              />
              <Text
                style={[
                  styles.serviceLabel,
                  selectedServices.includes(service.id) && styles.serviceLabelSelected,
                ]}
              >
                {service.label}
              </Text>
              {selectedServices.includes(service.id) && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, selectedServices.length === 0 && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={selectedServices.length === 0}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5D5C5',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4E3C',
  },
  signInButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  signInText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4A574',
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D4E3C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B7355',
  },
  servicesGrid: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  serviceCardSelected: {
    borderColor: '#D4A574',
    backgroundColor: '#FFF8F0',
  },
  serviceLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#5D4E3C',
  },
  serviceLabelSelected: {
    color: '#D4A574',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D4A574',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5D5C5',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4A574',
    borderRadius: 12,
    padding: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
