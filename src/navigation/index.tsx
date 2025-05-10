import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import NewsDetailScreen from '../screens/NewsDetailScreen';
import CategorySelectionScreen from '../screens/CategorySelectionScreen';
import { useTheme } from '../theme';
import SearchScreen from '../screens/SearchScreen';
import ArchiveScreen from '../screens/ArchiveScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import CreateScreen from '../screens/Createscreen';
import { useAppStore } from '../store';

export type RootStackParamList = {
  Auth: undefined;
  CategorySelection: undefined;
  Home: undefined;
  NewsDetail: { newsId: string };
  Search: undefined;
  Archive: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  Notifications: undefined;
  Archive: undefined;
  Profile: undefined;
  Create: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = () => {
  const theme = useTheme();
  const isAdmin = useAppStore((state) => state.user?.isAdmin);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          if (route.name === 'HomeTab') iconName = 'home';
          else if (route.name === 'Notifications') iconName = 'notifications';
          else if (route.name === 'Archive') iconName = 'archive';
          else if (route.name === 'Profile') iconName = 'person';
          else iconName = 'add';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: { backgroundColor: theme.cardBackground },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications', headerShown: false }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Create"
          component={CreateScreen}
          options={{ title: 'Create', headerShown: false }}
        />
      )}
      
      <Tab.Screen
        name="Archive"
        component={ArchiveScreen}
        options={{ title: 'Archived', headerShown: false }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile', headerShown: false }}
      />

    </Tab.Navigator>
  );
};

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CategorySelection"
          component={CategorySelectionScreen}
          options={{ title: 'Select Category', headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NewsDetail"
          component={NewsDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ title: 'Search News' }}
        />
        <Stack.Screen 
          name="Archive" 
          component={ArchiveScreen} 
          options={{ title: 'Archived News' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;