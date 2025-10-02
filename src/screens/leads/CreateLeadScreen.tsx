// src/screens/leads/CreateLeadScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../../redux/store';
import { createLead, updateLead, fetchLeadById, clearError } from '../../redux/slices/leadsSlice';
import { fetchLoanTypes, fetchAssociates } from '../../redux/slices/filterSlice';
import CustomTextInput from '../../components/CustomTextInput';
import CustomDropdown from '../../components/CustomDropdown';
import LoadingButton from '../../components/LoadingButton';
import { Snackbar } from 'react-native-paper';
import { ArrowLeft, Plus, CreditCard as Edit3 } from 'lucide-react-native';

// Validation (only fields from the UI)
const leadSchema = yup.object({
  applicantName: yup.string().required('Applicant name is required').min(2, 'Name must be at least 2 characters'),
  applicantProfile: yup.string().required('Applicant profile is required'),
  mobile: yup.string().required('Mobile number is required').matches(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number'),
  email: yup.string().required('Email is required').email('Enter a valid email address'),
  pincode: yup.string().required('Pincode is required').matches(/^[0-9]{6}$/, 'Enter a valid 6-digit pincode'),
  loantType: yup.string().required('Loan type is required'),
  loanAmount: yup.string().required('Loan amount is required').matches(/^[0-9]+$/, 'Enter a valid amount'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  businessName: yup.string().optional(),
  comments: yup.string().optional(),
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
  const leadId: string | undefined = route.params?.leadId;
  const isEditMode = !!leadId;

  const { selectedLead, isLoading, isUpdating, error } = useSelector((s: RootState) => s.leads);
  const { loanTypes } = useSelector((s: RootState) => s.filter);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastPincodeRef = useRef<string>('');

  const {
    control, handleSubmit, formState: { errors },
    setValue, watch, reset,
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
    },
  });

  // fetch lists + lead (if editing)
  useEffect(() => {
    dispatch(fetchLoanTypes() as any);
    dispatch(fetchAssociates() as any); // harmless even though we removed the UI
    if (isEditMode && leadId) dispatch(fetchLeadById(leadId) as any);
  }, [dispatch, isEditMode, leadId]);

  // populate when editing
  useEffect(() => {
    if (isEditMode && selectedLead) {
      reset({
        applicantName: selectedLead.applicantName,
        applicantProfile: selectedLead.applicantProfile,
        mobile: selectedLead.mobile,
        email: selectedLead.email,
        pincode: selectedLead.pincode.pincode,
        loantType: selectedLead.loan.type,
        loanAmount: String(selectedLead.loan.amount ?? ''),
        city: selectedLead.pincode.city,
        state: selectedLead.pincode.state,
        businessName: selectedLead.businessName || '',
        comments: selectedLead.comments || '',
      });
    }
  }, [isEditMode, selectedLead, reset]);

  // Pincode → City/State (debounce, read-only fields)
  const watchPincode = watch('pincode');
  useEffect(() => {
    const pin = watchPincode || '';
    if (pin === lastPincodeRef.current) return;
    lastPincodeRef.current = pin;

    if (pin.length !== 6) {
      setValue('city', '');
      setValue('state', '');
      return;
    }

    const timeout = setTimeout(() => {
      fetch(`https://api.postalpincode.in/pincode/${pin}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length) {
            const { State, District } = data[0].PostOffice[0];
            setValue('state', State || '');
            setValue('city', District || '');
          }
        })
        .catch(() => {});
    }, 500);

    return () => clearTimeout(timeout);
  }, [watchPincode, setValue]);

  const isSalaried = (() => {
    const v = (watch('applicantProfile') || '').toLowerCase();
    return v.includes('salaried');
  })();

  const loanTypeOptions = loanTypes.map((t) => ({
    label: t.name.replace(/_/g, ' '),
    value: t.name,
  }));

  const handleBack = () => navigation.goBack();

  const onSubmit: SubmitHandler<LeadFormData> = async (data) => {
    try {
      setIsSubmitting(true);

      if (isEditMode) {
        const result = await dispatch(
          updateLead({
            leadId: selectedLead!.id,
            applicantName: data.applicantName,
            applicantProfile: data.applicantProfile,
            mobile: data.mobile,
            email: data.email,
            pincode: data.pincode,
            loantType: data.loantType,
            loanAmount: data.loanAmount,
            comments: data.comments || '',
            businessName: isSalaried ? '' : (data.businessName || ''),
            city: data.city,
            state: data.state,
            // not on form — pass sensible defaults:
            partnerId: selectedLead?.partnerId?._id || '',
            assignedTo: selectedLead?.associate?._id || '',
            lenderType: selectedLead?.lenderType || '',
          }) as any
        );

        if (updateLead.fulfilled.match(result)) {
          Alert.alert('Success!', 'Lead updated successfully.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      } else {
        const result = await dispatch(
          createLead({
            applicantName: data.applicantName,
            applicantProfile: data.applicantProfile,
            mobile: data.mobile,
            email: data.email,
            pincode: data.pincode,
            loantType: data.loantType,
            loanAmount: data.loanAmount,
            comments: data.comments || '',
            businessName: isSalaried ? '' : (data.businessName || ''),
            city: data.city,
            state: data.state,
            // not in UI — backend still expects keys:
            partnerId: '',
            assignedTo: '',
            lenderType: '',
          }) as any
        );

        if (createLead.fulfilled.match(result)) {
          Alert.alert('Success!', 'Lead created successfully.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#7C3AED', '#EC4899']} style={styles.gradient}>
        {/* Smaller header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              {isEditMode ? <Edit3 size={18} color="#FFFFFF" strokeWidth={2} /> : <Plus size={18} color="#FFFFFF" strokeWidth={2} />}
            </View>
            <Text style={styles.headerTitle}>{isEditMode ? 'Edit Lead' : 'Create Lead'}</Text>
            <Text style={styles.headerSubtitle}>
              {isEditMode ? 'Update lead information' : 'Fill in the details to create a new lead'}
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Applicant */}
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
                onSelect={(v) => setValue('applicantProfile', v)}
                placeholder="Select applicant profile"
                error={errors.applicantProfile?.message}
                required
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <CustomTextInput
                    name="mobile"
                    control={control}
                    label="Mobile Number"
                    placeholder="Enter mobile number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    error={errors.mobile}
                    style={styles.input}
                  />
                </View>

                <View style={styles.halfWidth}>
                  <CustomTextInput
                    name="email"
                    control={control}
                    label="Email Address"
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location Information</Text>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <CustomTextInput
                    name="pincode"
                    control={control}
                    label="Pincode"
                    placeholder="Enter pincode"
                    keyboardType="numeric"
                    maxLength={6}
                    error={errors.pincode}
                    style={styles.input}
                  />
                </View>

                <View style={styles.halfWidth}>
                  <CustomTextInput
                    name="city"
                    control={control}
                    label="City"
                    placeholder="Auto-filled from pincode"
                    autoCapitalize="words"
                    error={errors.city}
                    style={styles.input}
                    editable={false}
                  />
                </View>
              </View>

              <CustomTextInput
                name="state"
                control={control}
                label="State"
                placeholder="Auto-filled from pincode"
                autoCapitalize="words"
                error={errors.state}
                style={styles.input}
                editable={false}
              />
            </View>

            {/* Loan */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Loan Information</Text>

              <CustomDropdown
                label="Loan Type"
                value={watch('loantType')}
                options={loanTypeOptions}
                onSelect={(v) => setValue('loantType', v)}
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

            {/* Additional */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Information</Text>

              {!isSalaried && (
                <CustomTextInput
                  name="businessName"
                  control={control}
                  label="Business Name"
                  placeholder="Enter business name"
                  autoCapitalize="words"
                  error={errors.businessName}
                  style={styles.input}
                />
              )}

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

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <LoadingButton title="Cancel" onPress={handleBack} mode="outlined" style={styles.cancelButton} />
              <LoadingButton
                title={isEditMode ? 'Update Lead' : 'Create Lead'}
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting || isLoading || isUpdating}
                style={styles.submitButton}
              />
            </View>

            <View style={{ height: 80 }} />
          </ScrollView>
        </View>
      </LinearGradient>

      <Snackbar
        visible={!!error}
        onDismiss={() => dispatch(clearError())}
        action={{ label: 'Dismiss', onPress: () => dispatch(clearError()) }}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: { paddingTop: 32, paddingHorizontal: 16, paddingBottom: 16 },
  backButton: { marginBottom: 12, padding: 4 },
  headerContent: { alignItems: 'center' },
  iconContainer: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6, textAlign: 'center' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', fontWeight: '500' },
  formContainer: {
    flex: 1, backgroundColor: '#fff',
    borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 6,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  section: { marginBottom: 26 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 12, letterSpacing: -0.2 },
  input: { marginBottom: 14 },
  row: { flexDirection: 'row', gap: 12 },
  halfWidth: { flex: 1 },
  buttonContainer: { flexDirection: 'row', gap: 12, marginTop: 12 },
  cancelButton: { flex: 1 },
  submitButton: { flex: 2 },
});

export default CreateLeadScreen;
