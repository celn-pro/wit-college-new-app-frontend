import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated from 'react-native-reanimated';
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
import CategoryOnboardingScreen from '../screens/CategoryOnboardingScreen';
import { useAppStore} from '../store';
import { Typography } from '../components';

export type RootStackParamList = {
  Auth: undefined;
  CategorySelection: undefined;
  CategoryOnboarding: undefined;
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

// Modern Tab Bar Component
const ModernTabBar = ({ state, descriptors, navigation }: any) => {
  const theme = useTheme();
  const { getUnreadCount } = useAppStore();

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: theme.cardBackground,
      paddingBottom: Platform.OS === 'ios' ? 20 : 10,
      paddingTop: 10,
      paddingHorizontal: 20,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    }}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Icon mapping
        let iconName: string;
        let showBadge = false;
        let badgeCount = 0;

        switch (route.name) {
          case 'HomeTab':
            iconName = isFocused ? 'home' : 'home-outline';
            break;
          case 'Notifications':
            iconName = isFocused ? 'notifications' : 'notifications-outline';
            badgeCount = getUnreadCount();
            showBadge = badgeCount > 0;
            break;
          case 'Archive':
            iconName = isFocused ? 'archive' : 'archive-outline';
            break;
          case 'Profile':
            iconName = isFocused ? 'person' : 'person-outline';
            break;
          case 'Create':
            iconName = isFocused ? 'add-circle' : 'add-circle-outline';
            break;
          default:
            iconName = 'ellipse';
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 8,
              position: 'relative',
            }}
          >
            <Animated.View style={{
              transform: [{ scale: isFocused ? 1.1 : 1 }],
            }}>
              <Icon
                name={iconName}
                size={24}
                color={isFocused ? theme.primary : theme.text.secondary}
              />
              {showBadge && (
                <View style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  backgroundColor: theme.error,
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 4,
                }}>
                  <Typography
                    variant="caption"
                    color="inverse"
                    weight="bold"
                    style={{ fontSize: 10 }}
                  >
                    {badgeCount > 99 ? '99+' : badgeCount.toString()}
                  </Typography>
                </View>
              )}
            </Animated.View>
            <Typography
              variant="caption"
              color={isFocused ? 'primary' : 'secondary'}
              weight={isFocused ? 'semiBold' : 'normal'}
              style={{ marginTop: 4 }}
            >
              {label}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const MainTabs = () => {
  const isAdmin = useAppStore((state) => state.user?.isAdmin);

  return (
    <Tab.Navigator
      tabBar={(props) => <ModernTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
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
  const {user} = useAppStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={MainTabs} />
            <Stack.Screen name="CategorySelection" component={CategorySelectionScreen} />
            <Stack.Screen name="CategoryOnboarding" component={CategoryOnboardingScreen} />
            <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Archive" component={ArchiveScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;