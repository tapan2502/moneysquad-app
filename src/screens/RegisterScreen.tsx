import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../redux/store';

// Step Components
import BasicInfoStep from './registration/BasicInfoStep.tsx';
import PersonalInfoStep from './registration/PersonalInfoStep.tsx';
import AddressDetailsStep from './registration/AddressDetailsStep.tsx';
import BankDetailsStep from './registration/BankDetailsStep.tsx';
import DocumentsStep from './registration/DocumentsStep.tsx';
import PreviewStep from './registration/PreviewStep.tsx';

// Progress Indicator Component
const ProgressIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(currentStep / totalSteps) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
};

const RegisterScreen: React.FC = () => {
  const { currentStep } = useSelector((state: RootState) => state.registration);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep />;
      case 2:
        return <PersonalInfoStep />;
      case 3:
        return <AddressDetailsStep />;
      case 4:
        return <BankDetailsStep />;
      case 5:
        return <DocumentsStep />;
      case 6:
        return <PreviewStep />;
      default:
        return <BasicInfoStep />;
    }
  };

  return (
    <LinearGradient
      colors={['#00B9AE', '#00A39A', '#008D85']}
      style={styles.container}
    >
      <View style={styles.header}>
        {/* Compact header: only "Sign Up" */}
        <Text style={styles.title}>Sign Up</Text>

        <ProgressIndicator currentStep={currentStep} totalSteps={6} />
      </View>

      <View style={styles.contentContainer}>
        {renderCurrentStep()}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,       // reduced from 60
    paddingBottom: 12,    // reduced from 20
    paddingHorizontal: 24 // reduced from 32
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,         // reduced from 28
    fontWeight: 'bold',
    marginBottom: 10,     // slight spacing before progress
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 6,      // slightly tighter
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,         // slightly smaller
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
  },
});

export default RegisterScreen;
