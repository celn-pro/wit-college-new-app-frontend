import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { BASE_URL } from '../utils';
import styled from '@emotion/native';
import { Header } from '../components/ui/Header';
import { Button } from '../components/ui/Button';
import { ModernConfirmCard, createLogoutConfirm } from '../components/ui/ModernConfirmCard';
import { cacheService } from '../services/cacheService';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Modern styled components for ProfileScreen
const ModernContainer = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

const ContentSection = styled.View`
  padding: 0 20px;
  margin-bottom: 16px;
`;

const ProfileCard = styled.View`
  background-color: ${(props) => props.theme.surface};
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.08;
  shadow-radius: 12px;
  elevation: 4;
  border: 1px solid ${(props) => props.theme.border};
`;

const ProfileHeader = styled.View`
  align-items: center;
  margin-bottom: 20px;
`;

const AvatarContainer = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${(props) => props.theme.primary}15;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
  border: 3px solid ${(props) => props.theme.primary}20;
`;

const UserName = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${(props) => props.theme.text.primary};
  margin-bottom: 4px;
`;

const UserEmail = styled.Text`
  font-size: 14px;
  color: ${(props) => props.theme.text.secondary};
  margin-bottom: 8px;
`;

const ModernRoleBadge = styled.View<{ userRole: 'admin' | 'faculty' | 'student' }>`
  background-color: ${(props) => {
    switch (props.userRole) {
      case 'admin': return props.theme.error + '15';
      case 'faculty': return props.theme.primary + '15';
      case 'student': return props.theme.accent + '15';
      default: return props.theme.primary + '15';
    }
  }};
  border: 1px solid ${(props) => {
    switch (props.userRole) {
      case 'admin': return props.theme.error + '40';
      case 'faculty': return props.theme.primary + '40';
      case 'student': return props.theme.accent + '40';
      default: return props.theme.primary + '40';
    }
  }};
  border-radius: 12px;
  padding: 6px 12px;
`;

const ModernRoleBadgeText = styled.Text<{ userRole: 'admin' | 'faculty' | 'student' }>`
  font-size: 12px;
  font-weight: 600;
  color: ${(props) => {
    switch (props.userRole) {
      case 'admin': return props.theme.error;
      case 'faculty': return props.theme.primary;
      case 'student': return props.theme.accent;
      default: return props.theme.primary;
    }
  }};
`;

const TabContainer = styled.View`
  flex-direction: row;
  background-color: ${(props) => props.theme.surface};
  border-radius: 16px;
  padding: 4px;
  margin: 20px 20px 16px 20px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.06;
  shadow-radius: 8px;
  elevation: 3;
  border: 1px solid ${(props) => props.theme.border};
`;

const TabButton = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  background-color: ${(props) =>
    props.active ? props.theme.primary : 'transparent'};
  border-radius: 12px;
  padding: 12px;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 6px;
`;

const TabText = styled.Text<{ active: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) =>
    props.active ? props.theme.text.inverse : props.theme.text.primary};
`;

const SectionCard = styled.View`
  background-color: ${(props) => props.theme.surface};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.06;
  shadow-radius: 8px;
  elevation: 3;
  border: 1px solid ${(props) => props.theme.border};
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${(props) => props.theme.text.primary};
  margin-bottom: 16px;
`;

const OptionItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.border};
`;

const OptionText = styled.Text`
  font-size: 16px;
  color: ${(props) => props.theme.text.primary};
  flex: 1;
`;

const OptionValue = styled.Text`
  font-size: 14px;
  color: ${(props) => props.theme.text.secondary};
  margin-right: 8px;
`;

const StatsContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 16px;
  border-top-width: 1px;
  border-top-color: ${(props) => props.theme.border};
`;

const StatItem = styled.View`
  align-items: center;
`;

const StatNumber = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => props.theme.primary};
`;

const StatLabel = styled.Text`
  font-size: 12px;
  color: ${(props) => props.theme.text.secondary};
  margin-top: 2px;
`;

const TABS = [
  { key: 'profile', label: 'Profile', icon: 'person-outline' },
  { key: 'dashboard', label: 'Dashboard', icon: 'analytics-outline' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline' },
];

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, toggleTheme, themeMode, token, archivedNewsIds, setUser, setToken, setAllNews, setArchivedNewsIds, setNotifications } = useAppStore();
  const theme = useTheme();
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [displayName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoutAlert, setLogoutAlert] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [stats, setStats] = useState({ newsCount: 0, userCount: 0, categoryStats: [] as { name: string; count: number }[] });
  const [showEmailPrompt, setShowEmailPrompt] = useState(!user?.email);
  const [activeTab, setActiveTab] = useState('profile');

  // Animation values
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);

  const getThemeDisplayText = () => (themeMode === 'light' ? 'Light' : 'Dark');
  const getThemeIcon = () => (themeMode === 'light' ? 'sunny' : 'moon');

  // Entrance animation
  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    cardOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  useEffect(() => {
    if (user?.isAdmin) {
      fetchAdminStats();
      fetchUsers();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      const [newsRes, usersRes, categoriesRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/news`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BASE_URL}/api/categories`, { headers: { Authorization: `Bearer ${token}` } }),
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
      const res = await axios.get(`${BASE_URL}/api/users`, {
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

  const performLogout = async () => {
    try {
      await cacheService.clearCache();
      setUser(null);
      setToken(null);
      setAllNews([]);
      setArchivedNewsIds([]);
      setNotifications([]);

      // Reset navigation stack to Auth screen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        })
      );

      Toast.show({ type: 'success', text1: 'Logged Out', text2: 'You have been logged out' });
    } catch (error) {
      console.error('Error during logout:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to log out' });
    }
  };

  const handleLogout = () => {
    const confirmConfig = createLogoutConfirm(
      () => {
        setLogoutAlert(null);
        performLogout();
      },
      () => {
        setLogoutAlert(null);
      }
    );

    setLogoutAlert(confirmConfig);
  };

  const handleCreateAdmin = async () => {
    if (!adminUsername || !adminPassword || !adminEmail) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Username, password, and email are required' });
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/make-admin`,
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
        `${BASE_URL}/api/users/${userId}/role`,
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
      await axios.delete(`${BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'User deleted' });
      fetchUsers();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete user' });
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = 'newpassword123';
    try {
      await axios.patch(
        `${BASE_URL}/api/users/${userId}/password`,
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
        `${BASE_URL}/api/faculty-code/request`,
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
        `${BASE_URL}/api/users/${user?._id}`,
        { email, displayName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = { ...user!, email: res.data.email, username: res.data.displayName || user!.username };
      setUser(updatedUser);
      await cacheService.setUser(updatedUser);
      setShowEmailPrompt(false);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Profile updated' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update profile' });
    }
  };

  const renderTabs = () => (
    <TabContainer>
      {TABS.map(tab => (
        <TabButton
          key={tab.key}
          active={activeTab === tab.key}
          onPress={() => setActiveTab(tab.key)}
        >
          <Icon
            name={tab.icon}
            size={16}
            color={activeTab === tab.key ? theme.text.inverse : theme.text.primary}
          />
          <TabText active={activeTab === tab.key}>{tab.label}</TabText>
        </TabButton>
      ))}
    </TabContainer>
  );

  // Modern Profile Tab
  const renderProfileTab = () => (
    <ContentSection>
      <ProfileCard>
        <ProfileHeader>
          <AvatarContainer>
            <Icon name="person" size={40} color={theme.primary} />
          </AvatarContainer>
          <UserName>{user?.username || 'User'}</UserName>
          <UserEmail>{user?.email || 'No email provided'}</UserEmail>
          <ModernRoleBadge userRole={user?.role as 'admin' | 'faculty' | 'student'}>
            <ModernRoleBadgeText userRole={user?.role as 'admin' | 'faculty' | 'student'}>
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
            </ModernRoleBadgeText>
          </ModernRoleBadge>
        </ProfileHeader>

        <StatsContainer>
          <StatItem>
            <StatNumber>{archivedNewsIds.length}</StatNumber>
            <StatLabel>Saved Articles</StatLabel>
          </StatItem>
          {user?.isAdmin && (
            <>
              <StatItem>
                <StatNumber>{stats.userCount}</StatNumber>
                <StatLabel>Total Users</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>{stats.newsCount}</StatNumber>
                <StatLabel>Published</StatLabel>
              </StatItem>
            </>
          )}
        </StatsContainer>
      </ProfileCard>
    </ContentSection>
  );

  const renderTabContent = () => {
    if (!user) {
      return (
        <ContentSection>
          <SectionCard>
            <SectionTitle>Please Log In</SectionTitle>
            <OptionItem onPress={() => navigation.navigate('Auth')}>
              <OptionText>Log In / Sign Up</OptionText>
              <Icon name="log-in" size={20} color={theme.text.primary} />
            </OptionItem>
          </SectionCard>
        </ContentSection>
      );
    }

    if (activeTab === 'profile') {
      return (
        <>
          {renderProfileTab()}

          {showEmailPrompt && (
            <ContentSection>
              <SectionCard>
                <SectionTitle>Complete Your Profile</SectionTitle>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 16,
                    color: theme.text.primary,
                    marginBottom: 8,
                    fontWeight: '600'
                  }}>Email Address</Text>
                  <View style={{
                    backgroundColor: theme.background,
                    borderWidth: 2,
                    borderColor: theme.border,
                    borderRadius: 12,
                  }}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: theme.text.primary,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                      }}
                    >
                      {email || 'Enter your email address'}
                    </Text>
                  </View>
                </View>
                <Button
                  title="Save Email"
                  onPress={handleUpdateProfile}
                  variant="primary"
                  size="md"
                  fullWidth
                />
              </SectionCard>
            </ContentSection>
          )}

          <ContentSection>
            <SectionCard>
              <SectionTitle>Account Settings</SectionTitle>

              <OptionItem onPress={() => {}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Icon name="person-outline" size={20} color={theme.text.secondary} style={{ marginRight: 12 }} />
                  <OptionText>Display Name</OptionText>
                </View>
                <OptionValue>{displayName}</OptionValue>
                <Icon name="chevron-forward" size={16} color={theme.text.tertiary} />
              </OptionItem>

              <OptionItem onPress={() => {}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Icon name="mail-outline" size={20} color={theme.text.secondary} style={{ marginRight: 12 }} />
                  <OptionText>Email</OptionText>
                </View>
                <OptionValue>{user.email || 'Not set'}</OptionValue>
                <Icon name="chevron-forward" size={16} color={theme.text.tertiary} />
              </OptionItem>

              <OptionItem onPress={() => {}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Icon name="time-outline" size={20} color={theme.text.secondary} style={{ marginRight: 12 }} />
                  <OptionText>Last Login</OptionText>
                </View>
                <OptionValue>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Unknown'}
                </OptionValue>
              </OptionItem>
            </SectionCard>
          </ContentSection>
        </>
      );
    }

    if (activeTab === 'dashboard') {
      if (user.role === 'admin') {
        return (
          <>
            <ContentSection>
              <SectionCard>
                <SectionTitle>📊 Admin Dashboard</SectionTitle>

                <StatsContainer>
                  <StatItem>
                    <StatNumber>{stats.newsCount}</StatNumber>
                    <StatLabel>Total News</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatNumber>{stats.userCount}</StatNumber>
                    <StatLabel>Total Users</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatNumber>{stats.categoryStats.length}</StatNumber>
                    <StatLabel>Categories</StatLabel>
                  </StatItem>
                </StatsContainer>

                {stats.categoryStats.length > 0 && (
                  <View style={{ marginTop: 20 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: theme.text.primary,
                      marginBottom: 12
                    }}>
                      Category Breakdown
                    </Text>
                    {stats.categoryStats.map((cat) => (
                      <View key={cat.name} style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingVertical: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.border
                      }}>
                        <Text style={{ color: theme.text.primary }}>{cat.name}</Text>
                        <Text style={{ color: theme.text.secondary, fontWeight: '600' }}>{cat.count}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </SectionCard>
            </ContentSection>
            <ContentSection>
              <SectionCard>
                <SectionTitle>👤 Create Admin</SectionTitle>

                <View style={{ gap: 16 }}>
                  <View>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: theme.text.primary,
                      marginBottom: 8
                    }}>Username</Text>
                    <View style={{
                      backgroundColor: theme.background,
                      borderWidth: 2,
                      borderColor: theme.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}>
                      <Text style={{ color: theme.text.primary }}>
                        {adminUsername || 'Enter username'}
                      </Text>
                    </View>
                  </View>

                  <View>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: theme.text.primary,
                      marginBottom: 8
                    }}>Password</Text>
                    <View style={{
                      backgroundColor: theme.background,
                      borderWidth: 2,
                      borderColor: theme.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}>
                      <Text style={{ color: theme.text.primary }}>
                        {adminPassword ? '••••••••' : 'Enter password'}
                      </Text>
                    </View>
                  </View>

                  <View>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: theme.text.primary,
                      marginBottom: 8
                    }}>Email</Text>
                    <View style={{
                      backgroundColor: theme.background,
                      borderWidth: 2,
                      borderColor: theme.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}>
                      <Text style={{ color: theme.text.primary }}>
                        {adminEmail || 'Enter email'}
                      </Text>
                    </View>
                  </View>

                  <Button
                    title="Create Admin"
                    onPress={handleCreateAdmin}
                    variant="primary"
                    size="md"
                    fullWidth
                  />
                </View>
              </SectionCard>
            </ContentSection>
            <ContentSection>
              <SectionCard>
                <SectionTitle>👥 Manage Users</SectionTitle>

                <View style={{
                  backgroundColor: theme.background,
                  borderWidth: 2,
                  borderColor: theme.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginBottom: 16,
                }}>
                  <Text style={{ color: theme.text.tertiary }}>
                    Search users: {searchQuery || 'Type to search...'}
                  </Text>
                </View>

                {filteredUsers.map((u) => (
                  <View key={u._id} style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: theme.text.primary,
                        marginBottom: 2
                      }}>
                        {u.username}
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: theme.text.secondary
                      }}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => handleChangeRole(u._id, u.role === 'student' ? 'faculty' : 'student')}
                        style={{
                          padding: 8,
                          borderRadius: 8,
                          backgroundColor: theme.primary + '15',
                        }}
                      >
                        <Icon name="swap-horizontal" size={16} color={theme.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleResetPassword(u._id)}
                        style={{
                          padding: 8,
                          borderRadius: 8,
                          backgroundColor: theme.accent + '15',
                        }}
                      >
                        <Icon name="key" size={16} color={theme.accent} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteUser(u._id)}
                        style={{
                          padding: 8,
                          borderRadius: 8,
                          backgroundColor: theme.error + '15',
                        }}
                      >
                        <Icon name="trash" size={16} color={theme.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </SectionCard>
            </ContentSection>
          </>
        );
      }

      // Student Dashboard
      if (user.role === 'student') {
        return (
          <ContentSection>
            <SectionCard>
              <SectionTitle>🎓 Student Dashboard</SectionTitle>

              <StatsContainer>
                <StatItem>
                  <StatNumber>{archivedNewsIds.length}</StatNumber>
                  <StatLabel>Saved Articles</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>—</StatNumber>
                  <StatLabel>Reading Time</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>—</StatNumber>
                  <StatLabel>Categories</StatLabel>
                </StatItem>
              </StatsContainer>

              <View style={{ marginTop: 20, gap: 0 }}>
                <OptionItem onPress={() => navigation.navigate('CategorySelection')}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Icon name="heart-outline" size={20} color={theme.text.secondary} style={{ marginRight: 12 }} />
                    <OptionText>Favorite Categories</OptionText>
                  </View>
                  <Icon name="chevron-forward" size={16} color={theme.text.tertiary} />
                </OptionItem>

                <OptionItem onPress={() => setNotificationsEnabled(!notificationsEnabled)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Icon
                      name={notificationsEnabled ? 'notifications' : 'notifications-off'}
                      size={20}
                      color={theme.text.secondary}
                      style={{ marginRight: 12 }}
                    />
                    <OptionText>Notifications</OptionText>
                  </View>
                  <OptionValue>{notificationsEnabled ? 'On' : 'Off'}</OptionValue>
                  <Icon name="chevron-forward" size={16} color={theme.text.tertiary} />
                </OptionItem>
              </View>
            </SectionCard>
          </ContentSection>
        );
      }

      // Faculty Dashboard
      return (
        <ContentSection>
          <SectionCard>
            <SectionTitle>👨‍🏫 Faculty Dashboard</SectionTitle>

            <StatsContainer>
              <StatItem>
                <StatNumber>{archivedNewsIds.length}</StatNumber>
                <StatLabel>Saved Articles</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>{stats.newsCount}</StatNumber>
                <StatLabel>Published</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>—</StatNumber>
                <StatLabel>Categories</StatLabel>
              </StatItem>
            </StatsContainer>

            <View style={{ marginTop: 20, gap: 0 }}>
              <OptionItem onPress={() => navigation.navigate('CategorySelection')}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Icon name="heart-outline" size={20} color={theme.text.secondary} style={{ marginRight: 12 }} />
                  <OptionText>Favorite Categories</OptionText>
                </View>
                <Icon name="chevron-forward" size={16} color={theme.text.tertiary} />
              </OptionItem>

              <OptionItem onPress={() => setNotificationsEnabled(!notificationsEnabled)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Icon
                    name={notificationsEnabled ? 'notifications' : 'notifications-off'}
                    size={20}
                    color={theme.text.secondary}
                    style={{ marginRight: 12 }}
                  />
                  <OptionText>Notifications</OptionText>
                </View>
                <OptionValue>{notificationsEnabled ? 'On' : 'Off'}</OptionValue>
                <Icon name="chevron-forward" size={16} color={theme.text.tertiary} />
              </OptionItem>

              <OptionItem onPress={handleRequestFacultyCode}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Icon name="mail-outline" size={20} color={theme.text.secondary} style={{ marginRight: 12 }} />
                  <OptionText>Request Faculty Code</OptionText>
                </View>
                <Icon name="chevron-forward" size={16} color={theme.text.tertiary} />
              </OptionItem>
            </View>
          </SectionCard>
        </ContentSection>
      );
    }

    if (activeTab === 'settings') {
      return (
        <ContentSection>
          <SectionCard>
            <SectionTitle>⚙️ Settings</SectionTitle>

            <OptionItem onPress={toggleTheme}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Icon name={getThemeIcon()} size={20} color={theme.text.secondary} style={{ marginRight: 12 }} />
                <OptionText>Theme</OptionText>
              </View>
              <OptionValue>{getThemeDisplayText()}</OptionValue>
              <Icon name="chevron-forward" size={16} color={theme.text.tertiary} />
            </OptionItem>

            <OptionItem onPress={() => navigation.navigate('CategorySelection')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Icon name="settings-outline" size={20} color={theme.text.secondary} style={{ marginRight: 12 }} />
                <OptionText>Manage Categories</OptionText>
              </View>
              <Icon name="chevron-forward" size={16} color={theme.text.tertiary} />
            </OptionItem>

            <OptionItem onPress={handleLogout}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Icon name="log-out-outline" size={20} color={theme.error} style={{ marginRight: 12 }} />
                <OptionText style={{ color: theme.error }}>Log Out</OptionText>
              </View>
              <Icon name="chevron-forward" size={16} color={theme.error} />
            </OptionItem>
          </SectionCard>
        </ContentSection>
      );
    }

    return null;
  };

  // Create the right component for logout
  const rightComponent = (
    <TouchableOpacity
      onPress={handleLogout}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.error + '20',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.error + '40',
      }}
      activeOpacity={0.7}
    >
      <Icon name="log-out-outline" size={20} color={theme.error} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'left', 'right', 'bottom']}>
      <ModernContainer>
        <Header
          title={`Welcome, ${user?.username || 'User'}!`}
          gradient={true}
          rightComponent={rightComponent}
        />



        {renderTabs()}

        <Animated.ScrollView
          style={cardAnimatedStyle}
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {renderTabContent()}
        </Animated.ScrollView>
      </ModernContainer>

      {/* Modern Logout Confirm Card */}
      <ModernConfirmCard
        visible={!!logoutAlert}
        onClose={() => setLogoutAlert(null)}
        title={logoutAlert?.title || ''}
        message={logoutAlert?.message || ''}
        type={logoutAlert?.type || 'info'}
        icon={logoutAlert?.icon}
        primaryButton={logoutAlert?.primaryButton}
        secondaryButton={logoutAlert?.secondaryButton}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;