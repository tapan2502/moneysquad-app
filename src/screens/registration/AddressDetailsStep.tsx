import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { updateAddressDetails, setCurrentStep, clearError } from '../../redux/slices/registrationSlice';
import { addressSchema } from '../../utils/validation';
import CustomTextInput from '../../components/CustomTextInput';
import CustomDropdown from '../../components/CustomDropdown';
import LoadingButton from '../../components/LoadingButton';
import { Snackbar } from 'react-native-paper';
import { ChevronLeft } from 'lucide-react-native';

interface AddressDetailsFormData {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  pincode: string;
  addressType: string;
  landmark?: string;
}

const addressTypeOptions = [
  { label: 'Residential', value: 'Residential' },
  { label: 'Commercial', value: 'Commercial' },
  { label: 'Office', value: 'Office' },
];

const AddressDetailsStep: React.FC = () => {
  const dispatch = useDispatch();
  const { addressDetails, isLoading, error } = useSelector(
    (state: RootState) => state.registration
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddressDetailsFormData>({
    resolver: yupResolver(addressSchema),
    defaultValues: addressDetails,
  });

  const onSubmit = (data: AddressDetailsFormData) => {
    dispatch(updateAddressDetails(data));
    dispatch(setCurrentStep(4));
  };

  const handleBack = () => {
    dispatch(setCurrentStep(2));
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#00B9AE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Address Details</Text>
      </View>

      <View style={styles.content}>
        <CustomTextInput
          name="addressLine1"
          control={control}
          label="Address Line 1"
          placeholder="Enter your address"
          error={errors.addressLine1}
          style={styles.input}
        />

        <CustomTextInput
          name="addressLine2"
          control={control}
          label="Address Line 2 (Optional)"
          placeholder="Enter additional address details"
          error={errors.addressLine2}
          style={styles.input}
        />

        <View style={styles.row}>
          <CustomTextInput
            name="city"
            control={control}
            label="City"
            placeholder="Enter city"
            error={errors.city}
            style={[styles.input, styles.halfWidth]}
          />

          <CustomTextInput
            name="pincode"
            control={control}
            label="Pincode"
            placeholder="Enter pincode"
            keyboardType="numeric"
            maxLength={6}
            error={errors.pincode}
            style={[styles.input, styles.halfWidth]}
          />
        </View>

        <CustomDropdown
          label="Address Type"
          value={watch('addressType')}
          options={addressTypeOptions}
          onSelect={(value) => setValue('addressType', value)}
          placeholder="Select address type"
          error={errors.addressType?.message}
          required
        />

        <CustomTextInput
          name="landmark"
          control={control}
          label="Landmark (Optional)"
          placeholder="Enter nearby landmark"
          error={errors.landmark}
          style={styles.input}
        />

        <View style={styles.buttonContainer}>
          <LoadingButton
            title="Back"
            onPress={handleBack}
            mode="outlined"
            style={styles.backButtonStyle}
          />
          <LoadingButton
            title="Continue"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={styles.continueButton}
          />
        </View>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={handleDismissError}
        action={{
          label: 'Dismiss',
          onPress: handleDismissError,
        }}
      >
        {error}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  content: {
    padding: 24,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButtonStyle: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
});

export default AddressDetailsStep;