import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@emotion/react';
import { Button } from '../Button';
import { lightTheme } from '../../../theme';

// Mock theme provider wrapper
const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
);

describe('Button Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(
      <ThemeWrapper>
        <Button title="Test Button" onPress={mockOnPress} />
      </ThemeWrapper>
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(
      <ThemeWrapper>
        <Button title="Test Button" onPress={mockOnPress} />
      </ThemeWrapper>
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders different variants correctly', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost'] as const;
    
    variants.forEach(variant => {
      const { getByText } = render(
        <ThemeWrapper>
          <Button title={`${variant} Button`} onPress={mockOnPress} variant={variant} />
        </ThemeWrapper>
      );

      expect(getByText(`${variant} Button`)).toBeTruthy();
    });
  });

  it('renders different sizes correctly', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    
    sizes.forEach(size => {
      const { getByText } = render(
        <ThemeWrapper>
          <Button title={`${size} Button`} onPress={mockOnPress} size={size} />
        </ThemeWrapper>
      );

      expect(getByText(`${size} Button`)).toBeTruthy();
    });
  });

  it('shows loading state correctly', () => {
    const { getByTestId } = render(
      <ThemeWrapper>
        <Button title="Loading Button" onPress={mockOnPress} loading />
      </ThemeWrapper>
    );

    // Should show ActivityIndicator when loading
    expect(getByTestId('button-loading-indicator')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const { getByText } = render(
      <ThemeWrapper>
        <Button title="Disabled Button" onPress={mockOnPress} disabled />
      </ThemeWrapper>
    );

    const button = getByText('Disabled Button').parent;
    fireEvent.press(button!);
    
    // Should not call onPress when disabled
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('renders with icon correctly', () => {
    const { getByText, getByTestId } = render(
      <ThemeWrapper>
        <Button 
          title="Icon Button" 
          onPress={mockOnPress} 
          icon={<div testID="button-icon">Icon</div>}
        />
      </ThemeWrapper>
    );

    expect(getByText('Icon Button')).toBeTruthy();
    expect(getByTestId('button-icon')).toBeTruthy();
  });

  it('renders full width correctly', () => {
    const { getByText } = render(
      <ThemeWrapper>
        <Button title="Full Width Button" onPress={mockOnPress} fullWidth />
      </ThemeWrapper>
    );

    const button = getByText('Full Width Button').parent;
    expect(button).toHaveStyle({ width: '100%' });
  });

  it('has proper accessibility props', () => {
    const { getByRole } = render(
      <ThemeWrapper>
        <Button title="Accessible Button" onPress={mockOnPress} />
      </ThemeWrapper>
    );

    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(button).toHaveProp('accessible', true);
  });

  it('applies custom styles correctly', () => {
    const customStyle = { marginTop: 20 };
    const { getByText } = render(
      <ThemeWrapper>
        <Button title="Styled Button" onPress={mockOnPress} style={customStyle} />
      </ThemeWrapper>
    );

    const button = getByText('Styled Button').parent;
    expect(button).toHaveStyle(customStyle);
  });
});
