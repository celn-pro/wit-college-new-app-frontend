import React from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { RootStackParamList } from '../navigation/routes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface NewsCardProps {
  id: string;
  image: string;
  index: number; // For animation staggering
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const NewsCard: React.FC<NewsCardProps> = ({ id, image, index }) => {
  const navigation = useNavigation<NavigationProp>();
  const scale = useSharedValue(0.95);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  return (
    <AnimatedTouchable
      style={[styles.cardContainer, animatedStyle]}
      entering={FadeInDown.delay(index * 100).duration(500)}
      onPress={() => {
        scale.value = 0.9;
        setTimeout(() => (scale.value = 0.95), 100);
        navigation.navigate("NewsDetail", { newsId: id });
      }}
    >
      <Image source={{ uri: image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>News Title {id}</Text>
        <Text style={styles.cardSummary}>News summary for {id}</Text>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff', // Replace with your theme color if needed
    borderRadius: 10,
    margin: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardTitle: {
    fontSize: 16, // Replace with your theme typography if needed
    fontWeight: 'bold', // Replace with your theme typography if needed
    color: '#000', // Replace with your theme color if needed
  },
  cardSummary: {
    fontSize: 14, // Replace with your theme typography if needed
    color: '#666', // Replace with your theme color if needed
    marginTop: 4,
  },
});

export default NewsCard;
