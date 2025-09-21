import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { updateDocuments, setCurrentStep, clearError } from '../../redux/slices/registrationSlice';
import DocumentUpload from '../../components/DocumentUpload';
import LoadingButton from '../../components/LoadingButton';
import { Snackbar } from 'react-native-paper';
import { ChevronLeft } from 'lucide-react-native';

const DocumentsStep: React.FC = () => {
  const dispatch = useDispatch();
  const { documents, isLoading, error } = useSelector(
    (state: RootState) => state.registration
  );

  const handleFileSelect = (documentType: string, file: any) => {
    dispatch(updateDocuments({ [documentType]: file }));
  };

  const handleFileRemove = (documentType: string) => {
    dispatch(updateDocuments({ [documentType]: null }));
  };

  const handleContinue = () => {
    // Validate required documents
    const requiredDocs = ['profilePhoto', 'panCard', 'aadharFront', 'aadharBack'];
    const missingDocs = requiredDocs.filter(doc => !documents[doc as keyof typeof documents]);
    
    if (missingDocs.length > 0) {
      // You could show an error here
      return;
    }
    
    dispatch(setCurrentStep(6));
  };

  const handleBack = () => {
    dispatch(setCurrentStep(4));
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
        <Text style={styles.headerTitle}>Upload Documents</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Required Documents</Text>
        
        <DocumentUpload
          label="Profile Photo"
          value={documents.profilePhoto}
          onFileSelect={(file) => handleFileSelect('profilePhoto', file)}
          onFileRemove={() => handleFileRemove('profilePhoto')}
          required
        />

        <DocumentUpload
          label="PAN Card"
          value={documents.panCard}
          onFileSelect={(file) => handleFileSelect('panCard', file)}
          onFileRemove={() => handleFileRemove('panCard')}
          required
        />

        <DocumentUpload
          label="Aadhar Front"
          value={documents.aadharFront}
          onFileSelect={(file) => handleFileSelect('aadharFront', file)}
          onFileRemove={() => handleFileRemove('aadharFront')}
          required
        />

        <DocumentUpload
          label="Aadhar Back"
          value={documents.aadharBack}
          onFileSelect={(file) => handleFileSelect('aadharBack', file)}
          onFileRemove={() => handleFileRemove('aadharBack')}
          required
        />

        <Text style={styles.sectionTitle}>Optional Documents</Text>

        <DocumentUpload
          label="GST Certificate"
          value={documents.gstCertificate}
          onFileSelect={(file) => handleFileSelect('gstCertificate', file)}
          onFileRemove={() => handleFileRemove('gstCertificate')}
        />

        <DocumentUpload
          label="Cancelled Cheque"
          value={documents.cancelledCheque}
          onFileSelect={(file) => handleFileSelect('cancelledCheque', file)}
          onFileRemove={() => handleFileRemove('cancelledCheque')}
        />

        <DocumentUpload
          label="Additional Document"
          value={documents.additional}
          onFileSelect={(file) => handleFileSelect('additional', file)}
          onFileRemove={() => handleFileRemove('additional')}
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
            onPress={handleContinue}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  backButtonStyle: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
});

export default DocumentsStep;