import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as yup from 'yup';
import { RootState } from '../../redux/store';
import {
  createOffer,
  updateOffer,
  fetchOfferById,
  clearOffersState,
  CreateOfferRequest,
} from '../../redux/slices/offersSlice';
import { fetchLoanTypes } from '../../redux/slices/filterSlice';
import CustomTextInput from '../../components/CustomTextInput';
import CustomDropdown from '../../components/CustomDropdown';
import DocumentUpload from '../../components/DocumentUpload';
import LoadingButton from '../../components/LoadingButton';
import { Snackbar } from 'react-native-paper';
import { ArrowLeft, Plus, CreditCard as Edit3, Star, X } from 'lucide-react-native';

// Validation Schema
const offerSchema = yup.object().shape({
  bankName: yup.string().required('Bank name is required'),
  offerHeadline: yup.string().required('Offer headline is required'),
  offerValidity: yup.string().required('Offer validity is required'),
  loanType: yup.string().required('Loan type is required'),
  interestRate: yup
    .number()
    .required('Interest rate is required')
    .min(0, 'Interest rate must be positive')
    .max(100, 'Interest rate cannot exceed 100%'),
  processingFee: yup
    .number()
    .required('Processing fee is required')
    .min(0, 'Processing fee must be positive'),
  processingFeeType: yup
    .string()
    .oneOf(['rupee', 'percentage'], 'Invalid processing fee type')
    .required('Processing fee type is required'),
  minAge: yup
    .number()
    .required('Minimum age is required')
    .min(18, 'Minimum age must be at least 18')
    .max(100, 'Invalid minimum age'),
  maxAge: yup
    .number()
    .required('Maximum age is required')
    .min(18, 'Maximum age must be at least 18')
    .max(100, 'Invalid maximum age'),
  minIncome: yup
    .number()
    .required('Minimum income is required')
    .min(0, 'Minimum income must be positive'),
  employmentType: yup.string().required('Employment type is required'),
  maxCreditScore: yup
    .number()
    .required('Maximum credit score is required')
    .min(300, 'Credit score must be at least 300')
    .max(900, 'Credit score cannot exceed 900'),
});

interface OfferFormData {
  bankName: string;
  offerHeadline: string;
  offerValidity: string;
  loanType: string;
  interestRate: number;
  processingFee: number;
  processingFeeType: 'rupee' | 'percentage';
  minAge: number;
  maxAge: number;
  minIncome: number;
  employmentType: string;
  maxCreditScore: number;
}

const employmentTypeOptions = [
  { label: 'Salaried', value: 'Salaried' },
  { label: 'Self Employed', value: 'Self Employed' },
  { label: 'Business Owner', value: 'Business Owner' },
  { label: 'Professional', value: 'Professional' },
  { label: 'Any', value: 'Any' },
];

const processingFeeTypeOptions = [
  { label: 'Rupees (₹)', value: 'rupee' },
  { label: 'Percentage (%)', value: 'percentage' },
];

const CreateOfferScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { offerId } = route.params || {};
  const isEditMode = !!offerId;

  const { selectedOffer, loading, error, success } = useSelector(
    (state: RootState) => state.offers
  );
  const { loanTypes } = useSelector((state: RootState) => state.filter);

  const [bankImage, setBankImage] = useState<any>(null);
  const [keyFeatures, setKeyFeatures] = useState<string[]>(['']);
  const [isFeatured, setIsFeatured] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<OfferFormData>({
    resolver: yupResolver(offerSchema),
    defaultValues: {
      bankName: '',
      offerHeadline: '',
      offerValidity: '',
      loanType: '',
      interestRate: 0,
      processingFee: 0,
      processingFeeType: 'percentage',
      minAge: 21,
      maxAge: 65,
      minIncome: 25000,
      employmentType: '',
      maxCreditScore: 750,
    },
  });

  useEffect(() => {
    dispatch(fetchLoanTypes() as any);

    if (isEditMode && offerId) {
      dispatch(fetchOfferById(offerId) as any);
    }
  }, [dispatch, isEditMode, offerId]);

  useEffect(() => {
    if (isEditMode && selectedOffer) {
      reset({
        bankName: selectedOffer.bankName,
        offerHeadline: selectedOffer.offerHeadline,
        offerValidity: selectedOffer.offerValidity.split('T')[0], // Format date for input
        loanType: selectedOffer.loanType,
        interestRate: selectedOffer.interestRate,
        processingFee: selectedOffer.processingFee,
        processingFeeType: selectedOffer.processingFeeType,
        minAge: selectedOffer.eligibility?.minAge || 21,
        maxAge: selectedOffer.eligibility?.maxAge || 65,
        minIncome: selectedOffer.eligibility?.minIncome || 25000,
        employmentType: selectedOffer.eligibility?.employmentType || '',
        maxCreditScore: selectedOffer.eligibility?.maxCreditScore || 750,
      });
      setKeyFeatures(selectedOffer.keyFeatures.length ? selectedOffer.keyFeatures : ['']);
      setIsFeatured(selectedOffer.isFeatured);
      setBankImage(selectedOffer.bankImage);
    }
  }, [isEditMode, selectedOffer, reset]);

  const handleBack = () => {
    navigation.goBack();
  };

  const addKeyFeature = () => {
    setKeyFeatures([...keyFeatures, '']);
  };

  const removeKeyFeature = (index: number) => {
    if (keyFeatures.length > 1) {
      setKeyFeatures(keyFeatures.filter((_, i) => i !== index));
    }
  };

  const updateKeyFeature = (index: number, value: string) => {
    const updated = [...keyFeatures];
    updated[index] = value;
    setKeyFeatures(updated);
  };

  const onSubmit = async (data: OfferFormData) => {
    try {
      const filteredFeatures = keyFeatures.filter(feature => feature.trim() !== '');
      
      if (filteredFeatures.length === 0) {
        Alert.alert('Error', 'Please add at least one key feature');
        return;
      }

      const offerData: CreateOfferRequest = {
        bankName: data.bankName,
        bankImage: bankImage || '',
        offerHeadline: data.offerHeadline,
        offerValidity: data.offerValidity,
        loanType: data.loanType,
        interestRate: data.interestRate,
        processingFee: data.processingFee,
        processingFeeType: data.processingFeeType,
        isFeatured,
        keyFeatures: filteredFeatures,
        eligibility: {
          minAge: data.minAge,
          maxAge: data.maxAge,
          minIncome: data.minIncome,
          employmentType: data.employmentType,
          maxCreditScore: data.maxCreditScore,
        },
      };

      let result;
      if (isEditMode) {
        result = await dispatch(updateOffer({ id: offerId, offerData }) as any);
      } else {
        result = await dispatch(createOffer(offerData) as any);
      }

      if (createOffer.fulfilled.match(result) || updateOffer.fulfilled.match(result)) {
        Alert.alert(
          'Success!',
          `Offer ${isEditMode ? 'updated' : 'created'} successfully.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Offers'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Offer submission failed:', error);
    }
  };

  const handleDismissError = () => {
    dispatch(clearOffersState());
  };

  // Convert loan types to dropdown options
  const loanTypeOptions = loanTypes.map(type => ({
    label: type.name.replace(/_/g, ' '),
    value: type.name,
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#4F46E5', '#7C3AED', '#EC4899']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              {isEditMode ? (
                <Edit3 size={20} color="#FFFFFF" strokeWidth={2} />
              ) : (
                <Plus size={20} color="#FFFFFF" strokeWidth={2} />
              )}
            </View>
            <Text style={styles.headerTitle}>
              {isEditMode ? 'Edit Offer' : 'Create New Offer'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEditMode ? 'Update offer details' : 'Fill in the details to create a new offer'}
            </Text>
          </View>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Bank Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bank Information</Text>

              <CustomTextInput
                name="bankName"
                control={control}
                label="Bank Name"
                placeholder="Enter bank name"
                autoCapitalize="words"
                error={errors.bankName}
                style={styles.input}
              />

              <DocumentUpload
                label="Bank Logo"
                value={bankImage}
                onFileSelect={setBankImage}
                onFileRemove={() => setBankImage(null)}
                acceptedFormats={['image/jpeg', 'image/png']}
              />
            </View>

            {/* Offer Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Offer Details</Text>

              <CustomTextInput
                name="offerHeadline"
                control={control}
                label="Offer Headline"
                placeholder="Enter attractive offer headline"
                error={errors.offerHeadline}
                style={styles.input}
              />

              <CustomTextInput
                name="offerValidity"
                control={control}
                label="Offer Validity"
                placeholder="YYYY-MM-DD"
                error={errors.offerValidity}
                style={styles.input}
              />

              <CustomDropdown
                label="Loan Type"
                value={watch('loanType')}
                options={loanTypeOptions}
                onSelect={(value) => setValue('loanType', value)}
                placeholder="Select loan type"
                error={errors.loanType?.message}
                required
              />

              <TouchableOpacity
                style={[styles.featuredToggle, isFeatured && styles.featuredToggleActive]}
                onPress={() => setIsFeatured(!isFeatured)}
              >
                <Star
                  size={20}
                  color={isFeatured ? '#FFD700' : '#9CA3AF'}
                  fill={isFeatured ? '#FFD700' : 'transparent'}
                  strokeWidth={2}
                />
                <Text style={[styles.featuredText, isFeatured && styles.featuredTextActive]}>
                  Featured Offer
                </Text>
              </TouchableOpacity>
            </View>

            {/* Financial Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Financial Details</Text>

              <CustomTextInput
                name="interestRate"
                control={control}
                label="Interest Rate (%)"
                placeholder="Enter interest rate"
                keyboardType="numeric"
                error={errors.interestRate}
                style={styles.input}
              />

              <View style={styles.row}>
                <CustomTextInput
                  name="processingFee"
                  control={control}
                  label="Processing Fee"
                  placeholder="Enter processing fee"
                  keyboardType="numeric"
                  error={errors.processingFee}
                  style={[styles.input, styles.halfWidth]}
                />

                <CustomDropdown
                  label="Fee Type"
                  value={watch('processingFeeType')}
                  options={processingFeeTypeOptions}
                  onSelect={(value) => setValue('processingFeeType', value as 'rupee' | 'percentage')}
                  placeholder="Select type"
                  error={errors.processingFeeType?.message}
                  required
                />
              </View>
            </View>

            {/* Key Features Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Features</Text>

              {keyFeatures.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <TextInput
                    style={styles.featureInput}
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChangeText={(value) => updateKeyFeature(index, value)}
                    placeholderTextColor="#9CA3AF"
                  />
                  {keyFeatures.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeFeatureButton}
                      onPress={() => removeKeyFeature(index)}
                    >
                      <X size={20} color="#EF4444" strokeWidth={2} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity style={styles.addFeatureButton} onPress={addKeyFeature}>
                <Plus size={20} color="#4F46E5" strokeWidth={2} />
                <Text style={styles.addFeatureText}>Add Feature</Text>
              </TouchableOpacity>
            </View>

            {/* Eligibility Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Eligibility Criteria</Text>

              <View style={styles.row}>
                <CustomTextInput
                  name="minAge"
                  control={control}
                  label="Minimum Age"
                  placeholder="21"
                  keyboardType="numeric"
                  error={errors.minAge}
                  style={[styles.input, styles.halfWidth]}
                />

                <CustomTextInput
                  name="maxAge"
                  control={control}
                  label="Maximum Age"
                  placeholder="65"
                  keyboardType="numeric"
                  error={errors.maxAge}
                  style={[styles.input, styles.halfWidth]}
                />
              </View>

              <CustomTextInput
                name="minIncome"
                control={control}
                label="Minimum Income (₹)"
                placeholder="Enter minimum income"
                keyboardType="numeric"
                error={errors.minIncome}
                style={styles.input}
              />

              <CustomDropdown
                label="Employment Type"
                value={watch('employmentType')}
                options={employmentTypeOptions}
                onSelect={(value) => setValue('employmentType', value)}
                placeholder="Select employment type"
                error={errors.employmentType?.message}
                required
              />

              <CustomTextInput
                name="maxCreditScore"
                control={control}
                label="Maximum Credit Score"
                placeholder="750"
                keyboardType="numeric"
                error={errors.maxCreditScore}
                style={styles.input}
              />
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <LoadingButton
                title="Cancel"
                onPress={handleBack}
                mode="outlined"
                style={styles.cancelButton}
              />
              <LoadingButton
                title={isEditMode ? 'Update Offer' : 'Create Offer'}
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                style={styles.submitButton}
              />
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Error/Success Snackbar */}
      <Snackbar
        visible={!!(error || success)}
        onDismiss={handleDismissError}
        action={{
          label: 'Dismiss',
          onPress: handleDismissError,
        }}
      >
        {error || success}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 20,
    padding: 4,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.3,
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
  featuredToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  featuredToggleActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  featuredText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  featuredTextActive: {
    color: '#F59E0B',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  featureInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  removeFeatureButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFeatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'flex-start',
  },
  addFeatureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default CreateOfferScreen;