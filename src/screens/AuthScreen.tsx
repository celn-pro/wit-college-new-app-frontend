import React, { useState } from 'react';
import { View, Alert, Text } from 'react-native';
import { useAppStore } from '../store';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { BASE_URL } from '../utils';
import { Title, Container,Input,RoleButton,RoleText,ActionButton,ActionText,SwitchMode,SwitchModeText,
  RoleLabel,NoteText } from '../styles/authScreenStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { setUser, setToken } = useAppStore();
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [facultyCode, setFacultyCode] = useState('');
  const [email, setEmail] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

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

      // Inside handleAuth success block:
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setToken(data.token);
      navigation.navigate('Home');
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
    <Container>
      <Title>{isSignup ? 'Sign Up' : 'Log In'}</Title>
      <Input
        placeholder="Username"
        placeholderTextColor={theme.text + '80'}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <Input
        placeholder="Password"
        placeholderTextColor={theme.text + '80'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {isSignup && (
        <>
          <Input
            placeholder="College Email"
            placeholderTextColor={theme.text + '80'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <RoleLabel>Select Role</RoleLabel>
          <RoleButton
            selected={role === 'student'}
            onPress={() => setRole('student')}
          >
            <RoleText>Student</RoleText>
          </RoleButton>
          <RoleButton
            selected={role === 'faculty'}
            onPress={() => setRole('faculty')}
          >
            <RoleText>Faculty</RoleText>
          </RoleButton>
          {role === 'faculty' && (
            <>
              <Input
                placeholder="Faculty Code (required)"
                placeholderTextColor={theme.text + '80'}
                value={facultyCode}
                onChangeText={setFacultyCode}
              />
              <NoteText>
                Check your college email for your faculty code or request one below.
              </NoteText>
              <ActionButton onPress={handleRequestFacultyCode} disabled={loading}>
                <ActionText>{loading ? 'Requesting...' : 'Request Faculty Code'}</ActionText>
              </ActionButton>
            </>
          )}
        </>
      )}
      <ActionButton onPress={handleAuth} disabled={loading}>
        <ActionText>{loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Log In'}</ActionText>
      </ActionButton>
      <SwitchMode onPress={() => setIsSignup(!isSignup)}>
        <SwitchModeText>
          {isSignup ? 'Already have an account? Log In' : 'Don’t have an account? Sign Up'}
        </SwitchModeText>
      </SwitchMode>
    </Container>
  );
};

export default AuthScreen;