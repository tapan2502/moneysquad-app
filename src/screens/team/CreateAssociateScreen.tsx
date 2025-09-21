import React from 'react';
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
import { 
  createAssociate, 
  updateAssociate, 
  clearAssociateState,
  AssociateFormData 
} from '../../redux/slices/associateSlice';
import CustomTextInput from '../../components/CustomTextInput';
import LoadingButton from '../../components/LoadingButton';
import { Snackbar } from 'react-native-paper';
import { ArrowLeft, Plus, CreditCard as Edit3, Users } from 'lucide-react-native';

// Validation Schema
const associateSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address'),
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number'),
  location: yup
    .string()
    .required('Location is required')
    .min(2, 'Location must be at least 2 characters'),
});

const CreateAssociateScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { associateId } = route.params || {};
  const isEditMode = !!associateId;

  const { associates, loading, error, success } = useSelector(
    (state: RootState) => state.associate
  );

  const selectedAssociate = associates.find(a => a._id === associateId);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AssociateFormData>({
    resolver: yupResolver(associateSchema),
    defaultValues: {
      firstName: selectedAssociate?.firstName || '',
      lastName: selectedAssociate?.lastName || '',
      email: selectedAssociate?.email || '',
      mobile: selectedAssociate?.mobile || '',
      location: selectedAssociate?.location || '',
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const onSubmit = async (data: AssociateFormData) => {
    try {
      let result;
      if (isEditMode) {
        result = await dispatch(updateAssociate({ id: associateId, data }) as any);
      } else {
        result = await dispatch(createAssociate(data) as any);
      }

      if (createAssociate.fulfilled.match(result) || updateAssociate.fulfilled.match(result)) {
        Alert.alert(
          'Success!',
          `Associate ${isEditMode ? 'updated' : 'created'} successfully.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Team'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Associate submission failed:', error);
    }
  };

  const handleDismissMessage = () => {
    dispatch(clearAssociateState());
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
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
              {isEditMode ? 'Edit Associate' : 'Add Team Member'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEditMode ? 'Update associate information' : 'Add a new team member to your organization'}
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
            {/* Personal Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.row}>
                <CustomTextInput
                  name="firstName"
                  control={control}
                  label="First Name"
                  placeholder="Enter first name"
                  autoCapitalize="words"
                  error={errors.firstName}
                  style={[styles.input, styles.halfWidth]}
                />

                <CustomTextInput
                  name="lastName"
                  control={control}
                  label="Last Name"
                  placeholder="Enter last name"
                  autoCapitalize="words"
                  error={errors.lastName}
                  style={[styles.input, styles.halfWidth]}
                />
              </View>

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

              <CustomTextInput
                name="location"
                control={control}
                label="Location"
                placeholder="Enter location"
                autoCapitalize="words"
                error={errors.location}
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
                title={isEditMode ? 'Update Associate' : 'Add Associate'}
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
        onDismiss={handleDismissMessage}
        action={{
          label: 'Dismiss',
          onPress: handleDismissMessage,
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

export default CreateAssociateScreen;