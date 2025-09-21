import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as yup from 'yup';
import { RootState } from '../../redux/store';
import { createLead, updateLead, fetchLeadById, clearError } from '../../redux/slices/leadsSlice';
import { fetchLoanTypes, fetchAssociates } from '../../redux/slices/filterSlice';
import CustomTextInput from '../../components/CustomTextInput';
import CustomDropdown from '../../components/CustomDropdown';
import LoadingButton from '../../components/LoadingButton';
import { Snackbar } from 'react-native-paper';
import { ArrowLeft, Plus, CreditCard as Edit3 } from 'lucide-react-native';

// Validation Schema
const leadSchema = yup.object().shape({
  applicantName: yup
    .string()
    .required('Applicant name is required')
    .min(2, 'Name must be at least 2 characters'),
  applicantProfile: yup
    .string()
    .required('Applicant profile is required'),
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number'),
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address'),
  pincode: yup
    .string()
    .required('Pincode is required')
    .matches(/^[0-9]{6}$/, 'Enter a valid 6-digit pincode'),
  loantType: yup
    .string()
    .required('Loan type is required'),
  loanAmount: yup
    .string()
    .required('Loan amount is required')
    .matches(/^[0-9]+$/, 'Enter a valid amount'),
  city: yup
    .string()
    .required('City is required'),
  state: yup
    .string()
    .required('State is required'),
  businessName: yup
    .string()
    .optional(),
  comments: yup
    .string()
    .optional(),
  partnerId: yup
    .string()
    .optional(),
  assignto: yup
    .string()
    .optional(),
});

interface LeadFormData {
  applicantName: string;
  applicantProfile: string;
  mobile: string;
  email: string;
  pincode: string;
  loantType: string;
  loanAmount: string;
  city: string;
  state: string;
  businessName?: string;
  comments?: string;
  partnerId?: string;
  assignto?: string;
}

const applicantProfileOptions = [
  { label: 'Salaried', value: 'Salaried' },
  { label: 'Self Employed', value: 'Self Employed' },
  { label: 'Business Owner', value: 'Business Owner' },
  { label: 'Professional', value: 'Professional' },
  { label: 'Other', value: 'Other' },
];

const CreateLeadScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { leadId } = route.params || {};
  const isEditMode = !!leadId;

  const { 
    selectedLead,
    isLoading, 
    isUpdating,
    error 
  } = useSelector((state: RootState) => state.leads);
  
  const { 
    loanTypes, 
    associates 
  } = useSelector((state: RootState) => state.filter);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<LeadFormData>({
    resolver: yupResolver(leadSchema),
    defaultValues: {
      applicantName: '',
      applicantProfile: '',
      mobile: '',
      email: '',
      pincode: '',
      loantType: '',
      loanAmount: '',
      city: '',
      state: '',
      businessName: '',
      comments: '',
      partnerId: '',
      assignto: '',
    },
  });

  useEffect(() => {
    // Fetch required data
    dispatch(fetchLoanTypes() as any);
    dispatch(fetchAssociates() as any);

    // If edit mode, fetch lead data
    if (isEditMode && leadId) {
      dispatch(fetchLeadById(leadId) as any);
    }
  }, [dispatch, isEditMode, leadId]);

  useEffect(() => {
    // Populate form with lead data in edit mode
    if (isEditMode && selectedLead) {
      reset({
        applicantName: selectedLead.applicantName,
        applicantProfile: selectedLead.applicantProfile,
        mobile: selectedLead.mobile,
        email: selectedLead.email,
        pincode: selectedLead.pincode.pincode,
        loantType: selectedLead.loan.type,
        loanAmount: selectedLead.loan.amount.toString(),
        city: selectedLead.pincode.city,
        state: selectedLead.pincode.state,
        businessName: selectedLead.businessName || '',
        comments: selectedLead.comments || '',
        partnerId: selectedLead.partnerId._id,
        assignto: selectedLead.associate?._id || '',
      });
    }
  }, [isEditMode, selectedLead, reset]);

  const handleBack = () => {
    navigation.goBack();
  };

  const onSubmit = async (data: LeadFormData) => {
    try {
      setIsSubmitting(true);
      
      if (isEditMode) {
        const result = await dispatch(updateLead({
          leadId: selectedLead!.id,
          ...data,
          assignedTo: data.assignto || '',
          lenderType: selectedLead?.lenderType || '',
        }) as any);
        
        if (updateLead.fulfilled.match(result)) {
          Alert.alert(
            'Success!',
            'Lead updated successfully.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('LeadsTab'),
              },
            ]
          );
        }
      } else {
        const result = await dispatch(createLead(data) as any);
        
        if (createLead.fulfilled.match(result)) {
          Alert.alert(
            'Success!',
            'Lead created successfully.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('LeadsTab'),
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Lead submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  // Convert data to dropdown options
  const loanTypeOptions = loanTypes.map(type => ({
    label: type.name.replace(/_/g, ' '),
    value: type.name,
  }));

  const associateOptions = associates.map(associate => ({
    label: associate.name,
    value: associate._id,
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
              {isEditMode ? 'Edit Lead' : 'Create New Lead'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEditMode ? 'Update lead information' : 'Fill in the details to create a new lead'}
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
            {/* Applicant Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Applicant Information</Text>
              
              <CustomTextInput
                name="applicantName"
                control={control}
                label="Full Name"
                placeholder="Enter applicant's full name"
                autoCapitalize="words"
                error={errors.applicantName}
                style={styles.input}
              />

              <CustomDropdown
                label="Applicant Profile"
                value={watch('applicantProfile')}
                options={applicantProfileOptions}
                onSelect={(value) => setValue('applicantProfile', value)}
                placeholder="Select applicant profile"
                error={errors.applicantProfile?.message}
                required
              />

              <View style={styles.row}>
                <CustomTextInput
                  name="mobile"
                  control={control}
                  label="Mobile Number"
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  error={errors.mobile}
                  style={[styles.input, styles.halfWidth]}
                />

                <CustomTextInput
                  name="email"
                  control={control}
                  label="Email Address"
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  style={[styles.input, styles.halfWidth]}
                />
              </View>
            </View>

            {/* Location Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location Information</Text>
              
              <View style={styles.row}>
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

                <CustomTextInput
                  name="city"
                  control={control}
                  label="City"
                  placeholder="Enter city"
                  autoCapitalize="words"
                  error={errors.city}
                  style={[styles.input, styles.halfWidth]}
                />
              </View>

              <CustomTextInput
                name="state"
                control={control}
                label="State"
                placeholder="Enter state"
                autoCapitalize="words"
                error={errors.state}
                style={styles.input}
              />
            </View>

            {/* Loan Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Loan Information</Text>
              
              <CustomDropdown
                label="Loan Type"
                value={watch('loantType')}
                options={loanTypeOptions}
                onSelect={(value) => setValue('loantType', value)}
                placeholder="Select loan type"
                error={errors.loantType?.message}
                required
              />

              <CustomTextInput
                name="loanAmount"
                control={control}
                label="Loan Amount"
                placeholder="Enter loan amount"
                keyboardType="numeric"
                error={errors.loanAmount}
                style={styles.input}
              />
            </View>

            {/* Additional Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              
              <CustomTextInput
                name="businessName"
                control={control}
                label="Business Name (Optional)"
                placeholder="Enter business name"
                autoCapitalize="words"
                error={errors.businessName}
                style={styles.input}
              />

              <CustomTextInput
                name="comments"
                control={control}
                label="Comments (Optional)"
                placeholder="Enter any additional comments"
                multiline
                numberOfLines={4}
                error={errors.comments}
                style={styles.input}
              />
            </View>

            {/* Assignment Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Assignment (Optional)</Text>
              
              <CustomDropdown
                label="Assign to Associate"
                value={watch('assignto') || ''}
                options={[{ label: 'No Assignment', value: '' }, ...associateOptions]}
                onSelect={(value) => setValue('assignto', value)}
                placeholder="Select associate"
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
                title={isEditMode ? 'Update Lead' : 'Create Lead'}
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting || isLoading || isUpdating}
                style={styles.submitButton}
              />
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Error Snackbar */}
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

export default CreateLeadScreen;