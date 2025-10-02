// src/screens/registration/PreviewStep.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../redux/store';
import { setCurrentStep, submitRegistration, clearError } from '../../redux/slices/registrationSlice';
import LoadingButton from '../../components/LoadingButton';
import { Snackbar } from 'react-native-paper';
import { ChevronLeft, CreditCard as Edit3, Check } from 'lucide-react-native';

const PreviewStep: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const { 
    basicInfo, 
    personalInfo, 
    addressDetails, 
    bankDetails, 
    documents, 
    isSubmitting, 
    error 
  } = useSelector((state: RootState) => state.registration);

  const handleSubmit = async () => {
    console.log('🟢 handleSubmit pressed');
    try {
      const action = await dispatch(submitRegistration());
      if (submitRegistration.fulfilled.match(action)) {
        Alert.alert(
          'Success!',
          'Your registration has been submitted successfully. You will receive a confirmation email shortly.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Failed', String(action.payload || 'Submission failed'));
      }
    } catch (e: any) {
      Alert.alert('Error', String(e?.message || e));
    }
  };

  const handleBack = () => {
    dispatch(setCurrentStep(5));
  };

  const handleEdit = (step: number) => {
    dispatch(setCurrentStep(step));
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const InfoSection: React.FC<{ 
    title: string; 
    step: number; 
    children: React.ReactNode 
  }> = ({ title, step, children }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEdit(step)}
        >
          <Edit3 size={16} color="#00B9AE" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
    </View>
  );

  const DocumentRow: React.FC<{ label: string; hasDocument: boolean }> = ({ label, hasDocument }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <View style={styles.documentStatus}>
        <Check size={16} color={hasDocument ? '#10B981' : '#6B7280'} />
        <Text style={[styles.infoValue, { color: hasDocument ? '#10B981' : '#6B7280' }]}>
          {hasDocument ? 'Uploaded' : 'Not uploaded'}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#00B9AE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Submit</Text>
      </View>

      <View style={styles.content}>
        <InfoSection title="Basic Information" step={1}>
          <InfoRow label="Full Name" value={basicInfo.fullName} />
          <InfoRow label="Mobile" value={basicInfo.mobile} />
          <InfoRow label="Email" value={basicInfo.email} />
          <InfoRow label="Registering As" value={basicInfo.registeringAs} />
          {basicInfo.teamStrength && (
            <InfoRow label="Team Strength" value={basicInfo.teamStrength} />
          )}
          <InfoRow 
            label="Email Verified" 
            value={basicInfo.isEmailVerified ? 'Yes' : 'No'} 
          />
        </InfoSection>

        <InfoSection title="Personal Information" step={2}>
          <InfoRow label="Date of Birth" value={personalInfo.dateOfBirth} />
          <InfoRow label="Current Profession" value={personalInfo.currentProfession} />
          <InfoRow label="Emergency Contact" value={personalInfo.emergencyContactNumber} />
          <InfoRow label="Experience in Selling Loans" value={personalInfo.experienceInSellingLoans} />
          <InfoRow label="Focus Product" value={personalInfo.focusProduct} />
          <InfoRow label="Role Selection" value={personalInfo.roleSelection} />
        </InfoSection>

        <InfoSection title="Address Details" step={3}>
          <InfoRow label="Address Line 1" value={addressDetails.addressLine1} />
          {addressDetails.addressLine2 && (
            <InfoRow label="Address Line 2" value={addressDetails.addressLine2} />
          )}
          <InfoRow label="City" value={addressDetails.city} />
          <InfoRow label="Pincode" value={addressDetails.pincode} />
          <InfoRow label="Address Type" value={addressDetails.addressType} />
          {addressDetails.landmark && (
            <InfoRow label="Landmark" value={addressDetails.landmark} />
          )}
        </InfoSection>

        <InfoSection title="Bank Details" step={4}>
          <InfoRow label="Account Holder Name" value={bankDetails.accountHolderName} />
          <InfoRow label="Account Number" value={bankDetails.accountNumber} />
          <InfoRow label="Bank Name" value={bankDetails.bankName} />
          <InfoRow label="Branch Name" value={bankDetails.branchName} />
          <InfoRow label="IFSC Code" value={bankDetails.ifscCode} />
          <InfoRow label="Account Type" value={bankDetails.accountType} />
          <InfoRow 
            label="GST Billing Applicable" 
            value={bankDetails.isGstBillingApplicable ? 'Yes' : 'No'} 
          />
        </InfoSection>

        <InfoSection title="Documents" step={5}>
          <DocumentRow label="Profile Photo" hasDocument={!!documents.profilePhoto} />
          <DocumentRow label="PAN Card" hasDocument={!!documents.panCard} />
          <DocumentRow label="Aadhar Front" hasDocument={!!documents.aadharFront} />
          <DocumentRow label="Aadhar Back" hasDocument={!!documents.aadharBack} />
          <DocumentRow label="GST Certificate" hasDocument={!!documents.gstCertificate} />
          <DocumentRow label="Cancelled Cheque" hasDocument={!!documents.cancelledCheque} />
          <DocumentRow label="Additional Document" hasDocument={!!documents.additional} />
        </InfoSection>

        <View style={styles.buttonContainer}>
          <LoadingButton
            title="Back"
            onPress={handleBack}
            mode="outlined"
            style={styles.backButtonStyle}
          />
          <LoadingButton
            title="Submit Registration"
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.submitButton}
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
  section: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    color: '#00B9AE',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  documentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  backButtonStyle: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default PreviewStep;
