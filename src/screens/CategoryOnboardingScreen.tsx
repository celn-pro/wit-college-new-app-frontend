import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import styled from '@emotion/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useTheme } from '../theme';
import { useAppStore } from '../store';
import { RootStackParamList } from '../navigation';
import { Header, Typography, Button, LoadingSpinner } from '../components';
import axios from 'axios';
import { BASE_URL } from '../utils';
import Toast from 'react-native-toast-message';

// Styled Components
const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

const ContentContainer = styled.View`
  flex: 1;
  padding: 20px;
`;

const WelcomeSection = styled.View`
  align-items: center;
  margin-bottom: 40px;
  padding: 30px 20px;
`;

const IconContainer = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${(props) => props.theme.primary}15;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

const WelcomeTitle = styled.Text`
  font-size: 28px;
  font-weight: 800;
  color: ${(props) => props.theme.text.primary};
  text-align: center;
  margin-bottom: 12px;
`;

const WelcomeSubtitle = styled.Text`
  font-size: 16px;
  color: ${(props) => props.theme.text.secondary};
  text-align: center;
  line-height: 24px;
`;

const CategoriesSection = styled.View`
  flex: 1;
  margin-bottom: 30px;
`;

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.text.primary};
  margin-bottom: 16px;
`;

const CategoryGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`;

const CategoryCard = styled.TouchableOpacity<{ selected: boolean }>`
  background-color: ${(props) => props.selected ? props.theme.primary : props.theme.surface};
  border: 2px solid ${(props) => props.selected ? props.theme.primary : props.theme.border};
  border-radius: 16px;
  padding: 16px;
  min-width: 100px;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: ${(props) => props.selected ? 0.15 : 0.05};
  shadow-radius: 8px;
  elevation: ${(props) => props.selected ? 4 : 2};
`;

const CategoryIcon = styled.View<{ selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${(props) => props.selected ? props.theme.text.inverse + '20' : props.theme.primary + '15'};
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
`;

const CategoryName = styled.Text<{ selected: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.selected ? props.theme.text.inverse : props.theme.text.primary};
  text-align: center;
`;

const BottomSection = styled.View`
  padding: 20px 0;
`;

const SkipButton = styled.TouchableOpacity`
  align-items: center;
  padding: 16px;
  margin-top: 12px;
`;

const SkipText = styled.Text`
  font-size: 16px;
  color: ${(props) => props.theme.text.secondary};
  font-weight: 500;
`;

// Category data with icons
const CATEGORY_DATA = [
  { name: 'Academic', icon: 'school-outline' },
  { name: 'Sports', icon: 'football-outline' },
  { name: 'Events', icon: 'calendar-outline' },
  { name: 'Clubs', icon: 'people-outline' },
  { name: 'Achievements', icon: 'trophy-outline' },
  { name: 'Deadline', icon: 'time-outline' },
  { name: 'Announcements', icon: 'megaphone-outline' },
  { name: 'Research', icon: 'flask-outline' },
  { name: 'Career', icon: 'briefcase-outline' },
  { name: 'Technology', icon: 'laptop-outline' },
  { name: 'Arts', icon: 'brush-outline' },
  { name: 'Health', icon: 'fitness-outline' },
];

const CategoryOnboardingScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const { user, token } = useAppStore();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableCats, setAvailableCats] = useState<string[]>([]);

  useEffect(() => {
    if (user && token) {
      fetchAvailableCategories();
    } else {
      // If no user/token yet, use default categories
      setAvailableCats(CATEGORY_DATA.map(cat => cat.name));
    }
  }, [user, token]);

  const fetchAvailableCategories = async () => {
    try {
      if (!token) {
        console.warn('No token available, using default categories');
        setAvailableCats(CATEGORY_DATA.map(cat => cat.name));
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const categoryNames = response.data.map((cat: any) => cat.name);
      setAvailableCats(categoryNames);
    } catch (error: any) {
      console.error('Error fetching categories:', error);

      // Fallback to default categories
      setAvailableCats(CATEGORY_DATA.map(cat => cat.name));

      Toast.show({
        type: 'info',
        text1: 'Using Default Categories',
        text2: 'Could not fetch categories from server',
      });
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev: string[]) =>
      prev.includes(category)
        ? prev.filter((c: string) => c !== category)
        : [...prev, category]
    );
  };

  const handleContinue = async () => {
    if (selectedCategories.length === 0) {
      Alert.alert(
        'Select Categories',
        'Please select at least one category to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      // Save to userpreferences collection
      await axios.post(
        `${BASE_URL}/api/userpreferences/update-categories`,
        {
          userId: user?._id,
          selectedCategories
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Also update the user object for backward compatibility
      await axios.patch(
        `${BASE_URL}/api/users/${user?._id}/categories`,
        { selectedCategories },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Categories saved successfully!'
      });

      // Navigate to home screen
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving categories:', error);
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Category Selection?',
      'You can always change your preferences later in the profile settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            // Just navigate to home without saving any categories
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  const getCategoryIcon = (categoryName: string): string => {
    const categoryData = CATEGORY_DATA.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    return categoryData?.icon || 'bookmark-outline';
  };

  const renderCategoryCard = (category: string, index: number) => {
    const isSelected = selectedCategories.includes(category);
    
    return (
      <Animated.View
        key={category}
        entering={FadeInDown.delay(index * 100)}
      >
        <CategoryCard
          selected={isSelected}
          onPress={() => toggleCategory(category)}
          activeOpacity={0.8}
        >
          <CategoryIcon selected={isSelected}>
            <Icon 
              name={getCategoryIcon(category)} 
              size={20} 
              color={isSelected ? theme.text.inverse : theme.primary}
            />
          </CategoryIcon>
          <CategoryName selected={isSelected}>
            {category}
          </CategoryName>
        </CategoryCard>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <Container>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
          <Header
            title="Setting up..."
            showBackButton={false}
            gradient
          />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <LoadingSpinner size="large" />
            <Typography 
              variant="body1" 
              color="secondary" 
              style={{ marginTop: 16, textAlign: 'center' }}
            >
              Saving your preferences...
            </Typography>
          </View>
        </SafeAreaView>
      </Container>
    );
  }

  return (
    <Container>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
        <Header
          title="Welcome!"
          showBackButton={false}
          gradient
        />
        
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <ContentContainer>
            <Animated.View entering={FadeInUp.delay(200)}>
              <WelcomeSection>
                <IconContainer>
                  <Icon name="newspaper-outline" size={40} color={theme.primary} />
                </IconContainer>
                <WelcomeTitle>Choose Your Interests</WelcomeTitle>
                <WelcomeSubtitle>
                  Select the categories you're interested in to get personalized news updates
                </WelcomeSubtitle>
              </WelcomeSection>
            </Animated.View>

            <CategoriesSection>
              <Animated.View entering={FadeInUp.delay(400)}>
                <SectionTitle>Available Categories</SectionTitle>
              </Animated.View>

              <CategoryGrid>
                {availableCats.map((category, index) =>
                  renderCategoryCard(category, index)
                )}
              </CategoryGrid>
            </CategoriesSection>

            <BottomSection>
              <Animated.View entering={FadeInUp.delay(600)}>
                <Button
                  title={`Continue with ${selectedCategories.length} ${selectedCategories.length === 1 ? 'category' : 'categories'}`}
                  onPress={handleContinue}
                  variant="primary"
                  size="lg"
                  disabled={selectedCategories.length === 0}
                />
                
                <SkipButton onPress={handleSkip}>
                  <SkipText>Skip for now</SkipText>
                </SkipButton>
              </Animated.View>
            </BottomSection>
          </ContentContainer>
        </ScrollView>
      </SafeAreaView>
    </Container>
  );
};

export default CategoryOnboardingScreen;
