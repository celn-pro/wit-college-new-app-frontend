import React, { useState, useEffect } from 'react';
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
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/ui/Header';
import { Button } from '../components/ui/Button';
import styled from '@emotion/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SafeContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: ${(props) => props.theme.background};
`;

const Container = styled.ScrollView`
  flex: 1;
  padding: 20px;
`;

const FormCard = styled.View`
  background-color: ${(props) => props.theme.surface};
  border-radius: 24px;
  padding: 28px;
  margin: 16px 0;
  shadow-color: #000;
  shadow-offset: 0px 8px;
  shadow-opacity: 0.12;
  shadow-radius: 16px;
  elevation: 8;
  border: 1px solid ${(props) => props.theme.border};
`;

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => props.theme.text.primary};
  margin-bottom: 20px;
  text-align: center;
`;

const FormField = styled.View`
  margin-bottom: 24px;
`;

const InputLabel = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.text.primary};
  margin-bottom: 8px;
`;

const Input = styled.TextInput`
  background-color: ${(props) => props.theme.background};
  border: 2px solid ${(props) => props.theme.border};
  border-radius: 16px;
  padding: 16px;
  font-size: 16px;
  color: ${(props) => props.theme.text.primary};
  min-height: 56px;
`;

const TextArea = styled.TextInput`
  background-color: ${(props) => props.theme.background};
  border: 2px solid ${(props) => props.theme.border};
  border-radius: 16px;
  padding: 16px;
  font-size: 16px;
  color: ${(props) => props.theme.text.primary};
  min-height: 120px;
  text-align-vertical: top;
`;

const PickerContainer = styled.View`
  background-color: ${(props) => props.theme.background};
  border: 2px solid ${(props) => props.theme.border};
  border-radius: 16px;
  overflow: hidden;
`;

const RoleButtonsContainer = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const RoleButton = styled.TouchableOpacity<{ selected?: boolean }>`
  flex: 1;
  background-color: ${(props) =>
    props.selected ? props.theme.primary + '20' : props.theme.background};
  border: 2px solid ${(props) =>
    props.selected ? props.theme.primary : props.theme.border};
  border-radius: 16px;
  padding: 16px;
  align-items: center;
  justify-content: center;
  min-height: 56px;
`;

const RoleText = styled.Text<{ selected?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) =>
    props.selected ? props.theme.primary : props.theme.text.primary};
`;

const ImageSection = styled.View`
  margin-bottom: 24px;
`;

const ImageButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.background};
  border: 2px dashed ${(props) => props.theme.border};
  border-radius: 16px;
  padding: 24px;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const ImageButtonText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.text.secondary};
  margin-top: 8px;
`;

const ImageFileName = styled.Text`
  font-size: 14px;
  color: ${(props) => props.theme.text.secondary};
  text-align: center;
  margin-bottom: 12px;
`;

const OrDivider = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 16px 0;
`;

const DividerLine = styled.View`
  flex: 1;
  height: 1px;
  background-color: ${(props) => props.theme.border};
`;

const DividerText = styled.Text`
  font-size: 14px;
  color: ${(props) => props.theme.text.secondary};
  margin: 0 16px;
`;

const CreateScreen = () => {
  const { themeMode, user, availableCategories, addNews, setAllNews } = useAppStore();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(availableCategories[0] || 'General');
  const [role, setRole] = useState<'all' | 'student' | 'faculty'>('all');
  const [image, setImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation values
  const formScale = useSharedValue(0.95);
  const formOpacity = useSharedValue(0);

  // Entrance animation
  useEffect(() => {
    formScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    formOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: formScale.value }],
    opacity: formOpacity.value,
  }));

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
    <SafeContainer edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="Create News"
        gradient={true}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <Container
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={formAnimatedStyle}>
          {/* Basic Information Card */}
          <FormCard>
            <SectionTitle>📝 Article Details</SectionTitle>

            <FormField>
              <InputLabel>Title</InputLabel>
              <Input
                value={title}
                onChangeText={setTitle}
                placeholder="Enter an engaging news title..."
                placeholderTextColor={theme.text.tertiary}
                maxLength={100}
              />
            </FormField>

            <FormField>
              <InputLabel>Content</InputLabel>
              <TextArea
                value={content}
                onChangeText={setContent}
                placeholder="Write your news content here. Share the details, facts, and important information..."
                placeholderTextColor={theme.text.tertiary}
                multiline
                maxLength={5000}
              />
            </FormField>

            <FormField>
              <InputLabel>Category</InputLabel>
              <PickerContainer>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                  style={{ color: theme.text.primary }}
                >
                  {availableCategories.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </PickerContainer>
            </FormField>
          </FormCard>

          {/* Audience Selection Card */}
          <FormCard>
            <SectionTitle>👥 Target Audience</SectionTitle>

            <FormField>
              <InputLabel>Who can see this news?</InputLabel>
              <RoleButtonsContainer>
                {[
                  { key: 'all', label: 'Everyone', icon: '🌍' },
                  { key: 'student', label: 'Students', icon: '🎓' },
                  { key: 'faculty', label: 'Faculty', icon: '👨‍🏫' }
                ].map((r) => (
                  <RoleButton
                    key={r.key}
                    selected={role === r.key}
                    onPress={() => setRole(r.key as 'all' | 'student' | 'faculty')}
                  >
                    <Text style={{ fontSize: 20, marginBottom: 4 }}>{r.icon}</Text>
                    <RoleText selected={role === r.key}>
                      {r.label}
                    </RoleText>
                  </RoleButton>
                ))}
              </RoleButtonsContainer>
            </FormField>
          </FormCard>

          {/* Image Upload Card */}
          <FormCard>
            <SectionTitle>🖼️ Add Image (Optional)</SectionTitle>

            <ImageSection>
              <ImageButton onPress={handleImagePicker} disabled={loading}>
                <Icon name="cloud-upload-outline" size={32} color={theme.text.secondary} />
                <ImageButtonText>
                  {imageFileName ? 'Change Image' : 'Upload from Device'}
                </ImageButtonText>
              </ImageButton>

              {imageFileName && (
                <ImageFileName>📎 {imageFileName}</ImageFileName>
              )}

              <OrDivider>
                <DividerLine />
                <DividerText>OR</DividerText>
                <DividerLine />
              </OrDivider>

              <FormField>
                <InputLabel>Image URL</InputLabel>
                <Input
                  value={imageUrl}
                  onChangeText={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor={theme.text.tertiary}
                  keyboardType="url"
                />
              </FormField>
            </ImageSection>
          </FormCard>

          {/* Submit Button */}
          <Button
            title={loading ? 'Publishing...' : 'Publish News'}
            onPress={handleSubmit}
            disabled={loading || !title.trim() || !content.trim()}
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
            style={{ marginTop: 8, marginBottom: 20 }}
          />
        </Animated.View>
      </Container>
    </SafeContainer>
  );
};

export default CreateScreen;