import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { updateBankDetails, setCurrentStep, clearError, fetchBanks } from '../../redux/slices/registrationSlice';
import { bankDetailsSchema } from '../../utils/validation';
import CustomTextInput from '../../components/CustomTextInput';
import CustomDropdown from '../../components/CustomDropdown';
import LoadingButton from '../../components/LoadingButton';
import { Snackbar } from 'react-native-paper';
import { ChevronLeft } from 'lucide-react-native';

interface BankDetailsFormData {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  accountType: string;
  isGstBillingApplicable: boolean | 'true' | 'false';
  // NEW FIELD (we'll update slice types separately)
  relationshipWithAccountHolder: string;
}

const accountTypeOptions = [
  { label: 'Savings', value: 'Savings' },
  { label: 'Current', value: 'Current' },
  { label: 'Other', value: 'Other' },
];

const gstOptions = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

// NEW: exact options like web
const relationshipOptions = [
  { label: 'Self', value: 'Self' },
  { label: 'Company', value: 'Company' },
  { label: 'Spouse', value: 'Spouse' },
  { label: 'Parent', value: 'Parent' },
  { label: 'Others', value: 'Others' },
];

const BankDetailsStep: React.FC = () => {
  const dispatch = useDispatch();
  const { bankDetails, banks, isLoading, error } = useSelector(
    (state: RootState) => state.registration
  );

  useEffect(() => {
    // Fetch banks when component mounts
    dispatch(fetchBanks() as any);
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BankDetailsFormData>({
    resolver: yupResolver(bankDetailsSchema),
    defaultValues: {
      ...bankDetails,
      isGstBillingApplicable: (bankDetails as any)?.isGstBillingApplicable ?? false,
      // NEW default (until slice updated)
      relationshipWithAccountHolder: (bankDetails as any)?.relationshipWithAccountHolder ?? '',
    } as any,
  });

  const watchedAccountType = watch('accountType');
  const showGstOption = watchedAccountType === 'Current' || watchedAccountType === 'Other';

  // Convert banks to dropdown options
  const bankOptions = banks.map(bank => ({
    label: bank.name,
    value: bank.name,
  }));

  const onSubmit = (data: BankDetailsFormData) => {
    const isGstBool =
      data.isGstBillingApplicable === true || data.isGstBillingApplicable === 'true';

    // NOTE: We cast to any until slice types include `relationshipWithAccountHolder`
    dispatch(updateBankDetails({
      ...data,
      isGstBillingApplicable: isGstBool,
      relationshipWithAccountHolder: data.relationshipWithAccountHolder,
    } as any));

    dispatch(setCurrentStep(5));
  };

  const handleBack = () => {
    dispatch(setCurrentStep(3));
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
        <Text style={styles.headerTitle}>Bank Details</Text>
      </View>

      <View style={styles.content}>
        <CustomTextInput
          name="accountHolderName"
          control={control}
          label="Account Holder Name"
          placeholder="Enter account holder name"
          autoCapitalize="words"
          error={errors.accountHolderName}
          style={styles.input}
        />

        <CustomTextInput
          name="accountNumber"
          control={control}
          label="Account Number"
          placeholder="Enter account number"
          keyboardType="numeric"
          error={errors.accountNumber}
          style={styles.input}
        />

        <CustomDropdown
          label="Bank Name"
          value={watch('bankName')}
          options={bankOptions}
          onSelect={(value) => setValue('bankName', value)}
          placeholder="Select bank name"
          error={errors.bankName?.message}
          required
        />

        <CustomTextInput
          name="branchName"
          control={control}
          label="Branch Name"
          placeholder="Enter branch name"
          autoCapitalize="words"
          error={errors.branchName}
          style={styles.input}
        />

        <CustomTextInput
          name="ifscCode"
          control={control}
          label="IFSC Code"
          placeholder="Enter IFSC code"
          autoCapitalize="characters"
          error={errors.ifscCode}
          style={styles.input}
        />

        <CustomDropdown
          label="Account Type"
          value={watch('accountType')}
          options={accountTypeOptions}
          onSelect={(value) => setValue('accountType', value)}
          placeholder="Select account type"
          error={errors.accountType?.message}
          required
        />

        {/* NEW: Relationship with Account Holder (required) */}
        <CustomDropdown
          label="Relationship with Account Holder"
          value={watch('relationshipWithAccountHolder')}
          options={relationshipOptions}
          onSelect={(value) => setValue('relationshipWithAccountHolder', value)}
          placeholder="Select relationship"
          error={(errors as any).relationshipWithAccountHolder?.message}
          required
        />

        {showGstOption && (
          <CustomDropdown
            label="GST Billing Applicable"
            value={watch('isGstBillingApplicable')?.toString() || 'false'}
            options={gstOptions}
            onSelect={(value) => setValue('isGstBillingApplicable', value === 'true')}
            placeholder="Select GST billing preference"
            error={(errors as any).isGstBillingApplicable?.message}
            required
          />
        )}

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
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827', flex: 1 },
  content: { padding: 24 },
  input: { marginBottom: 16 },
  buttonContainer: { flexDirection: 'row', gap: 12, marginTop: 24 },
  backButtonStyle: { flex: 1 },
  continueButton: { flex: 2 },
});

export default BankDetailsStep;
