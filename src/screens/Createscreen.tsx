import React, { useState } from 'react';
import { Text, TouchableOpacity, Platform, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store';
import { useTheme } from '../theme';
import { createNews, debouncedFetchNews } from '../services/newsService';
import { cacheService } from '../services/cacheService';
import Toast from 'react-native-toast-message';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { BASE_URL } from '../utils';
import {
  SafeContainer,
  Container,
  Header,
  HeaderTitle,
  FormField,
  Label,
  Input,
  TextArea,
  PickerContainer,
  ToggleButton,
  ToggleText,
  SubmitButton,
  SubmitButtonText,
  ImageSelectButton,
  ImageNameText,
} from '../styles/createScreenStyles';

const CreateScreen = () => {
  const { user, availableCategories, addNews, setAllNews } = useAppStore();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(availableCategories[0] || 'General');
  const [role, setRole] = useState<'all' | 'student' | 'faculty'>('all');
  const [image, setImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImagePicker = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 600,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result.errorMessage || 'Failed to pick image',
        });
        return;
      }

      if (result.assets && result.assets[0].uri) {
        const asset = result.assets[0];
        setImageFileName(asset.fileName || 'image.jpg');
        setImageUrl('');
        setLoading(true);

        const formData = new FormData();
        formData.append('image', {
          uri: asset.uri
            ? Platform.OS === 'ios'
              ? asset.uri.replace('file://', '')
              : asset.uri
            : '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'image.jpg',
        } as any);

        try {
          const response = await axios.post(`${BASE_URL}/api/news/upload-image`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${useAppStore.getState().token}`,
            },
          });
          setImage(response.data.imageUrl || response.data.imagePath);
          Toast.show({ type: 'success', text1: 'Success', text2: 'Image uploaded successfully' });
        } catch (error: any) {
          console.error('Image upload error:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.response?.data?.message || 'Failed to upload image',
          });
        } finally {
          setLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to pick image' });
      setLoading(false);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setImage(url);
    setImageFileName(null);
  };

  const refreshNews = async () => {
    try {
      const newsData = await debouncedFetchNews('admin', '', '', undefined, true);
      const normalizedNews = newsData.map((item) => ({
        ...item,
        likeCount: item.likeCount ?? 0,
        viewCount: item.viewCount ?? 0,
        likedBy: item.likedBy ?? [],
        viewedBy: item.viewedBy ?? [],
      }));
      setAllNews(normalizedNews);
      const newsCache = await cacheService.getNewsCache();
      await cacheService.setNewsCache(normalizedNews, newsCache?.archivedIds || []);
    } catch (error: any) {
      console.error('Error refreshing news:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to refresh news',
      });
    }
  };

  const handleSubmit = async () => {
    if (!title || !content || !category) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all required fields' });
      return;
    }

    if (imageUrl && !isValidUrl(imageUrl)) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter a valid image URL' });
      return;
    }

    setLoading(true);
    try {
      const newsData = { title, content, category, image: image || undefined, role };
      const createdNews = await createNews(newsData);
      addNews({
        _id: createdNews._id,
        title: createdNews.title,
        content: createdNews.content,
        category: createdNews.category,
        image: createdNews.image,
        role: createdNews.role,
        createdBy: createdNews.createdBy,
        createdAt: createdNews.createdAt,
        likeCount: createdNews.likeCount || 0,
        viewCount: createdNews.viewCount || 0,
        likedBy: createdNews.likedBy || [],
      });
      setTitle('');
      setContent('');
      setCategory(availableCategories[0] || 'General');
      setRole('all');
      setImage(null);
      setImageFileName(null);
      setImageUrl('');
      await refreshNews();
      Toast.show({ type: 'success', text1: 'Success', text2: 'News posted successfully' });
    } catch (error: any) {
      console.error('Create news error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to create news',
      });
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <SafeContainer>
      <Container contentContainerStyle={{ paddingBottom: 20 }}>
        <Header>
          <HeaderTitle>Create News</HeaderTitle>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="close" size={24} color={theme.text} />
          </TouchableOpacity>
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
          <PickerContainer>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={{ color: theme.text, backgroundColor: theme.cardBackground }}
            >
              {availableCategories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </PickerContainer>
        </FormField>

        <FormField>
          <Label>Visible to</Label>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {['all', 'student', 'faculty'].map((r) => (
              <ToggleButton
                key={r}
                selected={role === r}
                onPress={() => setRole(r as 'all' | 'student' | 'faculty')}
              >
                <ToggleText selected={role === r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </ToggleText>
              </ToggleButton>
            ))}
          </View>
        </FormField>

        <FormField>
          <Label>Image (Optional)</Label>
          <ImageSelectButton onPress={handleImagePicker} disabled={loading}>
            <Text style={{ color: theme.text }}>
              {imageFileName ? 'Change Image' : 'Select Image from Device'}
            </Text>
          </ImageSelectButton>
          {imageFileName && <ImageNameText>{imageFileName}</ImageNameText>}
          <Input
            value={imageUrl}
            onChangeText={handleImageUrlChange}
            placeholder="Or enter image URL (e.g., https://picsum.photos/600/400)"
            placeholderTextColor={theme.text + '80'}
            keyboardType="url"
            style={{ marginTop: 8 }}
          />
        </FormField>

        <SubmitButton onPress={handleSubmit} disabled={loading}>
          <SubmitButtonText>{loading ? 'Posting...' : 'Post News'}</SubmitButtonText>
        </SubmitButton>
      </Container>
    </SafeContainer>
  );
};

export default CreateScreen;