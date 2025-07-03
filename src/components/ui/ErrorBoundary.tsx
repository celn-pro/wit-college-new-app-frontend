import React, { Component, ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styled from '@emotion/native';
import { Typography } from './Typography';
import { Button } from './Button';
import { Container, Column } from '../layout';
import { ThemeContext } from '../../theme';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  style?: ViewStyle;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

const ErrorContainer = styled(Container)`
  background-color: ${(props) => props.theme.background};
  padding: ${(props) => props.theme.spacing.xl}px;
`;

const ErrorIcon = styled(Icon)`
  margin-bottom: ${(props) => props.theme.spacing.lg}px;
`;

const ErrorDetails = styled.View`
  background-color: ${(props) => props.theme.cardBackground};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: ${(props) => props.theme.borderRadius.md}px;
  padding: ${(props) => props.theme.spacing.md}px;
  margin-top: ${(props) => props.theme.spacing.lg}px;
  max-height: 200px;
`;

const ErrorText = styled.Text`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: ${(props) => props.theme.text.secondary};
  line-height: 16px;
`;

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static contextType = ThemeContext;
  context!: React.ContextType<typeof ThemeContext>;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer
          flex={1}
          justify="center"
          align="center"
          style={this.props.style}
        >
          <Column align="center">
            <ErrorIcon
              name="warning-outline"
              size={64}
              color={this.context.error}
            />
            
            <Typography
              variant="h3"
              weight="bold"
              align="center"
              style={{ marginBottom: 8 }}
            >
              Something went wrong
            </Typography>
            
            <Typography
              variant="body2"
              color="secondary"
              align="center"
              style={{ marginBottom: 24 }}
            >
              We're sorry, but something unexpected happened. Please try again.
            </Typography>
            
            <Button
              title="Try Again"
              onPress={this.handleRetry}
              variant="primary"
              icon={<Icon name="refresh" size={16} color={this.context.text.inverse} />}
            />
            
            {__DEV__ && this.state.error && (
              <ErrorDetails>
                <Typography
                  variant="body2"
                  weight="semiBold"
                  style={{ marginBottom: 8 }}
                >
                  Error Details (Development Only):
                </Typography>
                <ErrorText>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </ErrorText>
              </ErrorDetails>
            )}
          </Column>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;
