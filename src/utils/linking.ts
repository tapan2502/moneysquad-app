// src/utils/linking.ts
import { Linking, Platform, Alert } from 'react-native';

/**
 * Safely open a URL with proper error handling for APK builds
 * This function works better in production APK builds than direct Linking.openURL
 */
export const openURLSafe = async (url: string, errorMessage?: string): Promise<boolean> => {
  try {
    // Check if the URL can be opened
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      if (errorMessage) {
        Alert.alert('Cannot Open', errorMessage);
      }
      return false;
    }
  } catch (error) {
    console.error('Error opening URL:', error);
    if (errorMessage) {
      Alert.alert('Error', errorMessage);
    }
    return false;
  }
};

/**
 * Open phone dialer with the given phone number
 */
export const openPhoneDialer = async (phoneNumber: string | undefined) => {
  if (!phoneNumber) return false;

  // Remove spaces and special characters except +
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');

  return openURLSafe(
    `tel:${cleanNumber}`,
    'Unable to open phone dialer. Please check if your device supports making calls.'
  );
};

/**
 * Open email client with the given email address
 */
export const openEmailClient = async (email: string | undefined) => {
  if (!email) return false;

  return openURLSafe(
    `mailto:${email}`,
    'Unable to open email client. Please check if you have an email app installed.'
  );
};

/**
 * Open WhatsApp with the given phone number
 */
export const openWhatsApp = async (phoneNumber: string | undefined) => {
  if (!phoneNumber) return false;

  // Remove spaces and special characters
  const cleanNumber = phoneNumber.replace(/\s+/g, '');

  // Try WhatsApp native scheme first (better for apps)
  const whatsappUrl = `whatsapp://send?phone=${cleanNumber}`;
  const webUrl = `https://wa.me/${cleanNumber}`;

  try {
    const supported = await Linking.canOpenURL(whatsappUrl);
    if (supported) {
      await Linking.openURL(whatsappUrl);
      return true;
    } else {
      // Fallback to web URL if native app not installed
      return openURLSafe(webUrl, 'Unable to open WhatsApp');
    }
  } catch (error) {
    // Try web URL as final fallback
    return openURLSafe(webUrl, 'Unable to open WhatsApp');
  }
};

/**
 * Generic contact handler for different contact types
 */
export const handleContactPress = async (
  type: 'email' | 'phone' | 'whatsapp',
  contact?: string
): Promise<boolean> => {
  if (!contact) return false;

  switch (type) {
    case 'email':
      return openEmailClient(contact);
    case 'phone':
      return openPhoneDialer(contact);
    case 'whatsapp':
      return openWhatsApp(contact);
    default:
      return false;
  }
};
