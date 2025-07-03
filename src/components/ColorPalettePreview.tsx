import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '../theme';
import { Typography, Container, Row, Column, Card } from './ui';

const ColorSwatch = styled.View<{ color: string; size?: 'sm' | 'md' | 'lg' }>`
  background-color: ${(props) => props.color};
  border-radius: ${(props) => props.theme.borderRadius.md}px;
  margin: ${(props) => props.theme.spacing.xs}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
  
  ${(props) => {
    const sizes = {
      sm: { width: 40, height: 40 },
      md: { width: 60, height: 60 },
      lg: { width: 80, height: 80 },
    };
    const size = sizes[props.size || 'md'];
    return `width: ${size.width}px; height: ${size.height}px;`;
  }}
`;

const ColorLabel = styled(Text)`
  font-size: 12px;
  color: ${(props) => props.theme.text.secondary};
  text-align: center;
  margin-top: 4px;
  font-family: ${(props) => props.theme.typography.fontFamily.medium};
`;

const SectionTitle = styled(Typography)`
  margin: ${(props) => props.theme.spacing.lg}px 0 ${(props) => props.theme.spacing.md}px 0;
`;

const GradientSwatch = styled.View<{ colors: string[] }>`
  width: 100%;
  height: 60px;
  border-radius: ${(props) => props.theme.borderRadius.lg}px;
  margin: ${(props) => props.theme.spacing.sm}px 0;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

const ColorSection = ({ title, colors, labels }: { 
  title: string; 
  colors: string[]; 
  labels: string[] 
}) => (
  <Container paddingVertical="md">
    <SectionTitle variant="h4" weight="semiBold" color="primary">
      {title}
    </SectionTitle>
    <Row wrap justify="flex-start">
      {colors.map((color, index) => (
        <Column key={index} align="center" style={{ minWidth: 80 }}>
          <ColorSwatch color={color} />
          <ColorLabel>{labels[index]}</ColorLabel>
        </Column>
      ))}
    </Row>
  </Container>
);

export const ColorPalettePreview: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={{ backgroundColor: theme.background }}>
      <Container paddingHorizontal="lg" paddingVertical="xl">
        <Typography variant="h2" weight="bold" color="primary" align="center">
          Modern College News App
        </Typography>
        <Typography variant="h3" weight="semiBold" color="primary" align="center">
          Color Palette
        </Typography>
        <Typography variant="body1" color="secondary" align="center" style={{ marginBottom: 32 }}>
          Vibrant, modern colors designed for college news and student engagement
        </Typography>

        {/* Primary Colors */}
        <ColorSection
          title="Primary Colors"
          colors={[theme.primary, theme.primaryLight, theme.primaryDark]}
          labels={['Primary', 'Light', 'Dark']}
        />

        {/* Accent Colors */}
        <ColorSection
          title="Accent Colors"
          colors={[theme.accent, theme.accentLight, theme.accentDark]}
          labels={['Accent', 'Light', 'Dark']}
        />

        {/* College Colors */}
        <ColorSection
          title="College Spirit Colors"
          colors={[
            theme.college.gold,
            theme.college.crimson,
            theme.college.forest,
            theme.college.navy,
            theme.college.purple
          ]}
          labels={['Gold', 'Crimson', 'Forest', 'Navy', 'Purple']}
        />

        {/* Semantic Colors */}
        <ColorSection
          title="Semantic Colors"
          colors={[theme.success, theme.warning, theme.error, theme.info]}
          labels={['Success', 'Warning', 'Error', 'Info']}
        />

        {/* UI Colors */}
        <ColorSection
          title="UI Colors"
          colors={[
            theme.background,
            theme.surface,
            theme.cardBackground,
            theme.border,
            theme.text.primary
          ]}
          labels={['Background', 'Surface', 'Card', 'Border', 'Text']}
        />

        {/* Gradients Preview */}
        <Container paddingVertical="md">
          <SectionTitle variant="h4" weight="semiBold" color="primary">
            Modern Gradients
          </SectionTitle>
          
          <Card variant="elevated" padding="md">
            <Typography variant="body2" weight="medium" color="primary" style={{ marginBottom: 8 }}>
              Hero Gradient
            </Typography>
            <View style={{
              width: '100%',
              height: 60,
              borderRadius: theme.borderRadius.lg,
              background: `linear-gradient(135deg, ${theme.gradient.hero[0]}, ${theme.gradient.hero[1]})`,
              backgroundColor: theme.gradient.hero[0], // Fallback for React Native
            }} />
            
            <Typography variant="body2" weight="medium" color="primary" style={{ marginBottom: 8, marginTop: 16 }}>
              News Section Gradient
            </Typography>
            <View style={{
              width: '100%',
              height: 60,
              borderRadius: theme.borderRadius.lg,
              background: `linear-gradient(135deg, ${theme.gradient.news[0]}, ${theme.gradient.news[1]})`,
              backgroundColor: theme.gradient.news[0], // Fallback for React Native
            }} />
          </Card>
        </Container>

        {/* Color Usage Guidelines */}
        <Container paddingVertical="lg">
          <SectionTitle variant="h4" weight="semiBold" color="primary">
            Usage Guidelines
          </SectionTitle>
          
          <Card variant="outlined" padding="lg">
            <Typography variant="body1" weight="semiBold" color="primary" style={{ marginBottom: 12 }}>
              🎨 Modern College Design Principles:
            </Typography>
            
            <Typography variant="body2" color="secondary" style={{ marginBottom: 8 }}>
              • <Text style={{ color: theme.primary, fontWeight: '600' }}>Primary Indigo</Text> - Main brand color for headers, buttons, and key actions
            </Typography>
            
            <Typography variant="body2" color="secondary" style={{ marginBottom: 8 }}>
              • <Text style={{ color: theme.accent, fontWeight: '600' }}>Vibrant Orange</Text> - Accent color for highlights, notifications, and CTAs
            </Typography>
            
            <Typography variant="body2" color="secondary" style={{ marginBottom: 8 }}>
              • <Text style={{ color: theme.college.gold, fontWeight: '600' }}>College Colors</Text> - Use for categories, badges, and school spirit elements
            </Typography>
            
            <Typography variant="body2" color="secondary" style={{ marginBottom: 8 }}>
              • <Text style={{ color: theme.success, fontWeight: '600' }}>Semantic Colors</Text> - Clear communication for status and feedback
            </Typography>
            
            <Typography variant="body2" color="secondary">
              • <Text style={{ color: theme.text.primary, fontWeight: '600' }}>Gradients</Text> - Modern depth and visual interest for hero sections
            </Typography>
          </Card>
        </Container>
      </Container>
    </ScrollView>
  );
};

export default ColorPalettePreview;
