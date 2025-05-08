import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Animated } from 'react-native';
import styled from '@emotion/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import Toast from 'react-native-toast-message';
import axios from 'axios';

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.background};
  padding: 20px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
`;

const SaveButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.primary};
  border-radius: 10px;
  padding: 10px 20px;
`;

const SaveText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Bold';
  color: #ffffff;
`;

const CategoryItem = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  padding: 15px;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 10px;
  margin-bottom: 10px;
`;

const CategoryText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  flex: 1;
`;

const AdminSection = styled.View`
  margin-bottom: 20px;
`;

const AdminInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const AdminInput = styled.TextInput`
  flex: 1;
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 10px;
  padding: 15px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  margin-right: 10px;
`;

const AddButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.primary};
  border-radius: 10px;
  padding: 15px;
`;

const AddButtonText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Bold';
  color: #ffffff;
`;

const ClearButton = styled.TouchableOpacity`
  background-color: #FF6B6B;
  border-radius: 10px;
  padding: 15px;
  margin-left: 10px;
`;

const ClearButtonText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Bold';
  color: #ffffff;
`;

const LoadingText = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  text-align: center;
  margin-top: 20px;
`;

const CategorySelectionScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, token } = useAppStore();
  const theme = useTheme();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [fadeAnims, setFadeAnims] = useState<Animated.Value[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchUserPreferences();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://10.0.2.2:5000/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const categoryNames = res.data.map((cat: any) => cat.name);
      setCategories(categoryNames);
  
      // Initialize fadeAnims with the correct length
      const anims = categoryNames.map(() => new Animated.Value(0));
      setFadeAnims(anims);
  
      // Start animations after fadeAnims is set
      categoryNames.forEach((_:any, index:any) => {
        Animated.timing(anims[index], {
          toValue: 1,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      });
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
      const res = await axios.get(`http://10.0.2.2:5000/api/userpreferences/${user?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data && res.data.selectedCategories) {
        setSelectedCategories(res.data.selectedCategories);
      } else {
        // Fallback to checking user object for legacy support
        const userRes = await axios.get(`http://10.0.2.2:5000/api/users/${user?._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedCategories(userRes.data.selectedCategories || []);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      // If userpreferences endpoint fails, try the legacy endpoint
      try {
        const userRes = await axios.get(`http://10.0.2.2:5000/api/users/${user?._id}`, {
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
    try {
      // Save to userpreferences collection
      await axios.post(
        `http://10.0.2.2:5000/api/userpreferences/update-categories`,
        { 
          userId: user?._id,
          selectedCategories 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Also update the user object for backward compatibility
      await axios.patch(
        `http://10.0.2.2:5000/api/users/${user?._id}/categories`,
        { selectedCategories },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Toast.show({ type: 'success', text1: 'Success', text2: 'Categories saved' });
      navigation.goBack();
    } catch (error) {
      console.error('Error saving categories:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to save categories' });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Category name is required' });
      return;
    }
    if (newCategory.length < 3 || newCategory.length > 50) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Category name must be 3–50 characters' });
      return;
    }
    try {
      await axios.post(
        'http://10.0.2.2:5000/api/categories',
        { name: newCategory.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Toast.show({ type: 'success', text1: 'Success', text2: `Category ${newCategory} added` });
      setNewCategory('');
      fetchCategories();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || 'Failed to add category' });
    }
  };

  const handleDeleteCategory = async (category: string) => {
    try {
      await axios.delete(`http://10.0.2.2:5000/api/categories/${category}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Toast.show({ type: 'success', text1: 'Success', text2: `Category ${category} deleted` });
      fetchCategories();
      if (selectedCategories.includes(category)) {
        setSelectedCategories(selectedCategories.filter((cat) => cat !== category));
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete category' });
    }
  };

  const renderCategory = ({ item, index }: { item: string; index: number }) => (
    <CategoryItem style={{ opacity: fadeAnims[index] }}>
      <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => toggleCategory(item)}>
        <CategoryText>{item}</CategoryText>
        {selectedCategories.includes(item) && (
          <Icon name="checkmark-circle" size={20} color={theme.primary} />
        )}
      </TouchableOpacity>
      {user?.isAdmin && (
        <TouchableOpacity onPress={() => handleDeleteCategory(item)}>
          <Icon name="trash" size={20} color={theme.text} />
        </TouchableOpacity>
      )}
    </CategoryItem>
  );

  return (
    <Container>
      <Header>
        <Title>Select Categories</Title>
        <SaveButton onPress={handleSave}>
          <SaveText>Save</SaveText>
        </SaveButton>
      </Header>
      {user?.isAdmin && (
        <AdminSection>
          <AdminInputContainer>
            <AdminInput
              placeholder="Add new category"
              placeholderTextColor={theme.text + '80'}
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <AddButton onPress={handleAddCategory}>
              <AddButtonText>Add</AddButtonText>
            </AddButton>
            <ClearButton onPress={() => setNewCategory('')}>
              <ClearButtonText>Clear</ClearButtonText>
            </ClearButton>
          </AdminInputContainer>
        </AdminSection>
      )}
      {isLoading ? (
        <LoadingText>Loading categories...</LoadingText>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item}
        />
      )}
    </Container>
  );
};

export default CategorySelectionScreen;