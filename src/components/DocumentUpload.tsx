import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, X, FileText } from 'lucide-react-native';

interface DocumentUploadProps {
  label: string;
  value?: any;
  onFileSelect: (file: any) => void;
  onFileRemove: () => void;
  required?: boolean;
  error?: string;
  acceptedFormats?: string[];
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  value,
  onFileSelect,
  onFileRemove,
  required = false,
  error,
  acceptedFormats = ['image/jpeg', 'image/png'],
}) => {
  const handleFileSelect = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = acceptedFormats.join(',');
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
          // Validate file type
          if (!acceptedFormats.includes(file.type)) {
            Alert.alert('Invalid File', 'Please select a valid image file (PNG or JPG)');
            return;
          }
          
          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            Alert.alert('File Too Large', 'Please select a file smaller than 5MB');
            return;
          }
          
          onFileSelect(file);
        }
      };
      input.click();
    } else {
      // For native platforms, show options for camera or gallery
      Alert.alert(
        'Select Image',
        'Choose an option',
        [
          { text: 'Camera', onPress: openCamera },
          { text: 'Gallery', onPress: openGallery },
          { text: 'Document', onPress: openDocumentPicker },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Validate file size (max 5MB)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 5MB');
          return;
        }
        
        onFileSelect({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize,
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Gallery permission is required to select photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Validate file size (max 5MB)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 5MB');
          return;
        }
        
        onFileSelect({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize,
        });
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const openDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Validate file size (max 5MB)
        if (asset.size && asset.size > 5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 5MB');
          return;
        }
        
        onFileSelect({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType,
          size: asset.size,
        });
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to open document picker');
    }
  };

  const getFileName = () => {
    if (!value) return '';
    if (Platform.OS === 'web' && value.name) {
      return value.name;
    }
    if (value.name) {
      return value.name;
    }
    return 'Selected file';
  };

  const getFilePreview = () => {
    if (!value) return null;
    
    if (Platform.OS === 'web' && value instanceof File) {
      const url = URL.createObjectURL(value);
      return (
        <Image
          source={{ uri: url }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      );
    }
    
    // For native platforms, show the image if it has a URI
    if (value.uri) {
      return (
        <Image
          source={{ uri: value.uri }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      );
    }
    
    return (
      <View style={styles.fileIcon}>
        <FileText size={24} color="#6B7280" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      {value ? (
        <View style={styles.fileContainer}>
          <View style={styles.filePreview}>
            {getFilePreview()}
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {getFileName()}
              </Text>
              <Text style={styles.fileSize}>
                {Platform.OS === 'web' && value.size 
                  ? `${(value.size / 1024).toFixed(1)} KB`
                  : value.size 
                    ? `${(value.size / 1024).toFixed(1)} KB`
                    : 'File selected'
                }
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onFileRemove}
          >
            <X size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadArea, error && styles.uploadAreaError]}
          onPress={handleFileSelect}
        >
          <Upload size={24} color="#6B7280" />
          <Text style={styles.uploadText}>Tap to upload</Text>
          <Text style={styles.uploadSubtext}>PNG, JPG (max 5MB)</Text>
        </TouchableOpacity>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  uploadArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadAreaError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  fileContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  fileIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  fileSize: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
});

export default DocumentUpload;