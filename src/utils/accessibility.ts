import { AccessibilityInfo, Platform } from 'react-native';

// Accessibility utility functions
export class AccessibilityUtils {
  // Check if screen reader is enabled
  static async isScreenReaderEnabled(): Promise<boolean> {
    try {
      return await AccessibilityInfo.isScreenReaderEnabled();
    } catch (error) {
      console.warn('Error checking screen reader status:', error);
      return false;
    }
  }

  // Check if reduce motion is enabled
  static async isReduceMotionEnabled(): Promise<boolean> {
    try {
      return await AccessibilityInfo.isReduceMotionEnabled();
    } catch (error) {
      console.warn('Error checking reduce motion status:', error);
      return false;
    }
  }

  // Announce message to screen reader
  static announceForAccessibility(message: string): void {
    try {
      AccessibilityInfo.announceForAccessibility(message);
    } catch (error) {
      console.warn('Error announcing for accessibility:', error);
    }
  }

  // Set accessibility focus
  static setAccessibilityFocus(reactTag: number): void {
    try {
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    } catch (error) {
      console.warn('Error setting accessibility focus:', error);
    }
  }

  // Generate accessibility label for news items
  static generateNewsItemLabel(title: string, category: string, date: string): string {
    return `News article: ${title}. Category: ${category}. Published: ${date}`;
  }

  // Generate accessibility hint for interactive elements
  static generateInteractionHint(action: string): string {
    return `Double tap to ${action}`;
  }

  // Format date for accessibility
  static formatDateForAccessibility(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Format time for accessibility
  static formatTimeForAccessibility(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  // Generate loading announcement
  static generateLoadingAnnouncement(context: string): string {
    return `Loading ${context}. Please wait.`;
  }

  // Generate error announcement
  static generateErrorAnnouncement(error: string): string {
    return `Error: ${error}. Please try again.`;
  }

  // Generate success announcement
  static generateSuccessAnnouncement(action: string): string {
    return `Success: ${action} completed.`;
  }

  // Check if element should have accessibility focus
  static shouldFocusElement(isVisible: boolean, isEnabled: boolean): boolean {
    return isVisible && isEnabled;
  }

  // Generate accessibility state for buttons
  static generateButtonAccessibilityState(
    disabled: boolean,
    loading: boolean,
    selected?: boolean
  ) {
    return {
      disabled: disabled || loading,
      busy: loading,
      selected,
    };
  }

  // Generate accessibility props for form inputs
  static generateInputAccessibilityProps(
    label: string,
    value: string,
    error?: string,
    required?: boolean
  ) {
    return {
      accessibilityLabel: label,
      accessibilityValue: { text: value },
      accessibilityInvalid: !!error,
      accessibilityRequired: required,
      accessibilityHint: error || (required ? 'Required field' : undefined),
    };
  }

  // Generate accessibility props for lists
  static generateListAccessibilityProps(
    itemCount: number,
    currentIndex: number,
    itemType: string = 'item'
  ) {
    return {
      accessibilityLabel: `${itemType} ${currentIndex + 1} of ${itemCount}`,
      accessibilityRole: 'listitem' as const,
    };
  }

  // Generate accessibility props for tabs
  static generateTabAccessibilityProps(
    label: string,
    selected: boolean,
    index: number,
    totalTabs: number
  ) {
    return {
      accessibilityLabel: label,
      accessibilityRole: 'tab' as const,
      accessibilityState: { selected },
      accessibilityHint: `Tab ${index + 1} of ${totalTabs}. ${
        selected ? 'Currently selected' : 'Double tap to select'
      }`,
    };
  }

  // Generate accessibility props for images
  static generateImageAccessibilityProps(
    alt: string,
    decorative: boolean = false
  ) {
    if (decorative) {
      return {
        accessible: false,
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants' as const,
      };
    }

    return {
      accessible: true,
      accessibilityLabel: alt,
      accessibilityRole: 'image' as const,
    };
  }

  // Generate accessibility props for headings
  static generateHeadingAccessibilityProps(
    text: string,
    level: number = 1
  ) {
    return {
      accessibilityLabel: text,
      accessibilityRole: 'header' as const,
      accessibilityLevel: level,
    };
  }

  // Check color contrast ratio (simplified)
  static checkColorContrast(
    foreground: string,
    background: string,
    isLargeText: boolean = false
  ): boolean {
    // This is a simplified check - in a real app, you'd use a proper color contrast library
    const minRatio = isLargeText ? 3 : 4.5;
    
    // Convert hex to RGB and calculate luminance
    const getLuminance = (color: string): number => {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const [rs, gs, bs] = [r, g, b].map(c => 
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return ratio >= minRatio;
  }

  // Get platform-specific accessibility props
  static getPlatformAccessibilityProps(
    label: string,
    hint?: string,
    role?: string
  ) {
    const baseProps = {
      accessible: true,
      accessibilityLabel: label,
      accessibilityHint: hint,
    };

    if (Platform.OS === 'ios') {
      return {
        ...baseProps,
        accessibilityTraits: role ? [role] : undefined,
      };
    } else {
      return {
        ...baseProps,
        accessibilityRole: role as any,
      };
    }
  }

  // Validate accessibility requirements
  static validateAccessibility(element: {
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityRole?: string;
    accessible?: boolean;
  }): string[] {
    const issues: string[] = [];

    if (element.accessible !== false) {
      if (!element.accessibilityLabel) {
        issues.push('Missing accessibilityLabel');
      }

      if (element.accessibilityLabel && element.accessibilityLabel.length > 100) {
        issues.push('accessibilityLabel is too long (should be under 100 characters)');
      }

      if (element.accessibilityHint && element.accessibilityHint.length > 200) {
        issues.push('accessibilityHint is too long (should be under 200 characters)');
      }
    }

    return issues;
  }
}

export default AccessibilityUtils;
