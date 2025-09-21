import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../redux/store';
import { verifyOTP, sendOTP, clearError } from '../redux/slices/authSlice';
import { otpSchema } from '../utils/validation';
import CustomTextInput from '../components/CustomTextInput';
import LoadingButton from '../components/LoadingButton';
import { Snackbar } from 'react-native-paper';

interface OTPFormData {
  otp: string;
}

const OTPVerificationScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { email } = route.params;
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OTPFormData>({
    resolver: yupResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: OTPFormData) => {
    try {
      const result = await dispatch(verifyOTP({ email, otp: data.otp }) as any);
      
      if (verifyOTP.fulfilled.match(result)) {
        // OTP verified, navigate to next step or login
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
    }
  };

  const handleResendOTP = () => {
    dispatch(sendOTP({ email }) as any);
    setTimer(60);
    setCanResend(false);
    reset();
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#00B9AE', '#00A39A', '#008D85']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>🔐</Text>
              </View>
              
              <Text style={styles.title}>Verify OTP</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to{'\n'}
                <Text style={styles.emailText}>{email}</Text>
              </Text>
            </View>

            {/* OTP Form Card */}
            <View style={styles.formCard}>
              <CustomTextInput
                name="otp"
                control={control}
                label="OTP"
                placeholder="Enter 6-digit OTP"
                keyboardType="numeric"
                maxLength={6}
                error={errors.otp}
                style={styles.input}
              />

              <LoadingButton
                title="Verify OTP"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.verifyButton}
              />

              {/* Resend OTP */}
              <View style={styles.resendContainer}>
                {canResend ? (
                  <TouchableOpacity onPress={handleResendOTP}>
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.timerText}>
                    Resend OTP in {timer}s
                  </Text>
                )}
              </View>

              {/* Back to Register */}
              <View style={styles.backContainer}>
                <Text style={styles.backText}>
                  Wrong email?{' '}
                  <Text 
                    style={styles.backLink}
                    onPress={() => navigation.goBack()}
                  >
                    Go Back
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  input: {
    marginBottom: 16,
  },
  verifyButton: {
    marginBottom: 24,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    color: '#00B9AE',
    fontSize: 16,
    fontWeight: '500',
  },
  timerText: {
    color: '#6B7280',
    fontSize: 16,
  },
  backContainer: {
    alignItems: 'center',
  },
  backText: {
    color: '#6B7280',
    fontSize: 16,
  },
  backLink: {
    color: '#00B9AE',
    fontWeight: '600',
  },
});

export default OTPVerificationScreen;