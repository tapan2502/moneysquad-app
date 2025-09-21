import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../redux/store';
import { 
  updateBasicInfo, 
  setCurrentStep, 
  clearError,
  sendPartnerOTP,
  verifyPartnerOTP
} from '../../redux/slices/registrationSlice';
import { basicInfoSchema } from '../../utils/validation';
import CustomTextInput from '../../components/CustomTextInput';
import CustomDropdown from '../../components/CustomDropdown';
import LoadingButton from '../../components/LoadingButton';
import { Snackbar } from 'react-native-paper';

interface BasicInfoFormData {
  fullName: string;
  mobile: string;
  email: string;
  registeringAs: string;
  teamStrength?: string;
}

const registeringAsOptions = [
  { label: 'Individual', value: 'Individual' },
  { label: 'Proprietorship', value: 'Proprietorship' },
  { label: 'Partnership', value: 'Partnership' },
  { label: 'LLP', value: 'LLP' },
  { label: 'Private Limited', value: 'Private Limited' },
  { label: 'Other', value: 'Other' },
];

const teamStrengthOptions = [
  { label: '<5', value: '<5' },
  { label: '5-15', value: '5-15' },
  { label: '15-30', value: '15-30' },
  { label: '30-50', value: '30-50' },
  { label: '50+', value: '50+' },
];

const BasicInfoStep: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { basicInfo, isLoading, error, otpSent, emailVerified } = useSelector(
    (state: RootState) => state.registration
  );

  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BasicInfoFormData>({
    resolver: yupResolver(basicInfoSchema),
    defaultValues: basicInfo,
  });

  const watchedRegisteringAs = watch('registeringAs');
  const watchedEmail = watch('email');

  const handleSendOTP = async () => {
    if (!watchedEmail) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    try {
      const result = await dispatch(sendPartnerOTP(watchedEmail) as any);
      if (sendPartnerOTP.fulfilled.match(result)) {
        setShowOTPInput(true);
        Alert.alert('Success', 'OTP sent to your email address');
      }
    } catch (error) {
      console.error('Send OTP failed:', error);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const result = await dispatch(verifyPartnerOTP({ email: watchedEmail, otp }) as any);
      if (verifyPartnerOTP.fulfilled.match(result)) {
        setShowOTPInput(false);
        setOtp('');
        Alert.alert('Success', 'Email verified successfully!');
      }
    } catch (error) {
      console.error('Verify OTP failed:', error);
    }
  };

  const onSubmit = (data: BasicInfoFormData) => {
    if (!emailVerified) {
      Alert.alert('Error', 'Please verify your email address before proceeding');
      return;
    }

    dispatch(updateBasicInfo(data));
    dispatch(setCurrentStep(2));
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const needsTeamStrength = ['Partnership', 'LLP', 'Private Limited'].includes(watchedRegisteringAs);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <CustomTextInput
          name="fullName"
          control={control}
          label="Full Name"
          placeholder="Enter your full name"
          autoCapitalize="words"
          error={errors.fullName}
          style={styles.input}
        />

        <CustomTextInput
          name="mobile"
          control={control}
          label="Mobile Number"
          placeholder="Enter your mobile number"
          keyboardType="phone-pad"
          maxLength={10}
          error={errors.mobile}
          style={styles.input}
        />

        <View style={styles.emailContainer}>
          <CustomTextInput
            name="email"
            control={control}
            label="Email Address"
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            style={styles.emailInput}
          />
          
          {!emailVerified && (
            <LoadingButton
              title={otpSent ? "Resend OTP" : "Verify Email"}
              onPress={handleSendOTP}
              loading={isLoading}
              mode="outlined"
              style={styles.verifyButton}
            />
          )}
          
          {emailVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
        </View>

        {showOTPInput && (
          <View style={styles.otpContainer}>
            <View style={styles.container}>
              <Text style={styles.label}>Enter OTP</Text>
              <TextInput
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter 6-digit OTP"
                keyboardType="numeric"
                maxLength={6}
                style={styles.otpInput}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <LoadingButton
              title="Verify OTP"
              onPress={handleVerifyOTP}
              loading={isLoading}
              style={styles.verifyOTPButton}
            />
          </View>
        )}

        <CustomDropdown
          label="Registering As"
          value={watchedRegisteringAs}
          options={registeringAsOptions}
          onSelect={(value) => setValue('registeringAs', value)}
          placeholder="Select registration type"
          error={errors.registeringAs?.message}
          required
        />

        {needsTeamStrength && (
          <CustomDropdown
            label="Team Strength"
            value={watch('teamStrength') || ''}
            options={teamStrengthOptions}
            onSelect={(value) => setValue('teamStrength', value)}
            placeholder="Select team size"
          />
        )}

        <LoadingButton
          title="Continue"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          style={styles.continueButton}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text 
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              Sign In
            </Text>
          </Text>
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
  content: {
    padding: 24,
  },
  input: {
    marginBottom: 16,
  },
  emailContainer: {
    marginBottom: 16,
  },
  emailInput: {
    marginBottom: 8,
  },
  verifyButton: {
    marginBottom: 8,
  },
  verifiedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  otpContainer: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  verifyOTPButton: {
    marginTop: 8,
  },
  otpInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  continueButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  loginContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  loginText: {
    color: '#374151',
    fontSize: 16,
  },
  loginLink: {
    color: '#00B9AE',
    fontWeight: '600',
  },
});

export default BasicInfoStep;