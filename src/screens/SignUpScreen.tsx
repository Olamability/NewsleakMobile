import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/auth.service';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { validateEmail, validatePassword, validateName } from '../utils/validation';
import { RootStackParamList } from '../navigation/types';

// Required for OAuth redirect
WebBrowser.maybeCompleteAuthSession();

interface SignUpScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    const nameValidation = validateName(fullName);
    if (!nameValidation.isValid) {
      newErrors.fullName = nameValidation.error || 'Full name is invalid';
      isValid = false;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error || 'Email is invalid';
      isValid = false;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error || 'Password is invalid';
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const result = await signUp({ email, password, full_name: fullName });
    setIsLoading(false);

    if (result.error) {
      Alert.alert('Sign Up Failed', result.error);
    } else {
      Alert.alert(
        'Success',
        'Account created successfully! Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
      );
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await AuthService.signInWithGoogle();

      if (result.error) {
        Alert.alert('Google Sign In Failed', result.error);
        setIsLoading(false);
        return;
      }

      if (result.data?.url) {
        const authResult = await WebBrowser.openAuthSessionAsync(
          result.data.url,
          'spazrnews://auth/callback'
        );

        if (authResult.type === 'success' && authResult.url) {
          const callbackResult = await AuthService.handleOAuthCallback(authResult.url);

          if (callbackResult.error) {
            Alert.alert('Sign In Failed', callbackResult.error);
          } else {
            navigation.navigate('Main');
          }
        }
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to sign in with Google');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await AuthService.signInWithApple();

      if (result.error) {
        Alert.alert('Apple Sign In Failed', result.error);
        setIsLoading(false);
        return;
      }

      if (result.data?.url) {
        const authResult = await WebBrowser.openAuthSessionAsync(
          result.data.url,
          'spazrnews://auth/callback'
        );

        if (authResult.type === 'success' && authResult.url) {
          const callbackResult = await AuthService.handleOAuthCallback(authResult.url);

          if (callbackResult.error) {
            Alert.alert('Sign In Failed', callbackResult.error);
          } else {
            navigation.navigate('Main');
          }
        }
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to sign in with Apple');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>
              Create an account to get personalized news{'\n'}and stay updated
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              autoCapitalize="words"
              leftIcon={<Text style={styles.inputIcon}>👤</Text>}
            />

            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Text style={styles.inputIcon}>✉️</Text>}
            />

            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              showPasswordToggle
              autoCapitalize="none"
              leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
            />

            <Input
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              showPasswordToggle
              autoCapitalize="none"
              leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
            />

            <Button
              title="Sign up"
              onPress={handleSignUp}
              isLoading={isLoading}
              fullWidth
              size="large"
              variant="gray"
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="Sign up with Google"
              onPress={handleGoogleSignIn}
              variant="social"
              fullWidth
              size="large"
              icon={<Text style={styles.socialIcon}>🔍</Text>}
              disabled={isLoading}
            />

            <Button
              title="Sign up with Apple"
              onPress={handleAppleSignIn}
              variant="social"
              fullWidth
              size="large"
              icon={<Text style={styles.socialIcon}>🍎</Text>}
              style={styles.socialButtonSpacing}
              disabled={isLoading}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.signInText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    paddingTop: SPACING.xxl * 2,
  },
  header: {
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputIcon: {
    fontSize: 18,
    color: COLORS.iconGray,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
  },
  socialIcon: {
    fontSize: 20,
  },
  socialButtonSpacing: {
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  signInText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '700',
  },
});
