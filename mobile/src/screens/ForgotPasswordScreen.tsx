import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../services/api';
import { AuthStackParamList } from '../navigation';
import { useAuth } from '../hooks/useAuth';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

type Step = 'email' | 'code';

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkToken, setMagicLinkToken] = useState<string | null>(null);
  const { loginWithToken } = useAuth();
  
  const codeInputRefs = useRef<(TextInput | null)[]>([]);

  const handleRequestResetLink = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.requestMagicLink(email.toLowerCase().trim());
      setMagicLinkToken(response.token);
      setStep('code');
      Alert.alert(
        'Check Your Email',
        'We sent you a 6-digit code. Enter it below to reset your password.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (fullCode?: string) => {
    const verificationCode = fullCode || code.join('');
    
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code from your email');
      return;
    }

    if (!magicLinkToken) {
      Alert.alert('Error', 'Session expired. Please request a new code.');
      setStep('email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.verifyMagicLink(magicLinkToken, verificationCode);
      await loginWithToken(response.token, response.user);
      Alert.alert(
        'Success',
        'You are now signed in. You can update your password in Account Settings.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid or expired code. Please try again.');
      setCode(['', '', '', '', '', '']);
      codeInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCode(['', '', '', '', '', '']);
    await handleRequestResetLink();
  };

  const handleBackToEmail = () => {
    setStep('email');
    setCode(['', '', '', '', '', '']);
    setMagicLinkToken(null);
  };

  if (step === 'code') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Hair Pro</Text>
            <Text style={styles.subtitle}>Content Calendar</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.codeTitle}>Enter your code</Text>
            <Text style={styles.codeSubtitle}>
              We sent a 6-digit code to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>

            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (codeInputRefs.current[index] = ref)}
                  style={styles.codeInput}
                  value={digit}
                  onChangeText={(value) => handleCodeChange(index, value)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  autoFocus={index === 0}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={() => handleVerifyCode()}
              disabled={isLoading || code.some(d => !d)}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={handleResendCode}
              disabled={isLoading}
            >
              <Text style={styles.linkText}>
                Didn't get the code? <Text style={styles.linkTextBold}>Resend</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={handleBackToEmail}
            >
              <Text style={styles.linkText}>
                <Text style={styles.linkTextBold}>Use a different email</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Hair Pro</Text>
          <Text style={styles.subtitle}>Content Calendar</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.welcomeText}>Reset Password</Text>
          <Text style={styles.instructionText}>
            Enter your email and we'll send you a code to sign in. Once signed in, you can update your password.
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRequestResetLink}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Code</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.linkText}>
              <Text style={styles.linkTextBold}>Back to Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D4A574',
  },
  subtitle: {
    fontSize: 18,
    color: '#8B7355',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#5D4E3C',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5D5C5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#D4A574',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#8B7355',
    fontSize: 14,
  },
  linkTextBold: {
    fontWeight: '600',
    color: '#D4A574',
  },
  codeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#5D4E3C',
    textAlign: 'center',
    marginBottom: 8,
  },
  codeSubtitle: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  emailHighlight: {
    fontWeight: '600',
    color: '#D4A574',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  codeInput: {
    width: 48,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5D5C5',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#5D4E3C',
  },
});
