import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from '@emotion/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import { useTheme } from '../theme';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { BASE_URL } from '../utils';
import ReanimatedAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

// Import our modern component library
import {
  Screen,
  Container,
  Row,
  Column,
  Header,
  Typography,
  Button,
  OptimizedFlatList,
} from '../components';

// Modern Styled Components for CategorySelectionScreen
const ModernContainer = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

const ContentSection = styled.View`
  padding: 0 20px;
  margin-bottom: 24px;
`;

const SectionCard = styled.View`
  background-color: ${(props) => props.theme.surface};
  border-radius: 24px;
  padding: 24px;
  shadow-color: #000;
  shadow-offset: 0px 8px;
  shadow-opacity: 0.12;
  shadow-radius: 16px;
  elevation: 8;
  border: 1px solid ${(props) => props.theme.border};
  margin-bottom: 16px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.text.primary};
  margin-bottom: 4px;
`;

const SectionSubtitle = styled.Text`
  font-size: 14px;
  color: ${(props) => props.theme.text.secondary};
  opacity: 0.8;
`;

const CategoryCard = styled(TouchableOpacity)<{ selected: boolean }>`
  background-color: ${(props) => props.selected ? props.theme.primary : props.theme.surface};
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border: 2px solid ${(props) => props.selected ? props.theme.primary : props.theme.border};
  shadow-color: ${(props) => props.selected ? props.theme.primary : '#000'};
  shadow-offset: 0px ${(props) => props.selected ? 8 : 4}px;
  shadow-opacity: ${(props) => props.selected ? 0.25 : 0.08};
  shadow-radius: ${(props) => props.selected ? 12 : 8}px;
  elevation: ${(props) => props.selected ? 8 : 4};
`;

const CategoryContent = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;

const CategoryIconContainer = styled.View<{ selected: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${(props) => props.selected ? props.theme.text.inverse + '20' : props.theme.primary + '15'};
  justify-content: center;
  align-items: center;
  margin-right: 16px;
`;

const CategoryTextContainer = styled.View`
  flex: 1;
`;

const CategoryName = styled.Text<{ selected: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.selected ? props.theme.text.inverse : props.theme.text.primary};
  margin-bottom: 2px;
`;

const CategoryCount = styled.Text<{ selected: boolean }>`
  font-size: 12px;
  color: ${(props) => props.selected ? props.theme.text.inverse + '80' : props.theme.text.secondary};
`;

const AdminInputCard = styled.View`
  background-color: ${(props) => props.theme.surface};
  border-radius: 20px;
  padding: 20px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 4;
  border: 1px solid ${(props) => props.theme.border};
`;

const AdminInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const AdminInput = styled.TextInput`
  flex: 1;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 16px;
  padding: 16px;
  font-size: 16px;
  color: ${(props) => props.theme.text.primary};
  border: 1px solid ${(props) => props.theme.border};
`;

const ActionButtonsRow = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const SkeletonCard = styled.View`
  height: 80px;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 20px;
  margin-bottom: 12px;
  padding: 20px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 4;
`;

const SkeletonLine = styled.View<{ width?: string; height?: number }>`
  height: ${(props) => props.height || 16}px;
  width: ${(props) => props.width || '100%'};
  background-color: ${(props) => props.theme.border};
  border-radius: 8px;
  margin-bottom: ${(props) => props.theme.spacing.sm}px;
`;

const PulseAnimation = styled(ReanimatedAnimated.View)`
  opacity: 0.6;
`;

const EmptyStateContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
`;

const EmptyStateIcon = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${(props) => props.theme.primary + '15'};
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
`;

const CategorySelectionScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, token } = useAppStore();
  const theme = useTheme();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Animation values
  const pulseValue = useSharedValue(0.6);
  const headerScale = useSharedValue(0.9);
  const headerOpacity = useSharedValue(0);

  // Pulse animation for skeleton loading
  useEffect(() => {
    if (isLoading) {
      pulseValue.value = withTiming(1, { duration: 1000 }, () => {
        pulseValue.value = withTiming(0.6, { duration: 1000 });
      });
    }
  }, [isLoading, pulseValue]);

  // Header entrance animation
  useEffect(() => {
    headerScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    headerOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseValue.value,
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  useEffect(() => {
    fetchCategories();
    fetchUserPreferences();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const categoryNames = res.data.map((cat: any) => cat.name);
      setCategories(categoryNames);

      // Categories loaded successfully
    } catch (error) {
      console.error('Error fetching categories:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load categories' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      // First try to fetch from userpreferences collection
      const res = await axios.get(`${BASE_URL}/api/userpreferences/${user?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && res.data.selectedCategories) {
        setSelectedCategories(res.data.selectedCategories);
      } else {
        // Fallback to checking user object for legacy support
        const userRes = await axios.get(`${BASE_URL}/api/users/${user?._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedCategories(userRes.data.selectedCategories || []);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      // If userpreferences endpoint fails, try the legacy endpoint
      try {
        const userRes = await axios.get(`${BASE_URL}/api/users/${user?._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedCategories(userRes.data.selectedCategories || []);
      } catch (fallbackError) {
        console.error('Error fetching user categories:', fallbackError);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load user preferences' });
      }
    }
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((cat) => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSave = async () => {
    if (selectedCategories.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Selection Required',
        text2: 'Please select at least one category'
      });
      return;
    }

    setIsSaving(true);
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
        text1: 'Success! 🎉',
        text2: `${selectedCategories.length} categories saved`
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error saving categories:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to save categories' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Input',
        text2: 'Category name is required'
      });
      return;
    }
    if (newCategory.length < 3 || newCategory.length > 50) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Length',
        text2: 'Category name must be 3–50 characters'
      });
      return;
    }
    if (categories.includes(newCategory.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Duplicate Category',
        text2: 'This category already exists'
      });
      return;
    }
    try {
      await axios.post(
        `${BASE_URL}/api/categories`,
        { name: newCategory.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Toast.show({
        type: 'success',
        text1: 'Category Added! ✨',
        text2: `"${newCategory}" is now available`
      });
      setNewCategory('');
      fetchCategories();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to add category'
      });
    }
  };

  const handleDeleteCategory = async (category: string) => {
    try {
      await axios.delete(`${BASE_URL}/api/categories/${category}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Toast.show({
        type: 'success',
        text1: 'Category Deleted',
        text2: `"${category}" has been removed`
      });
      fetchCategories();
      if (selectedCategories.includes(category)) {
        setSelectedCategories(selectedCategories.filter((cat) => cat !== category));
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete category' });
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'Sports': 'football-outline',
      'Technology': 'laptop-outline',
      'Science': 'flask-outline',
      'Arts': 'brush-outline',
      'Music': 'musical-notes-outline',
      'Events': 'calendar-outline',
      'Academic': 'school-outline',
      'Campus': 'business-outline',
      'Health': 'fitness-outline',
      'Food': 'restaurant-outline',
      'All': 'apps-outline',
    };
    return iconMap[category] || 'bookmark-outline';
  };

  const renderCategory = ({ item, index }: { item: string; index: number }) => {
    const isSelected = selectedCategories.includes(item);

    return (
      <View
      >
        <CategoryCard
          selected={isSelected}
          onPress={() => toggleCategory(item)}
          activeOpacity={0.8}
        >
          <CategoryContent>
            <CategoryIconContainer selected={isSelected}>
              <Icon
                name={getCategoryIcon(item)}
                size={20}
                color={isSelected ? theme.text.inverse : theme.primary}
              />
            </CategoryIconContainer>
            <CategoryTextContainer>
              <CategoryName selected={isSelected}>{item}</CategoryName>
              <CategoryCount selected={isSelected}>
                {isSelected ? 'Selected' : 'Tap to select'}
              </CategoryCount>
            </CategoryTextContainer>
          </CategoryContent>

          <Row align="center">
            {isSelected && (
              <Icon
                name="checkmark-circle"
                size={24}
                color={theme.text.inverse}
                style={{ marginRight: user?.isAdmin ? 12 : 0 }}
              />
            )}
            {user?.isAdmin && (
              <TouchableOpacity
                onPress={() => handleDeleteCategory(item)}
                style={{
                  padding: 8,
                  borderRadius: 12,
                  backgroundColor: theme.error + '15',
                }}
                activeOpacity={0.7}
              >
                <Icon name="trash-outline" size={16} color={theme.error} />
              </TouchableOpacity>
            )}
          </Row>
        </CategoryCard>
      </View>
    );
  };

  const renderSkeletonLoader = () => (
    <Column>
      <Container flex={1} paddingVertical="md">
        <PulseAnimation style={pulseStyle}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <SkeletonCard key={item}>
              <Row>
                <SkeletonLine height={44} width="44px" />
                <Column flex={1} style={{ marginLeft: theme.spacing.md }}>
                  <SkeletonLine height={16} width="70%" />
                  <SkeletonLine height={12} width="40%" />
                </Column>
              </Row>
            </SkeletonCard>
          ))}
        </PulseAnimation>
      </Container>
    </Column>
  );

  const renderEmptyState = () => (
    <EmptyStateContainer>
      <EmptyStateIcon>
        <Icon name="bookmark-outline" size={32} color={theme.primary} />
      </EmptyStateIcon>
      <Typography
        variant="h4"
        color="primary"
        align="center"
        style={{ marginBottom: theme.spacing.sm }}
      >
        No Categories Available
      </Typography>
      <Typography
        variant="body2"
        color="secondary"
        align="center"
        style={{ marginBottom: theme.spacing.lg }}
      >
        {user?.isAdmin
          ? 'Create your first category to get started'
          : 'Categories will appear here once they are created'
        }
      </Typography>
      {user?.isAdmin && (
        <Button
          title="Create Category"
          onPress={() => {/* Focus on input */}}
          variant="primary"
          icon={<Icon name="add" size={16} color={theme.text.inverse} />}
        />
      )}
    </EmptyStateContainer>
  );

  const renderAdminSection = () => {
    if (!user?.isAdmin) return null;

    return (
      <ContentSection>
        <SectionCard>
          <SectionHeader>
            <View>
              <SectionTitle>⚙️ Admin Tools</SectionTitle>
              <SectionSubtitle>Create and manage categories</SectionSubtitle>
            </View>
          </SectionHeader>

          <AdminInputCard>
            <AdminInputContainer>
              <AdminInput
                placeholder="Enter new category name..."
                placeholderTextColor={theme.text.secondary}
                value={newCategory}
                onChangeText={setNewCategory}
                returnKeyType="done"
                onSubmitEditing={handleAddCategory}
              />
              <ActionButtonsRow>
                <Button
                  title="Add"
                  onPress={handleAddCategory}
                  variant="primary"
                  size="sm"
                  disabled={!newCategory.trim()}
                  icon={<Icon name="add" size={14} color={theme.text.inverse} />}
                />
                {newCategory.length > 0 && (
                  <Button
                    title="Clear"
                    onPress={() => setNewCategory('')}
                    variant="outline"
                    size="sm"
                    icon={<Icon name="close" size={14} color={theme.primary} />}
                  />
                )}
              </ActionButtonsRow>
            </AdminInputContainer>
          </AdminInputCard>
        </SectionCard>
      </ContentSection>
    );
  };

  const renderHeader = () => {
    const rightComponent = (
      <Button
        title={isSaving ? 'Saving...' : 'Save'}
        onPress={handleSave}
        variant="primary"
        size="sm"
        loading={isSaving}
        disabled={selectedCategories.length === 0}
        icon={!isSaving ? <Icon name="checkmark" size={16} color={theme.text.inverse} /> : undefined}
      />
    );

    const subtitle = `${selectedCategories.length} of ${categories.length} selected`;

    return (
      <ReanimatedAnimated.View style={headerAnimatedStyle}>
        <Header
          title="Select Categories"
          subtitle={subtitle}
          gradient={true}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          rightComponent={rightComponent}
        />
      </ReanimatedAnimated.View>
    );
  };



  // Loading state
  if (isLoading) {
    return (
      <Screen edges={['top', 'bottom']}>
        {renderHeader()}
        {renderSkeletonLoader()}
      </Screen>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <Screen edges={['top', 'bottom']}>
        {renderHeader()}
        {renderAdminSection()}
        {renderEmptyState()}
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <ModernContainer>
        {renderHeader()}

        {renderAdminSection()}

        <ContentSection>
          <SectionCard>
            <SectionHeader>
              <View>
                <SectionTitle>📚 Available Categories</SectionTitle>
                <SectionSubtitle>
                  Choose categories that interest you most
                </SectionSubtitle>
              </View>
            </SectionHeader>

            <OptimizedFlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => `category-${item}`}
              showsVerticalScrollIndicator={false}
              contentPadding={false}
              style={{ backgroundColor: 'transparent', minHeight: 200 }}
              contentContainerStyle={{ flexGrow: 1 }}
            />
          </SectionCard>
        </ContentSection>
      </ModernContainer>
    </Screen>
  );
};

export default CategorySelectionScreen;