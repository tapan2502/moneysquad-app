import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { Control, Controller, FieldError } from 'react-hook-form';
import { TextInputProps } from 'react-native';

interface CustomTextInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  name: string;
  control: Control<any>;
  label: string;
  error?: FieldError;
  style?: ViewStyle;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  name,
  control,
  label,
  error,
  style,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <View style={[styles.container, style]}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            {...props}
            value={value}
            onChangeText={onChange}
            style={[
              styles.input,
              error && styles.inputError
            ]}
            placeholderTextColor="#9CA3AF"
          />
          {error && (
            <Text style={styles.errorText}>{error.message}</Text>
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
});

export default CustomTextInput;