import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@emotion/react';
import { Typography, Heading1, Heading2, Body1, Body2, Caption } from '../Typography';
import { lightTheme } from '../../../theme';

const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
);

describe('Typography Component', () => {
  it('renders text content correctly', () => {
    const { getByText } = render(
      <ThemeWrapper>
        <Typography>Test Text</Typography>
      </ThemeWrapper>
    );

    expect(getByText('Test Text')).toBeTruthy();
  });

  it('renders different variants correctly', () => {
    const variants = ['h1', 'h2', 'h3', 'h4', 'body1', 'body2', 'caption', 'overline'] as const;
    
    variants.forEach(variant => {
      const { getByText } = render(
        <ThemeWrapper>
          <Typography variant={variant}>{variant} text</Typography>
        </ThemeWrapper>
      );

      expect(getByText(`${variant} text`)).toBeTruthy();
    });
  });

  it('renders different colors correctly', () => {
    const colors = ['primary', 'secondary', 'tertiary', 'inverse', 'success', 'warning', 'error'] as const;
    
    colors.forEach(color => {
      const { getByText } = render(
        <ThemeWrapper>
          <Typography color={color}>{color} text</Typography>
        </ThemeWrapper>
      );

      expect(getByText(`${color} text`)).toBeTruthy();
    });
  });

  it('renders different alignments correctly', () => {
    const alignments = ['left', 'center', 'right'] as const;
    
    alignments.forEach(align => {
      const { getByText } = render(
        <ThemeWrapper>
          <Typography align={align}>{align} text</Typography>
        </ThemeWrapper>
      );

      const text = getByText(`${align} text`);
      expect(text).toHaveStyle({ textAlign: align });
    });
  });

  it('renders different weights correctly', () => {
    const weights = ['normal', 'medium', 'semiBold', 'bold'] as const;
    
    weights.forEach(weight => {
      const { getByText } = render(
        <ThemeWrapper>
          <Typography weight={weight}>{weight} text</Typography>
        </ThemeWrapper>
      );

      expect(getByText(`${weight} text`)).toBeTruthy();
    });
  });

  it('limits number of lines correctly', () => {
    const { getByText } = render(
      <ThemeWrapper>
        <Typography numberOfLines={2}>
          This is a very long text that should be truncated after two lines
        </Typography>
      </ThemeWrapper>
    );

    const text = getByText('This is a very long text that should be truncated after two lines');
    expect(text).toHaveProp('numberOfLines', 2);
  });

  it('applies custom styles correctly', () => {
    const customStyle = { marginTop: 10 };
    const { getByText } = render(
      <ThemeWrapper>
        <Typography style={customStyle}>Styled text</Typography>
      </ThemeWrapper>
    );

    const text = getByText('Styled text');
    expect(text).toHaveStyle(customStyle);
  });

  describe('Convenience Components', () => {
    it('renders Heading1 correctly', () => {
      const { getByText } = render(
        <ThemeWrapper>
          <Heading1>Heading 1</Heading1>
        </ThemeWrapper>
      );

      expect(getByText('Heading 1')).toBeTruthy();
    });

    it('renders Heading2 correctly', () => {
      const { getByText } = render(
        <ThemeWrapper>
          <Heading2>Heading 2</Heading2>
        </ThemeWrapper>
      );

      expect(getByText('Heading 2')).toBeTruthy();
    });

    it('renders Body1 correctly', () => {
      const { getByText } = render(
        <ThemeWrapper>
          <Body1>Body 1</Body1>
        </ThemeWrapper>
      );

      expect(getByText('Body 1')).toBeTruthy();
    });

    it('renders Body2 correctly', () => {
      const { getByText } = render(
        <ThemeWrapper>
          <Body2>Body 2</Body2>
        </ThemeWrapper>
      );

      expect(getByText('Body 2')).toBeTruthy();
    });

    it('renders Caption correctly', () => {
      const { getByText } = render(
        <ThemeWrapper>
          <Caption>Caption text</Caption>
        </ThemeWrapper>
      );

      expect(getByText('Caption text')).toBeTruthy();
    });
  });

  it('has proper accessibility props', () => {
    const { getByText } = render(
      <ThemeWrapper>
        <Typography>Accessible text</Typography>
      </ThemeWrapper>
    );

    const text = getByText('Accessible text');
    expect(text).toHaveProp('accessible', true);
  });
});
