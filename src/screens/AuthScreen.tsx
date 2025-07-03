import React, { useState, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View, StatusBar } from 'react-native';
import { useAppStore } from '../store';
import { useTheme } from '../theme';
import { BASE_URL } from '../utils';
import {
  Title,
  Subtitle,
  Input,
  InputContainer,
  InputLabel,
  RoleButton,
  RoleText,
  RoleIcon,
  RoleSection,
  RoleLabel,
  RoleButtonsContainer,
  ActionButton,
  ActionText,
  AccentButton,
  AccentButtonText,
  SwitchMode,
  SwitchModeText,
  NoteText,
  HeaderSection,
  PasswordContainer,
  PasswordToggle,
  CollegeIcon,
} from '../styles/authScreenStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AppIcon } from '../components/AppIcon';

const AuthScreen = () => {
  const { setUser, setToken } = useAppStore();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [facultyCode, setFacultyCode] = useState('');
  const [email, setEmail] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animation values
  const formScale = useSharedValue(0.9);
  const formOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    formScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    formOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: formScale.value }],
    opacity: formOpacity.value,
  }));


  const handleAuth = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password.');
      return;
    }

    if (isSignup && !email) {
      Alert.alert('Error', 'Please enter your college email.');
      return;
    }

    if (isSignup && role === 'faculty' && !facultyCode) {
      Alert.alert('Error', 'Faculty code is required for faculty signup.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignup ? 'signup' : 'login';
      const body = isSignup
        ? { username, password, email, role, facultyCode: role === 'faculty' ? facultyCode : undefined }
        : { username, password };

      const response = await fetch(`${BASE_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Authentication failed');

      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setToken(data.token);
      // Navigation will automatically update based on user state
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestFacultyCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your college email to request a code.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/faculty-code/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to request code');

      Alert.alert('Success', 'A faculty code has been sent to your email.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to request faculty code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Top safe area - system controlled */}
      <View style={{ height: insets.top, backgroundColor: 'transparent' }} />

      <LinearGradient
        colors={theme.gradient.hero}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 24,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={formAnimatedStyle}>
            <View style={{
              backgroundColor: theme.surface,
              borderRadius: 28,
              padding: 32,
              width: '100%',
              maxWidth: 400,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.18,
              shadowRadius: 24,
              elevation: 16,
              borderWidth: 1,
              borderColor: theme.border,
              marginVertical: 20,
              alignSelf: 'center',
              overflow: 'hidden',
            }}>
              {/* Header with icon and title */}
              <HeaderSection>
                <CollegeIcon>
                  <AppIcon width={40} height={40} variant="monochrome" />
                </CollegeIcon>
                <Title>{isSignup ? 'Join College News' : 'Welcome Back'}</Title>
                <Subtitle>
                  {isSignup
                    ? 'Create your account to stay connected with campus news'
                    : 'Sign in to access the latest college updates'
                  }
                </Subtitle>
              </HeaderSection>
              {/* Username Input */}
              <InputContainer>
                <InputLabel>Username</InputLabel>
                <Input
                  placeholder="Enter your username"
                  placeholderTextColor={theme.text.tertiary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </InputContainer>

              {/* Password Input */}
              <InputContainer>
                <InputLabel>Password</InputLabel>
                <PasswordContainer>
                  <Input
                    placeholder="Enter your password"
                    placeholderTextColor={theme.text.tertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={{ paddingRight: 50 }}
                  />
                  <PasswordToggle
                    onPress={() => setShowPassword(!showPassword)}
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={theme.text.secondary}
                    />
                  </PasswordToggle>
                </PasswordContainer>
              </InputContainer>

              {/* Signup-specific fields */}
              {isSignup && (
                <>
                  {/* Email Input */}
                  <InputContainer>
                    <InputLabel>College Email</InputLabel>
                    <Input
                      placeholder="your.email@college.edu"
                      placeholderTextColor={theme.text.tertiary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </InputContainer>

                  {/* Role Selection */}
                  <RoleSection>
                    <RoleLabel>I am a...</RoleLabel>
                    <RoleButtonsContainer>
                      <RoleButton
                        selected={role === 'student'}
                        onPress={() => setRole('student')}
                      >
                        <RoleIcon>
                          <Icon
                            name="school"
                            size={24}
                            color={role === 'student' ? theme.text.inverse : theme.text.primary}
                          />
                        </RoleIcon>
                        <RoleText selected={role === 'student'}>Student</RoleText>
                      </RoleButton>

                      <RoleButton
                        selected={role === 'faculty'}
                        onPress={() => setRole('faculty')}
                      >
                        <RoleIcon>
                          <Icon
                            name="library"
                            size={24}
                            color={role === 'faculty' ? theme.text.inverse : theme.text.primary}
                          />
                        </RoleIcon>
                        <RoleText selected={role === 'faculty'}>Faculty</RoleText>
                      </RoleButton>
                    </RoleButtonsContainer>
                  </RoleSection>

                  {/* Faculty Code Section */}
                  {role === 'faculty' && (
                    <>
                      <InputContainer>
                        <InputLabel>Faculty Code</InputLabel>
                        <Input
                          placeholder="Enter your faculty verification code"
                          placeholderTextColor={theme.text.tertiary}
                          value={facultyCode}
                          onChangeText={setFacultyCode}
                          autoCapitalize="characters"
                        />
                      </InputContainer>

                      <NoteText>
                        Don't have a faculty code? Request one using your college email address.
                      </NoteText>

                      <AccentButton onPress={handleRequestFacultyCode} disabled={loading}>
                        <AccentButtonText>
                          {loading ? 'Requesting...' : 'Request Faculty Code'}
                        </AccentButtonText>
                      </AccentButton>
                    </>
                  )}
                </>
              )}
              <ActionButton onPress={handleAuth} disabled={loading}>
                <ActionText>
                  {loading ? 'Processing...' : isSignup ? 'Create Account' : 'Sign In'}
                </ActionText>
              </ActionButton>
            <SwitchMode onPress={() => setIsSignup(!isSignup)}>
              <SwitchModeText>
                {isSignup ? 'Already have an account? Log In' : 'Don’t have an account? Sign Up'}
              </SwitchModeText>
            </SwitchMode>
            </View>
          </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* Bottom safe area - system controlled */}
      <View style={{ height: insets.bottom, backgroundColor: 'transparent' }} />
    </View>
  );
};

export default AuthScreen;