import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StyleProp, ViewStyle, TextStyle } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, X } from 'lucide-react-native';

interface CustomDatePickerProps {
  label?: string;
  value: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  hideLabel?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  clearable?: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onDateChange,
  placeholder = 'Select date',
  error,
  required = false,
  hideLabel = false,
  containerStyle,
  labelStyle,
  clearable = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const handleDatePress = () => {
    if (Platform.OS === 'web') {
      // For web platform, use HTML5 date input
      const input = document.createElement('input');
      input.type = 'date';
      input.value = value;
      input.style.position = 'absolute';
      input.style.left = '-9999px';
      input.style.opacity = '0';
      document.body.appendChild(input);
      
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.value) {
          onDateChange(target.value);
        }
        document.body.removeChild(input);
      };
      
      input.onclick = (e) => {
        e.stopPropagation();
      };
      
      input.focus();
      input.click();
    } else {
      // For native platforms, show the native date picker
      setShowPicker(true);
    }
  };

  const formatDateForStorage = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    
    if (selectedDate && event.type !== 'dismissed') {
      onDateChange(formatDateForStorage(selectedDate));
    }
  };

  const getDateValue = () => {
    if (!value) return new Date();
    return new Date(value);
  };

  const handleClear = () => {
    setShowPicker(false);
    onDateChange('');
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {!hideLabel && label !== undefined && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <TouchableOpacity
        style={[styles.dateInput, error && styles.dateInputError]}
        onPress={handleDatePress}
      >
        <Text style={[styles.dateText, !value && styles.placeholder]}>
          {value ? formatDate(value) : placeholder}
        </Text>

        {clearable && !!value && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <X size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        <Calendar size={20} color="#6B7280" />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {showPicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={getDateValue()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
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
  required: {
    color: '#EF4444',
  },
  dateInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  placeholder: {
    color: '#9CA3AF',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  clearButton: {
    marginRight: 12,
    padding: 4,
  },
});

export default CustomDatePicker;
