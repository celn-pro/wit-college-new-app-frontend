import React, { useState } from 'react';
import { View, Alert, Text } from 'react-native';
import styled from '@emotion/native';
import { useAppStore } from '../store';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { BASE_URL } from '../utils';

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.background};
  padding: 20px;
  justify-content: center;
`;

const Title = styled.Text`
  font-size: 28px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
  margin-bottom: 20px;
  text-align: center;
`;

const Input = styled.TextInput`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
`;

const RoleButton = styled.TouchableOpacity<{ selected: boolean }>`
  background-color: ${(props) => (props.selected ? props.theme.primary : props.theme.cardBackground)};
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
  align-items: center;
`;

const RoleText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
`;

const ActionButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.primary};
  border-radius: 10px;
  padding: 15px;
  align-items: center;
  margin-top: 20px;
`;

const ActionText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Bold';
  color: #ffffff;
`;

const SwitchMode = styled.TouchableOpacity`
  margin-top: 15px;
  align-items: center;
`;

const SwitchModeText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  text-decoration-line: underline;
`;

const RoleLabel = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Medium';
  color: ${(props) => props.theme.text};
  margin-bottom: 10px;
`;

const NoteText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text + '80'};
  margin-bottom: 15px;
  text-align: center;
`;

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