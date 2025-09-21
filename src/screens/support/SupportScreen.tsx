import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { fetchSupportData, clearError } from '../../redux/slices/resourceAndSupportSlice';
import { CircleHelp as HelpCircle, Mail, Phone, MessageCircle, MapPin, Clock, User, CircleAlert as AlertCircle, ExternalLink } from 'lucide-react-native';
import { Snackbar } from 'react-native-paper';

const SupportScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { supportData, loading, error } = useSelector(
    (state: RootState) => state.resourceAndSupport
  );

  useEffect(() => {
    dispatch(fetchSupportData() as any);
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchSupportData() as any);
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const handleContactPress = (type: 'email' | 'phone' | 'whatsapp', contact: string) => {
    let url = '';
    switch (type) {
      case 'email':
        url = `mailto:${contact}`;
        break;
      case 'phone':
        url = `tel:${contact}`;
        break;
      case 'whatsapp':
        url = `whatsapp://send?phone=${contact.replace(/\s+/g, '')}`;
        break;
    }
    
    if (url) {
      Linking.openURL(url).catch(() => {
        console.log('Failed to open URL:', url);
      });
    }
  };

  if (loading && !supportData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading support information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <HelpCircle size={24} color="#4F46E5" strokeWidth={2} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Support</Text>
            <Text style={styles.headerSubtitle}>Get help when you need it</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
      >
        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          
          <View style={styles.contactGrid}>
            {/* Email Support */}
            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => handleContactPress('email', supportData?.email.contact || '')}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#EEF2FF' }]}>
                <Mail size={20} color="#4F46E5" strokeWidth={2} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactValue}>{supportData?.email.contact}</Text>
                <View style={styles.timingContainer}>
                  <Clock size={12} color="#64748B" strokeWidth={2} />
                  <Text style={styles.timingText}>{supportData?.email.timing}</Text>
                </View>
              </View>
              <ExternalLink size={16} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>

            {/* Phone Support */}
            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => handleContactPress('phone', supportData?.phone.contact || '')}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#ECFDF5' }]}>
                <Phone size={20} color="#10B981" strokeWidth={2} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Phone Support</Text>
                <Text style={styles.contactValue}>{supportData?.phone.contact}</Text>
                <View style={styles.timingContainer}>
                  <Clock size={12} color="#64748B" strokeWidth={2} />
                  <Text style={styles.timingText}>{supportData?.phone.timing}</Text>
                </View>
              </View>
              <ExternalLink size={16} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>

            {/* WhatsApp Support */}
            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => handleContactPress('whatsapp', supportData?.whatsapp.contact || '')}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#F0FDF4' }]}>
                <MessageCircle size={20} color="#22C55E" strokeWidth={2} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>WhatsApp</Text>
                <Text style={styles.contactValue}>{supportData?.whatsapp.contact}</Text>
                <View style={styles.timingContainer}>
                  <Clock size={12} color="#64748B" strokeWidth={2} />
                  <Text style={styles.timingText}>{supportData?.whatsapp.timing}</Text>
                </View>
              </View>
              <ExternalLink size={16} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>

            {/* Office Location */}
            <View style={styles.contactCard}>
              <View style={[styles.contactIcon, { backgroundColor: '#FEF3C7' }]}>
                <MapPin size={20} color="#F59E0B" strokeWidth={2} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Office Location</Text>
                <Text style={styles.contactValue}>{supportData?.office.contact}</Text>
                <View style={styles.timingContainer}>
                  <Clock size={12} color="#64748B" strokeWidth={2} />
                  <Text style={styles.timingText}>{supportData?.office.timing}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Lead Emails */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lead Email Addresses</Text>
          
          <View style={styles.emailGrid}>
            {Object.entries(supportData?.leadEmails || {}).map(([type, emailData]) => (
              <TouchableOpacity
                key={type}
                style={styles.emailCard}
                onPress={() => handleContactPress('email', emailData.to)}
              >
                <View style={styles.emailHeader}>
                  <Text style={styles.emailType}>{type.toUpperCase()}</Text>
                  <ExternalLink size={14} color="#9CA3AF" strokeWidth={2} />
                </View>
                <Text style={styles.emailTo}>To: {emailData.to}</Text>
                <Text style={styles.emailCc}>CC: {emailData.cc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Key Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Contacts</Text>
          
          <View style={styles.contactsGrid}>
            {/* Grievance Contact */}
            <View style={styles.keyContactCard}>
              <View style={styles.keyContactHeader}>
                <View style={[styles.contactIcon, { backgroundColor: '#FEF2F2' }]}>
                  <AlertCircle size={18} color="#EF4444" strokeWidth={2} />
                </View>
                <Text style={styles.keyContactTitle}>Grievance Officer</Text>
              </View>
              <View style={styles.keyContactInfo}>
                <View style={styles.keyContactRow}>
                  <User size={14} color="#64748B" strokeWidth={2} />
                  <Text style={styles.keyContactText}>{supportData?.grievance.name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.keyContactRow}
                  onPress={() => handleContactPress('phone', supportData?.grievance.phone || '')}
                >
                  <Phone size={14} color="#64748B" strokeWidth={2} />
                  <Text style={styles.keyContactText}>{supportData?.grievance.phone}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.keyContactRow}
                  onPress={() => handleContactPress('email', supportData?.grievance.email || '')}
                >
                  <Mail size={14} color="#64748B" strokeWidth={2} />
                  <Text style={styles.keyContactText}>{supportData?.grievance.email}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Payout Contact */}
            <View style={styles.keyContactCard}>
              <View style={styles.keyContactHeader}>
                <View style={[styles.contactIcon, { backgroundColor: '#ECFDF5' }]}>
                  <User size={18} color="#10B981" strokeWidth={2} />
                </View>
                <Text style={styles.keyContactTitle}>Payout Officer</Text>
              </View>
              <View style={styles.keyContactInfo}>
                <View style={styles.keyContactRow}>
                  <User size={14} color="#64748B" strokeWidth={2} />
                  <Text style={styles.keyContactText}>{supportData?.payout.name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.keyContactRow}
                  onPress={() => handleContactPress('phone', supportData?.payout.phone || '')}
                >
                  <Phone size={14} color="#64748B" strokeWidth={2} />
                  <Text style={styles.keyContactText}>{supportData?.payout.phone}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.keyContactRow}
                  onPress={() => handleContactPress('email', supportData?.payout.email || '')}
                >
                  <Mail size={14} color="#64748B" strokeWidth={2} />
                  <Text style={styles.keyContactText}>{supportData?.payout.email}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  contactGrid: {
    gap: 12,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
    marginBottom: 6,
  },
  timingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  emailGrid: {
    gap: 12,
  },
  emailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emailType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emailTo: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    marginBottom: 4,
  },
  emailCc: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  contactsGrid: {
    gap: 16,
  },
  keyContactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  keyContactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  keyContactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  keyContactInfo: {
    gap: 8,
  },
  keyContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyContactText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
});

export default SupportScreen;