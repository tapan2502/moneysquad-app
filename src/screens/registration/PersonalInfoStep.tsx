import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { updatePersonalInfo, setCurrentStep, clearError } from '../../redux/slices/registrationSlice';
import { personalInfoSchema } from '../../utils/validation';
import CustomTextInput from '../../components/CustomTextInput';
import CustomDropdown from '../../components/CustomDropdown';
import CustomDatePicker from '../../components/CustomDatePicker';
import LoadingButton from '../../components/LoadingButton';
import { Snackbar } from 'react-native-paper';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

interface PersonalInfoFormData {
  dateOfBirth: string;
  currentProfession: string;
  emergencyContactNumber: string;
  experienceInSellingLoans: string;
  focusProduct: string;
  roleSelection: string;
}

const professionOptions = [
  { label: 'Freelancer', value: 'Freelancer' },
  { label: 'Financial Advisor', value: 'Financial Advisor' },
  { label: 'Insurance Agent', value: 'Insurance Agent' },
  { label: 'Property Dealer', value: 'Property Dealer' },
  { label: 'Chartered Accountant', value: 'Chartered Accountant' },
  { label: 'Wealth Manager', value: 'Wealth Manager' },
  { label: 'Loan Agent/DSA', value: 'Loan Agent/DSA' },
  { label: 'Bank Employee', value: 'Bank Employee' },
  { label: 'Retired Individual', value: 'Retired Individual' },
  { label: 'Salaried Individual', value: 'Salaried Individual' },
  { label: 'Student', value: 'Student' },
  { label: 'Other', value: 'Other' },
];

const experienceOptions = [
  { label: 'Completely New', value: 'Completely New' },
  { label: 'Less than 12 months', value: 'Less than 12 months' },
  { label: '1 Year - 3 Years', value: '1 Year - 3 Years' },
  { label: '3 Years - 10 Years', value: '3 Years - 10 Years' },
  { label: 'More than 10 Years', value: 'More than 10 Years' },
];

const focusProductOptions = [
  { label: 'Credit Card', value: 'Credit Card' },
  { label: 'Personal Loan', value: 'Personal Loan' },
  { label: 'Business Loan', value: 'Business Loan' },
  { label: 'Home Loan', value: 'Home Loan' },
  { label: 'Insurance', value: 'Insurance' },
  { label: 'Other', value: 'Other' },
];

const roleOptions = [
  { label: 'File sharing', value: 'fileSharing' },
  { label: 'Lead Sharing', value: 'leadSharing' },

];

const PersonalInfoStep: React.FC = () => {
  const dispatch = useDispatch();
  const { personalInfo, basicInfo, isLoading, error } = useSelector(
    (state: RootState) => state.registration
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PersonalInfoFormData>({
    resolver: yupResolver(personalInfoSchema),
    defaultValues: personalInfo,
  });

  const onSubmit = (data: PersonalInfoFormData) => {
    dispatch(updatePersonalInfo(data));
    dispatch(setCurrentStep(3));
  };

  const handleBack = () => {
    dispatch(setCurrentStep(1));
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
        <Text style={styles.welcomeText}>Welcome, {basicInfo.fullName}!</Text>
      </View>

      <View style={styles.content}>
        <CustomDatePicker
          label="Date of Birth"
          value={watch('dateOfBirth')}
          onDateChange={(date) => setValue('dateOfBirth', date)}
          placeholder="Select your date of birth"
          error={errors.dateOfBirth?.message}
          required
        />

        <CustomDropdown
          label="Current Profession"
          value={watch('currentProfession')}
          options={professionOptions}
          onSelect={(value) => setValue('currentProfession', value)}
          placeholder="Select your profession"
          error={errors.currentProfession?.message}
          required
        />

        <CustomTextInput
          name="emergencyContactNumber"
          control={control}
          label="Emergency Contact Number"
          placeholder="Enter emergency contact number"
          keyboardType="phone-pad"
          maxLength={10}
          error={errors.emergencyContactNumber}
          style={styles.input}
        />

        <CustomDropdown
          label="Experience in Selling Loans"
          value={watch('experienceInSellingLoans')}
          options={experienceOptions}
          onSelect={(value) => setValue('experienceInSellingLoans', value)}
          placeholder="Select your experience level"
          error={errors.experienceInSellingLoans?.message}
          required
        />

        <CustomDropdown
          label="Focus Product"
          value={watch('focusProduct')}
          options={focusProductOptions}
          onSelect={(value) => setValue('focusProduct', value)}
          placeholder="Select your focus product"
          error={errors.focusProduct?.message}
          required
        />

        <CustomDropdown
          label="Role Selection"
          value={watch('roleSelection')}
          options={roleOptions}
          onSelect={(value) => setValue('roleSelection', value)}
          placeholder="Select your desired role"
          error={errors.roleSelection?.message}
          required
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
  welcomeText: {
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

export default PersonalInfoStep;