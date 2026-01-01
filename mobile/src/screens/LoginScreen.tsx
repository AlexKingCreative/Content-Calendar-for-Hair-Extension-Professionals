import React, { useState, useRef, useEffect } from 'react';
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
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/api';
import { AuthStackParamList } from '../navigation';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

type Step = 'login' | 'code';
type LoginMethod = 'password' | 'magic';

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<Step>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [magicLinkToken, setMagicLinkToken] = useState<string | null>(null);
  const { loginWithToken } = useAuth();
  
  const codeInputRefs = useRef<(TextInput | null)[]>([]);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response.authentication?.accessToken);
    }
  }, [response]);

  const handleGoogleResponse = async (accessToken?: string) => {
    if (!accessToken) {
      Alert.alert('Error', 'Failed to get Google authentication token');
      return;
    }

    setIsGoogleLoading(true);
    try {
      const result = await authApi.googleAuth(undefined, accessToken);
      await loginWithToken(result.token, result.user);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await promptAsync();
    } catch (error) {
      Alert.alert('Error', 'Failed to start Google sign-in');
    }
  };

  const handlePasswordLogin = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.login(email.toLowerCase().trim(), password);
      await loginWithToken(response.token, response.user);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestMagicLink = async () => {
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
        'We sent you a 6-digit code. Enter it below to sign in.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send magic link. Please try again.');
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
      setStep('login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.verifyMagicLink(magicLinkToken, verificationCode);
      await loginWithToken(response.token, response.user);
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
    await handleRequestMagicLink();
  };

  const handleBackToLogin = () => {
    setStep('login');
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
              onPress={handleBackToLogin}
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
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#5D4E3C" />
        </TouchableOpacity>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Hair Pro</Text>
          <Text style={styles.subtitle}>Content Calendar</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.instructionText}>
            {loginMethod === 'password' 
              ? 'Sign in with your email and password.'
              : "Enter your email and we'll send you a magic link to sign in instantly."
            }
          </Text>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, loginMethod === 'password' && styles.tabActive]}
              onPress={() => setLoginMethod('password')}
            >
              <Text style={[styles.tabText, loginMethod === 'password' && styles.tabTextActive]}>
                Password
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, loginMethod === 'magic' && styles.tabActive]}
              onPress={() => setLoginMethod('magic')}
            >
              <Text style={[styles.tabText, loginMethod === 'magic' && styles.tabTextActive]}>
                Magic Link
              </Text>
            </TouchableOpacity>
          </View>

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

          {loginMethod === 'password' && (
            <>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={loginMethod === 'password' ? handlePasswordLogin : handleRequestMagicLink}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {loginMethod === 'password' ? 'Sign In' : 'Send Magic Link'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.linkText}>
              <Text style={styles.linkTextBold}>Forgot password?</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, (isGoogleLoading || !request) && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading || !request}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color="#5D4E3C" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#5D4E3C" />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
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
  safeArea: {
    backgroundColor: '#FFF8F0',
  },
  backButton: {
    padding: 16,
    paddingTop: 8,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5E6D3',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
  },
  tabTextActive: {
    color: '#D4A574',
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5D5C5',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#8B7355',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5D5C5',
    borderRadius: 12,
    paddingVertical: 16,
  },
  googleButtonText: {
    color: '#5D4E3C',
    fontSize: 16,
    fontWeight: '600',
  },
});
