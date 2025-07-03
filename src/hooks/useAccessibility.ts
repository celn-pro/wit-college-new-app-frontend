import { useState, useEffect, useCallback, useRef } from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';
import AccessibilityUtils from '../utils/accessibility';

// Hook for managing accessibility state
export const useAccessibility = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

  useEffect(() => {
    // Check initial accessibility settings
    const checkAccessibilitySettings = async () => {
      const [screenReader, reduceMotion] = await Promise.all([
        AccessibilityUtils.isScreenReaderEnabled(),
        AccessibilityUtils.isReduceMotionEnabled(),
      ]);

      setIsScreenReaderEnabled(screenReader);
      setIsReduceMotionEnabled(reduceMotion);
    };

    checkAccessibilitySettings();

    // Listen for accessibility changes
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    const reduceMotionListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled
    );

    return () => {
      screenReaderListener?.remove();
      reduceMotionListener?.remove();
    };
  }, []);

  const announceForAccessibility = useCallback((message: string) => {
    AccessibilityUtils.announceForAccessibility(message);
  }, []);

  const setAccessibilityFocus = useCallback((ref: React.RefObject<any>) => {
    if (ref.current) {
      const reactTag = findNodeHandle(ref.current);
      if (reactTag) {
        AccessibilityUtils.setAccessibilityFocus(reactTag);
      }
    }
  }, []);

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    announceForAccessibility,
    setAccessibilityFocus,
  };
};

// Hook for managing focus
export const useFocusManagement = () => {
  const focusRef = useRef<any>(null);
  const { setAccessibilityFocus } = useAccessibility();

  const focusElement = useCallback(() => {
    if (focusRef.current) {
      setAccessibilityFocus(focusRef);
    }
  }, [setAccessibilityFocus]);

  const focusAfterDelay = useCallback((delay: number = 100) => {
    setTimeout(focusElement, delay);
  }, [focusElement]);

  return {
    focusRef,
    focusElement,
    focusAfterDelay,
  };
};

// Hook for accessibility announcements
export const useAccessibilityAnnouncements = () => {
  const { announceForAccessibility } = useAccessibility();

  const announceLoading = useCallback((context: string) => {
    const message = AccessibilityUtils.generateLoadingAnnouncement(context);
    announceForAccessibility(message);
  }, [announceForAccessibility]);

  const announceError = useCallback((error: string) => {
    const message = AccessibilityUtils.generateErrorAnnouncement(error);
    announceForAccessibility(message);
  }, [announceForAccessibility]);

  const announceSuccess = useCallback((action: string) => {
    const message = AccessibilityUtils.generateSuccessAnnouncement(action);
    announceForAccessibility(message);
  }, [announceForAccessibility]);

  const announceNavigation = useCallback((screenName: string) => {
    announceForAccessibility(`Navigated to ${screenName}`);
  }, [announceForAccessibility]);

  return {
    announceLoading,
    announceError,
    announceSuccess,
    announceNavigation,
    announceForAccessibility,
  };
};

// Hook for accessible form handling
export const useAccessibleForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { announceError } = useAccessibilityAnnouncements();

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
    announceError(`${field}: ${error}`);
  }, [announceError]);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldAccessibilityProps = useCallback((
    field: string,
    label: string,
    value: string,
    required?: boolean
  ) => {
    return AccessibilityUtils.generateInputAccessibilityProps(
      label,
      value,
      errors[field],
      required
    );
  }, [errors]);

  return {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    getFieldAccessibilityProps,
  };
};

// Hook for accessible lists
export const useAccessibleList = (items: any[], itemType: string = 'item') => {
  const getItemAccessibilityProps = useCallback((index: number) => {
    return AccessibilityUtils.generateListAccessibilityProps(
      items.length,
      index,
      itemType
    );
  }, [items.length, itemType]);

  const announceListUpdate = useCallback(() => {
    const message = `List updated. ${items.length} ${itemType}${items.length !== 1 ? 's' : ''} available.`;
    AccessibilityUtils.announceForAccessibility(message);
  }, [items.length, itemType]);

  return {
    getItemAccessibilityProps,
    announceListUpdate,
  };
};

// Hook for accessible navigation
export const useAccessibleNavigation = () => {
  const { announceNavigation } = useAccessibilityAnnouncements();
  const { focusAfterDelay } = useFocusManagement();

  const navigateWithAnnouncement = useCallback((
    screenName: string,
    navigationFn: () => void,
    focusRef?: React.RefObject<any>
  ) => {
    navigationFn();
    announceNavigation(screenName);
    
    if (focusRef) {
      focusAfterDelay();
    }
  }, [announceNavigation, focusAfterDelay]);

  return {
    navigateWithAnnouncement,
  };
};

// Hook for accessible modals
export const useAccessibleModal = () => {
  const { announceForAccessibility } = useAccessibility();
  const { focusAfterDelay } = useFocusManagement();

  const openModal = useCallback((title: string, focusRef?: React.RefObject<any>) => {
    announceForAccessibility(`${title} dialog opened`);
    if (focusRef) {
      focusAfterDelay(300); // Give modal time to render
    }
  }, [announceForAccessibility, focusAfterDelay]);

  const closeModal = useCallback((title: string) => {
    announceForAccessibility(`${title} dialog closed`);
  }, [announceForAccessibility]);

  return {
    openModal,
    closeModal,
  };
};

export default useAccessibility;
