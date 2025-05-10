import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import styled from '@emotion/native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store';
import { useTheme } from '../theme';
import { createNews } from '../services/newsService';
import Toast from 'react-native-toast-message';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../utils';

const Container = styled.ScrollView`
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

const HeaderTitle = styled.Text`
  font-size: 24px;
  font-family: 'Roboto-Bold';
  color: ${(props) => props.theme.text};
`;

const FormField = styled.View`
  margin-bottom: 20px;
`;

const Label = styled.Text`
  font-size: 16px;
  font-family: 'Roboto-Medium';
  color: ${(props) => props.theme.text};
  margin-bottom: 8px;
`;

const Input = styled.TextInput`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  border: 1px solid ${(props) => props.theme.border};
`;

const TextArea = styled.TextInput`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  border: 1px solid ${(props) => props.theme.border};
  height: 120px;
  text-align-vertical: top;
`;

const PickerContainer = styled.View`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.border};
`;

const ToggleButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const ToggleText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Medium';
  color: ${(props) => props.theme.primary};
  margin-left: 8px;
`;

const SubmitButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.primary};
  border-radius: 8px;
  padding: 15px;
  align-items: center;
  margin-top: 20px;
`;

const SubmitButtonText = styled.Text`
  font-size: 18px;
  font-family: 'Roboto-Bold';
  color: #ffffff;
`;

const ImageSelectButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.cardBackground};
  border-radius: 8px;
  padding: 12px;
  border: 1px solid ${(props) => props.theme.border};
  align-items: center;
`;

const ImageNameText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  margin-top: 8px;
`;

const LoadingText = styled.Text`
  font-size: 14px;
  font-family: 'Roboto-Regular';
  color: ${(props) => props.theme.text};
  text-align: center;
  margin: 10px 0;
`;

const CreateScreen = () => {
  const theme = useTheme();
  const { availableCategories: defaultCategories, addNews, token } = useAppStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [role, setRole] = useState('all');
  const [useImageUrl, setUseImageUrl] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  // Fetch categories function
  const fetchCategories = useCallback(async () => {
    setFetchingCategories(true);
    try {
      console.log('Fetching categories...');
      const response = await axios.get(`${BASE_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data)) {
        const categoryNames = response.data.map(cat => 
          typeof cat === 'object' && cat.name ? cat.name : String(cat)
        );
        console.log('Categories fetched:', categoryNames);
        setCategories(categoryNames);
        
        // Set default category after fetching
        if (categoryNames.length > 0) {
          setCategory(categoryNames[0]);
        }
      } else {
        // Fallback to default categories if API response is not as expected
        console.log('Invalid category data format, using defaults');
        setCategories(defaultCategories);
        if (defaultCategories.length > 0) {
          setCategory(defaultCategories[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback to default categories on error
      setCategories(defaultCategories);
      if (defaultCategories.length > 0) {
        setCategory(defaultCategories[0]);
      }
      Toast.show({ 
        type: 'error', 
        text1: 'Error', 
        text2: 'Failed to fetch categories' 
      });
    } finally {
      setFetchingCategories(false);
    }
  }, [token, defaultCategories]);

  // Use useFocusEffect to refetch categories each time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchCategories();
      
      // Optional: return a cleanup function
      return () => {
        // Any cleanup code if needed
      };
    }, [fetchCategories])
  );

  const handleToggleImageSource = () => {
    setUseImageUrl(!useImageUrl);
    setImage('');
    setImageFileName('');
  };

  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        includeBase64: false,
      });
      if (result.didCancel) {
        Toast.show({ type: 'info', text1: 'Cancelled', text2: 'Image selection cancelled' });
        return;
      }
      if (result.errorCode) {
        Toast.show({ type: 'error', text1: 'Error', text2: `Image picker error: ${result.errorMessage}` });
        return;
      }
      if (result.assets && result.assets[0].uri) {
        const asset = result.assets[0];
        setImageFileName(asset.fileName || 'image.jpg');
        setLoading(true);
        try {
          const formData = new FormData();
          formData.append('image', {
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || 'image.jpg',
          });
          const res = await axios.post(`${BASE_URL}/api/news/upload-image`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });
          setImage(res.data.imagePath);
          Toast.show({ type: 'success', text1: 'Success', text2: 'Image uploaded' });
        } catch (error: any) {
          console.error('Image upload failed:', error);
          Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to upload image' });
        } finally {
          setLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to select image' });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !category) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Title, content, and category are required' });
      return;
    }
    if (title.length > 100) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Title must be 100 characters or less' });
      return;
    }
    if (content.length > 5000) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Content must be 5000 characters or less' });
      return;
    }
    setLoading(true);
    try {
      const newNews = await createNews({
        title,
        content,
        category,
        image: image.trim() || undefined,
        role,
      });
      addNews(newNews);
      Toast.show({ type: 'success', text1: 'Success', text2: 'News post created successfully!' });
      setTitle('');
      setContent('');
      setImage('');
      setImageFileName('');
      setCategory(categories[0] || '');
      setRole('all');
      setUseImageUrl(true);
    } catch (error: any) {
      console.error('Failed to create news:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Failed to create news post' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>Create News</HeaderTitle>
        <Icon name="create" size={30} color={theme.primary} />
      </Header>
      <FormField>
        <Label>Title</Label>
        <Input
          value={title}
          onChangeText={setTitle}
          placeholder="Enter news title"
          placeholderTextColor={theme.text + '80'}
          maxLength={100}
        />
      </FormField>
      <FormField>
        <Label>Content</Label>
        <TextArea
          value={content}
          onChangeText={setContent}
          placeholder="Enter news content"
          placeholderTextColor={theme.text + '80'}
          multiline
          maxLength={5000}
        />
      </FormField>
      <FormField>
        <Label>Category</Label>
        {fetchingCategories ? (
          <LoadingText>Loading categories...</LoadingText>
        ) : categories.length > 0 ? (
          <PickerContainer>
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value)}
              style={{ color: theme.text }}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </PickerContainer>
        ) : (
          <LoadingText>No categories available</LoadingText>
        )}
      </FormField>
      <FormField>
        <Label>Image (optional)</Label>
        <ToggleButton onPress={handleToggleImageSource}>
          <Icon name={useImageUrl ? 'link' : 'image'} size={20} color={theme.primary} />
          <ToggleText>{useImageUrl ? 'Use Image URL' : 'Upload Image'}</ToggleText>
        </ToggleButton>
        {useImageUrl ? (
          <Input
            value={image}
            onChangeText={setImage}
            placeholder="Enter image URL"
            placeholderTextColor={theme.text + '80'}
          />
        ) : (
          <>
            <ImageSelectButton onPress={handleImagePick} disabled={loading}>
              <Text style={{ color: theme.text, fontFamily: 'Roboto-Regular' }}>
                {loading ? 'Uploading...' : 'Select Image'}
              </Text>
            </ImageSelectButton>
            {imageFileName && (
              <ImageNameText>Selected: {imageFileName}</ImageNameText>
            )}
          </>
        )}
      </FormField>
      <FormField>
        <Label>Visibility Scope</Label>
        <PickerContainer>
          <Picker
            selectedValue={role}
            onValueChange={(value) => setRole(value)}
            style={{ color: theme.text }}
          >
            <Picker.Item label="All" value="all" />
            <Picker.Item label="Student" value="student" />
            <Picker.Item label="Faculty" value="faculty" />
          </Picker>
        </PickerContainer>
      </FormField>
      <SubmitButton onPress={handleSubmit} disabled={loading || fetchingCategories}>
        <SubmitButtonText>{loading ? 'Creating...' : 'Create Post'}</SubmitButtonText>
      </SubmitButton>
    </Container>
  );
};

export default CreateScreen;