import React, { useState, useEffect } from 'react';
import { View, Text, Animated, Easing, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import styled from '@emotion/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import Toast from 'react-native-toast-message';
import axios from 'axios';

interface RoleBadgeProps {
  userRole: 'admin' | 'faculty' | 'student';
}

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${(props) => props.theme.background};
  padding: 20px;
`;

const Card = styled(Animated.View)`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 15px;
  elevation: 4;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
  margin-bottom: 10px;
`;

const Option = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 15px;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 10px;
  margin-bottom: 10px;
`;

const OptionText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  flex: 1;
`;

const Input = styled.TextInput`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  border: 1px solid ${(props) => props.theme.border};
  margin-bottom: 10px;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.primary};
  border-radius: 8px;
  padding: 15px;
  align-items: center;
  margin-top: 10px;
`;

const ActionText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Bold';
  color: #ffffff;
`;

const StatText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  margin-bottom: 5px;
`;

const RoleBadge = styled(Animated.View)<RoleBadgeProps>`
  background-color: ${(props) => {
    switch (props.userRole) {
      case 'admin': return '#FF6B6B';
      case 'faculty': return '#4ECDC4';
      case 'student': return '#45B7D1';
      default: return props.theme.primary;
    }
  }};
  border-radius: 12px;
  padding: 5px 10px;
`;

const RoleBadgeText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Medium';
  color: #ffffff;
`;

const UserItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 8px;
  margin-bottom: 5px;
`;

const SearchInput = styled.TextInput`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  border: 1px solid ${(props) => props.theme.border};
  margin-bottom: 15px;
`;

const GradientHeader = styled.View`
  background-color: ${(props) => props.theme.primary};
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
`;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, theme, toggleTheme, token, archivedNewsIds, setUser } = useAppStore();
  const { primary, text } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [displayName, setDisplayName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [stats, setStats] = useState({ newsCount: 0, userCount: 0, categoryStats: [] as { name: string; count: number }[] });
  const [showEmailPrompt, setShowEmailPrompt] = useState(!user?.email);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    if (user?.isAdmin) {
      fetchAdminStats();
      fetchUsers();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      const [newsRes, usersRes, categoriesRes] = await Promise.all([
        axios.get('http://10.0.2.2:5000/api/news', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://10.0.2.2:5000/api/users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://10.0.2.2:5000/api/categories', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const categoryStats = categoriesRes.data.map((cat: any) => ({
        name: cat.name,
        count: newsRes.data.filter((news: any) => news.category === cat.name).length,
      }));
      setStats({ newsCount: newsRes.data.length, userCount: usersRes.data.length, categoryStats });
    } catch (error) {
      console.error('Error fetching stats:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load stats' });
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://10.0.2.2:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load users' });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setFilteredUsers(users.filter((u) => u.username.toLowerCase().includes(query.toLowerCase())));
    } else {
      setFilteredUsers(users);
    }
  };

  const handleLogout = () => {
    useAppStore.setState({ user: null, token: null });
    navigation.navigate('Auth');
    Toast.show({ type: 'success', text1: 'Logged Out', text2: 'You have been logged out' });
  };

  const handleCreateAdmin = async () => {
    if (!adminUsername || !adminPassword || !adminEmail) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Username, password, and email are required' });
      return;
    }
    try {
      const res = await axios.post(
        'http://10.0.2.2:5000/api/auth/make-admin',
        { username: adminUsername, password: adminPassword, email: adminEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Toast.show({ type: 'success', text1: 'Success', text2: `Admin ${res.data.user.username} created` });
      setAdminUsername('');
      setAdminPassword('');
      setAdminEmail('');
      fetchUsers();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || 'Failed to create admin' });
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'student' | 'faculty' | 'admin') => {
    try {
      await axios.patch(
        `http://10.0.2.2:5000/api/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Toast.show({ type: 'success', text1: 'Success', text2: `Role updated to ${newRole}` });
      fetchUsers();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update role' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(`http://10.0.2.2:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'User deleted' });
      fetchUsers();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete user' });
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = 'newpassword123'; // Generate a random password or use a prompt
    try {
      await axios.patch(
        `http://10.0.2.2:5000/api/users/${userId}/password`,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Toast.show({ type: 'success', text1: 'Success', text2: `New password: ${newPassword}` });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to reset password' });
    }
  };

  const handleRequestFacultyCode = async () => {
    if (!user?.email) {
      setShowEmailPrompt(true);
      return;
    }
    try {
      await axios.post(
        'http://10.0.2.2:5000/api/faculty-code/request',
        { email: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Toast.show({ type: 'success', text1: 'Success', text2: 'Faculty code sent to your email' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to request faculty code' });
    }
  };

  const handleUpdateProfile = async () => {
    if (!email) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Email is required' });
      return;
    }
    try {
      const res = await axios.patch(
        `http://10.0.2.2:5000/api/users/${user?._id}`,
        { email, displayName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser({ ...user!, email: res.data.email, username: res.data.displayName || user!.username });
      setShowEmailPrompt(false);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Profile updated' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update profile' });
    }
  };

  const renderContent = () => {
    if (!user) {
      return (
        <Card style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <SectionTitle>Please Log In</SectionTitle>
          <Option onPress={() => navigation.navigate('Auth')}>
            <OptionText>Log In / Sign Up</OptionText>
            <Icon name="log-in" size={20} color={text} />
          </Option>
        </Card>
      );
    }

    return (
      <>
        <GradientHeader>
          <Text style={{ fontSize: 24, fontFamily: 'Roboto-Bold', color: '#fff' }}>
            Welcome, {user.username}!
          </Text>
          <RoleBadge userRole={user.role as 'admin' | 'faculty' | 'student'} style={{ marginTop: 5 }}>
            <RoleBadgeText>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</RoleBadgeText>
          </RoleBadge>
        </GradientHeader>

        {showEmailPrompt && (
          <Card style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <SectionTitle>Complete Your Profile</SectionTitle>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <ActionButton onPress={handleUpdateProfile}>
              <ActionText>Save Email</ActionText>
            </ActionButton>
          </Card>
        )}

        <Card style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <SectionTitle>Profile</SectionTitle>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Icon name="person-circle" size={40} color={primary} />
            <View style={{ marginLeft: 10 }}>
              <Text style={{ fontSize: 18, fontFamily: 'Roboto-Bold', color: text }}>{user.username}</Text>
              <StatText>Email: {user.email || 'Not set'}</StatText>
              <StatText>Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Unknown'}</StatText>
            </View>
          </View>
          <Input
            placeholder="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
          />
          <Option onPress={toggleTheme}>
            <OptionText>Theme: {theme === 'light' ? 'Light' : 'Dark'}</OptionText>
            <Icon name={theme === 'light' ? 'moon' : 'sunny'} size={20} color={text} />
          </Option>
          <ActionButton onPress={handleUpdateProfile}>
            <ActionText>Update Profile</ActionText>
          </ActionButton>
        </Card>

        {user.role === 'admin' && (
          <>
            <Card style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
              <SectionTitle>Admin Dashboard</SectionTitle>
              <StatText>Total News: {stats.newsCount}</StatText>
              <StatText>Total Users: {stats.userCount}</StatText>
              {stats.categoryStats.map((cat) => (
                <StatText key={cat.name}>{cat.name}: {cat.count} news</StatText>
              ))}
            </Card>
            <Card style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
              <SectionTitle>Create Admin</SectionTitle>
              <Input
                placeholder="New Admin Username"
                value={adminUsername}
                onChangeText={setAdminUsername}
                autoCapitalize="none"
              />
              <Input
                placeholder="New Admin Password"
                value={adminPassword}
                onChangeText={setAdminPassword}
                secureTextEntry
              />
              <Input
                placeholder="New Admin Email"
                value={adminEmail}
                onChangeText={setAdminEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <ActionButton onPress={handleCreateAdmin}>
                <ActionText>Create Admin</ActionText>
              </ActionButton>
            </Card>
            <Card style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
              <SectionTitle>Manage Users</SectionTitle>
              <SearchInput
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {filteredUsers.map((u) => (
                <UserItem key={u._id}>
                  <Text style={{ fontSize: 16, fontFamily: 'Roboto-Regular', color: text }}>
                    {u.username} ({u.role})
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      onPress={() => handleChangeRole(u._id, u.role === 'student' ? 'faculty' : 'student')}
                      style={{ marginRight: 10 }}
                    >
                      <Icon name="swap-horizontal" size={20} color={primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleResetPassword(u._id)}
                      style={{ marginRight: 10 }}
                    >
                      <Icon name="key" size={20} color={primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteUser(u._id)}>
                      <Icon name="trash" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </UserItem>
              ))}
            </Card>
          </>
        )}

        {user.role === 'student' && (
          <Card style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <SectionTitle>Student Dashboard</SectionTitle>
            <StatText>Archived News: {archivedNewsIds.length}</StatText>
            <Option onPress={() => navigation.navigate('CategorySelection')}>
              <OptionText>Favorite Categories</OptionText>
              <Icon name="heart" size={20} color={text} />
            </Option>
            <Option onPress={() => setNotificationsEnabled(!notificationsEnabled)}>
              <OptionText>Notifications: {notificationsEnabled ? 'On' : 'Off'}</OptionText>
              <Icon name={notificationsEnabled ? 'notifications' : 'notifications-off'} size={20} color={text} />
            </Option>
            <ActionButton onPress={handleUpdateProfile}>
              <ActionText>Update Profile</ActionText>
            </ActionButton>
          </Card>
        )}

        {user.role === 'faculty' && (
          <Card style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <SectionTitle>Faculty Dashboard</SectionTitle>
            <StatText>Faculty News: {stats.newsCount}</StatText>
            <Option onPress={() => navigation.navigate('CategorySelection')}>
              <OptionText>Favorite Categories</OptionText>
              <Icon name="heart" size={20} color={text} />
            </Option>
            <Option onPress={() => setNotificationsEnabled(!notificationsEnabled)}>
              <OptionText>Notifications: {notificationsEnabled ? 'On' : 'Off'}</OptionText>
              <Icon name={notificationsEnabled ? 'notifications' : 'notifications-off'} size={20} color={text} />
            </Option>
            <Option onPress={handleRequestFacultyCode}>
              <OptionText>Request New Faculty Code</OptionText>
              <Icon name="mail" size={20} color={text} />
            </Option>
            <StatText>Teaching Schedule: (Coming soon)</StatText>
            <ActionButton onPress={handleUpdateProfile}>
              <ActionText>Update Profile</ActionText>
            </ActionButton>
          </Card>
        )}

        <Card style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <SectionTitle>Options</SectionTitle>
          <Option onPress={() => navigation.navigate('CategorySelection')}>
            <OptionText>Manage Categories</OptionText>
            <Icon name="settings" size={20} color={text} />
          </Option>
          <Option onPress={handleLogout}>
            <OptionText>Log Out</OptionText>
            <Icon name="log-out" size={20} color={text} />
          </Option>
        </Card>
      </>
    );
  };

  return <Container>{renderContent()}</Container>;
};

export default ProfileScreen;