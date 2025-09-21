import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface LoadingButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'contained' | 'outlined';
  style?: ViewStyle;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  mode = 'contained',
  style,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        mode === 'outlined' ? styles.buttonOutlined : styles.buttonContained,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={mode === 'outlined' ? '#00B9AE' : '#FFFFFF'} 
          style={styles.loader}
        />
      )}
      <Text
        style={[
          styles.buttonText,
          mode === 'outlined' ? styles.buttonTextOutlined : styles.buttonTextContained,
          isDisabled && styles.buttonTextDisabled,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
  },
  buttonContained: {
    backgroundColor: '#00B9AE',
  },
  buttonOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#00B9AE',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonTextContained: {
    color: '#FFFFFF',
  },
  buttonTextOutlined: {
    color: '#00B9AE',
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
  loader: {
    marginRight: 8,
  },
});

export default LoadingButton;