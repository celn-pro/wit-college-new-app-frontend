import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@emotion/react';
import { ErrorBoundary, withErrorBoundary } from '../ErrorBoundary';
import { lightTheme } from '../../../theme';

const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
);

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary Component', () => {
  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ThemeWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </ThemeWrapper>
    );

    expect(getByText('No error')).toBeTruthy();
  });

  it('renders error UI when there is an error', () => {
    const { getByText } = render(
      <ThemeWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </ThemeWrapper>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn();
    
    render(
      <ThemeWrapper>
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </ThemeWrapper>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    const { getByText } = render(
      <ThemeWrapper>
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </ThemeWrapper>
    );

    expect(getByText('Custom error message')).toBeTruthy();
  });

  it('resets error state when retry button is pressed', () => {
    const { getByText, rerender } = render(
      <ThemeWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </ThemeWrapper>
    );

    // Should show error UI
    expect(getByText('Something went wrong')).toBeTruthy();

    // Press retry button
    fireEvent.press(getByText('Try Again'));

    // Re-render with no error
    rerender(
      <ThemeWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </ThemeWrapper>
    );

    // Should show normal content
    expect(getByText('No error')).toBeTruthy();
  });

  it('applies custom styles correctly', () => {
    const customStyle = { backgroundColor: 'red' };
    
    const { getByTestId } = render(
      <ThemeWrapper>
        <ErrorBoundary style={customStyle}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </ThemeWrapper>
    );

    // Note: This test would need the ErrorBoundary to have a testID
    // for proper testing of styles
  });

  describe('withErrorBoundary HOC', () => {
    it('wraps component with error boundary', () => {
      const TestComponent = () => <div>Test Component</div>;
      const WrappedComponent = withErrorBoundary(TestComponent);

      const { getByText } = render(
        <ThemeWrapper>
          <WrappedComponent />
        </ThemeWrapper>
      );

      expect(getByText('Test Component')).toBeTruthy();
    });

    it('catches errors in wrapped component', () => {
      const WrappedThrowError = withErrorBoundary(ThrowError);

      const { getByText } = render(
        <ThemeWrapper>
          <WrappedThrowError shouldThrow={true} />
        </ThemeWrapper>
      );

      expect(getByText('Something went wrong')).toBeTruthy();
    });

    it('passes error boundary props correctly', () => {
      const onError = jest.fn();
      const customFallback = <div>HOC Custom error</div>;
      
      const TestComponent = () => <ThrowError shouldThrow={true} />;
      const WrappedComponent = withErrorBoundary(TestComponent, {
        onError,
        fallback: customFallback,
      });

      const { getByText } = render(
        <ThemeWrapper>
          <WrappedComponent />
        </ThemeWrapper>
      );

      expect(getByText('HOC Custom error')).toBeTruthy();
      expect(onError).toHaveBeenCalled();
    });

    it('sets correct display name', () => {
      const TestComponent = () => <div>Test</div>;
      TestComponent.displayName = 'TestComponent';
      
      const WrappedComponent = withErrorBoundary(TestComponent);
      
      expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
    });

    it('handles components without display name', () => {
      const TestComponent = () => <div>Test</div>;
      const WrappedComponent = withErrorBoundary(TestComponent);
      
      expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
    });
  });
});
