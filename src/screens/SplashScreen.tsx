import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import LinearGradientView from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { AppIcon } from '../components/AppIcon';

const { width, height } = Dimensions.get('window');
const ORBIT_RADIUS = 100;



const SplashScreen = ({ onFinish }: { onFinish?: () => void }) => {
  const theme = useTheme();
  // Enhanced animation values
  const pulse = useSharedValue(0);
  const fadeIn = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Entrance animation sequence
    fadeIn.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });

    // Continuous pulse animation
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );

    const timeout = setTimeout(() => {
      onFinish && onFinish();
    }, 2500);
    return () => clearTimeout(timeout);
  }, []);

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + (pulse.value * 0.4),
    transform: [{ scale: 1 + pulse.value * 0.3 }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <LinearGradientView
      colors={theme.gradient.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[styles.centerCircle, containerStyle]}>
        {/* Modern outer ring with gradient */}
        <Svg width={ORBIT_RADIUS * 2 + 20} height={ORBIT_RADIUS * 2 + 20}>
          <Defs>
            <LinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={theme.accent} stopOpacity="0.6" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={ORBIT_RADIUS + 10}
            cy={ORBIT_RADIUS + 10}
            r={ORBIT_RADIUS}
            stroke="url(#ringGradient)"
            strokeWidth={4}
            fill="none"
          />
        </Svg>

        {/* Enhanced pulsing circle */}
        <Animated.View style={[styles.pulseCircle, pulseStyle]}>
          <Svg width={ORBIT_RADIUS * 2} height={ORBIT_RADIUS * 2}>
            <Defs>
              <LinearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.2" />
                <Stop offset="100%" stopColor={theme.accent} stopOpacity="0.1" />
              </LinearGradient>
            </Defs>
            <Circle
              cx={ORBIT_RADIUS}
              cy={ORBIT_RADIUS}
              r={ORBIT_RADIUS - 10}
              fill="url(#pulseGradient)"
            />
          </Svg>
        </Animated.View>

        {/* Centered app icon with theme */}
        <View style={styles.iconCenter}>
          <AppIcon width={90} height={90} variant="default" />
        </View>
      </Animated.View>

      {/* Enhanced app name with modern styling */}
      <Animated.View style={[styles.bottomTextContainer, containerStyle]}>
        <Text style={[styles.title, { color: theme.text.inverse }]}>
          College News
        </Text>
        <Text style={[styles.subtitle, { color: theme.text.inverse }]}>
          Stay Connected • Stay Informed
        </Text>
      </Animated.View>
    </LinearGradientView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCircle: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: -80,
  },
  pulseCircle: {
    position: 'absolute',
    left: 20,
    top: 20,
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  iconCenter: {
    position: 'absolute',
    left: 70,
    top: 70,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  bottomTextContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default SplashScreen;