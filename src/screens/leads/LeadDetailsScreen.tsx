import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RootState } from '../../redux/store';
import { 
  fetchLeadById, 
  fetchLeadTimeline, 
  fetchLeadRemarks,
  createLeadRemark,
  clearError 
} from '../../redux/slices/leadsSlice';
import { ArrowLeft, MapPin, Phone, Mail, Building2, DollarSign, Calendar, User, MessageCircle, Send, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Circle as XCircle, CreditCard, Users, Target, TrendingUp, CreditCard as Edit3 } from 'lucide-react-native';
import { Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const LeadDetailsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { leadId } = route.params;
  
  const { 
    selectedLead, 
    leadTimeline, 
    leadRemarks,
    isLoading, 
    isTimelineLoading,
    isRemarksLoading,
    error 
  } = useSelector((state: RootState) => state.leads);

  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'remarks'>('details');
  const [remarkMessage, setRemarkMessage] = useState('');
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    if (leadId) {
      dispatch(fetchLeadById(leadId) as any);
      dispatch(fetchLeadTimeline(selectedLead?.leadId || leadId) as any);
      dispatch(fetchLeadRemarks(selectedLead?.leadId || leadId) as any);
    }
  }, [dispatch, leadId]);

  useEffect(() => {
    if (selectedLead?.leadId) {
      dispatch(fetchLeadTimeline(selectedLead.leadId) as any);
      dispatch(fetchLeadRemarks(selectedLead.leadId) as any);
    }
  }, [dispatch, selectedLead?.leadId]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSendRemark = () => {
    if (remarkMessage.trim() && selectedLead) {
      dispatch(createLeadRemark({ 
        leadId: selectedLead.leadId, 
        message: remarkMessage.trim() 
      }) as any);
      setRemarkMessage('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new lead':
      case 'new_lead':
        return '#3B82F6';
      case 'assigned':
        return '#F59E0B';
      case 'pending':
        return '#8B5CF6';
      case 'login':
        return '#06B6D4';
      case 'approved':
        return '#10B981';
      case 'disbursed':
        return '#059669';
      case 'rejected':
        return '#EF4444';
      case 'closed':
        return '#6B7280';
      case 'expired':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'disbursed':
        return CheckCircle;
      case 'rejected':
      case 'expired':
        return XCircle;
      case 'pending':
      case 'login':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'partner':
        return '#3B82F6';
      case 'manager':
        return '#F59E0B';
      case 'admin':
        return '#EF4444';
      case 'associate':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  if (isLoading || !selectedLead) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading lead details...</Text>
      </View>
    );
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const renderDetailsTab = () => (
    <ScrollView 
      style={styles.tabContent} 
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      {/* Hero Section */}
      <LinearGradient
        colors={[getStatusColor(selectedLead.status), `${getStatusColor(selectedLead.status)}80`]}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <View style={styles.leadIdContainer}>
            <Text style={styles.leadIdLabel}>LEAD ID</Text>
            <Text style={styles.leadIdValue}>{selectedLead.leadId}</Text>
          </View>
          
          <View style={styles.applicantInfo}>
            <Text style={styles.applicantName}>{selectedLead.applicantName}</Text>
            <Text style={styles.applicantEmail}>{selectedLead.email}</Text>
          </View>

          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Text style={styles.statusText}>{selectedLead.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <DollarSign size={20} color="#10B981" strokeWidth={2} />
          <Text style={styles.statValue}>{formatCurrency(selectedLead.loan.amount)}</Text>
          <Text style={styles.statLabel}>Loan Amount</Text>
        </View>
        
        <View style={styles.statCard}>
          <CreditCard size={20} color="#3B82F6" strokeWidth={2} />
          <Text style={styles.statValue}>{selectedLead.loan.type.replace(/_/g, ' ')}</Text>
          <Text style={styles.statLabel}>Loan Type</Text>
        </View>
        
        <View style={styles.statCard}>
          <MapPin size={20} color="#F59E0B" strokeWidth={2} />
          <Text style={styles.statValue}>{selectedLead.pincode.city}</Text>
          <Text style={styles.statLabel}>Location</Text>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.contactGrid}>
          <View style={styles.contactItem}>
            <Phone size={16} color="#6B7280" strokeWidth={2} />
            <Text style={styles.contactValue}>{selectedLead.mobile}</Text>
          </View>
          <View style={styles.contactItem}>
            <Mail size={16} color="#6B7280" strokeWidth={2} />
            <Text style={styles.contactValue}>{selectedLead.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <MapPin size={16} color="#6B7280" strokeWidth={2} />
            <Text style={styles.contactValue}>
              {selectedLead.pincode.city}, {selectedLead.pincode.state} - {selectedLead.pincode.pincode}
            </Text>
          </View>
          {selectedLead.businessName && (
            <View style={styles.contactItem}>
              <Building2 size={16} color="#6B7280" strokeWidth={2} />
              <Text style={styles.contactValue}>{selectedLead.businessName}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Assignment Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assignment Details</Text>
        <View style={styles.assignmentGrid}>
          <View style={styles.assignmentCard}>
            <View style={styles.assignmentHeader}>
              <Users size={16} color="#3B82F6" strokeWidth={2} />
              <Text style={styles.assignmentTitle}>Partner</Text>
            </View>
            <Text style={styles.assignmentName}>{selectedLead.partnerId.basicInfo.fullName}</Text>
            <Text style={styles.assignmentId}>ID: {selectedLead.partnerId.partnerId}</Text>
          </View>

          <View style={styles.assignmentCard}>
            <View style={styles.assignmentHeader}>
              <Target size={16} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.assignmentTitle}>Manager</Text>
            </View>
            <Text style={styles.assignmentName}>
              {selectedLead.manager 
                ? `${selectedLead.manager.firstName} ${selectedLead.manager.lastName}`
                : 'Not Assigned'
              }
            </Text>
            {selectedLead.manager && (
              <Text style={styles.assignmentId}>ID: {selectedLead.manager.managerId}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Timeline Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <View style={styles.timelineGrid}>
          <View style={styles.timelineItem}>
            <Calendar size={16} color="#10B981" strokeWidth={2} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Created</Text>
              <Text style={styles.timelineValue}>{formatDate(selectedLead.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.timelineItem}>
            <TrendingUp size={16} color="#8B5CF6" strokeWidth={2} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Last Updated</Text>
              <Text style={styles.timelineValue}>{formatDate(selectedLead.statusUpdatedAt)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Comments */}
      {selectedLead.comments && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comments</Text>
          <View style={styles.commentsContainer}>
            <Text style={styles.commentsText}>{selectedLead.comments}</Text>
          </View>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderTimelineTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {isTimelineLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading timeline...</Text>
        </View>
      ) : leadTimeline ? (
        <View style={styles.timelineContainer}>
          {Object.entries(leadTimeline)
            .filter(([_, event]) => event !== null)
            .sort((a, b) => new Date(b[1]!.createdAt).getTime() - new Date(a[1]!.createdAt).getTime())
            .map(([status, event], index) => {
              const StatusIcon = getStatusIcon(event!.status);
              const isLast = index === Object.keys(leadTimeline).filter(key => leadTimeline[key] !== null).length - 1;
              
              return (
                <View key={event!._id} style={styles.timelineEventItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineIconContainer,
                      { backgroundColor: getStatusColor(event!.status) }
                    ]}>
                      <StatusIcon size={16} color="#FFFFFF" strokeWidth={2} />
                    </View>
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>
                  
                  <View style={styles.timelineRight}>
                    <View style={styles.timelineCard}>
                      <View style={styles.timelineHeader}>
                        <Text style={[
                          styles.timelineStatus,
                          { color: getStatusColor(event!.status) }
                        ]}>
                          {event!.status.replace('_', ' ').charAt(0).toUpperCase() + event!.status.replace('_', ' ').slice(1)}
                        </Text>
                        <Text style={styles.timelineDate}>
                          {formatDate(event!.createdAt)}
                        </Text>
                      </View>
                      
                      <Text style={styles.timelineMessage}>{event!.message}</Text>
                      
                      {event!.rejectReason && (
                        <View style={styles.rejectInfo}>
                          <Text style={styles.rejectLabel}>Reject Reason:</Text>
                          <Text style={styles.rejectText}>{event!.rejectReason}</Text>
                        </View>
                      )}
                      
                      {event!.rejectComment && (
                        <View style={styles.rejectInfo}>
                          <Text style={styles.rejectLabel}>Comment:</Text>
                          <Text style={styles.rejectText}>{event!.rejectComment}</Text>
                        </View>
                      )}
                      
                      {event!.closeReason && (
                        <View style={styles.rejectInfo}>
                          <Text style={styles.rejectLabel}>Close Reason:</Text>
                          <Text style={styles.rejectText}>{event!.closeReason}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Clock size={48} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyText}>No timeline data available</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderRemarksTab = () => (
    <KeyboardAvoidingView 
      style={styles.remarksContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.remarksScroll} showsVerticalScrollIndicator={false}>
        {isRemarksLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading remarks...</Text>
          </View>
        ) : leadRemarks && leadRemarks.remarkMessage.length > 0 ? (
          <View style={styles.remarksContent}>
            {leadRemarks.remarkMessage.map((userRemarks) => (
              <View key={userRemarks._id} style={styles.userRemarksSection}>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <View style={[
                      styles.userAvatar,
                      { backgroundColor: getRoleColor(userRemarks.role) }
                    ]}>
                      <Text style={styles.userAvatarText}>
                        {userRemarks.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{userRemarks.name}</Text>
                      <View style={[
                        styles.roleBadge,
                        { backgroundColor: `${getRoleColor(userRemarks.role)}15` }
                      ]}>
                        <Text style={[
                          styles.roleText,
                          { color: getRoleColor(userRemarks.role) }
                        ]}>
                          {userRemarks.role.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                {userRemarks.messages.map((message, index) => (
                  <View key={index} style={styles.messageItem}>
                    <Text style={styles.messageText}>{message.text}</Text>
                    <Text style={styles.messageTime}>
                      {formatDate(message.timestamp)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MessageCircle size={48} color="#D1D5DB" strokeWidth={1.5} />
            <Text style={styles.emptyText}>No remarks yet</Text>
            <Text style={styles.emptySubtext}>Be the first to add a remark</Text>
          </View>
        )}
      </ScrollView>
      
      {/* Add Remark Input */}
      <View style={styles.remarkInput}>
        <TextInput
          style={styles.remarkTextInput}
          placeholder="Add a remark..."
          value={remarkMessage}
          onChangeText={setRemarkMessage}
          multiline
          maxLength={500}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { opacity: remarkMessage.trim() ? 1 : 0.5 }
          ]}
          onPress={handleSendRemark}
          disabled={!remarkMessage.trim() || isRemarksLoading}
        >
          <Send size={20} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { backgroundColor: headerOpacity.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)']
      }) }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#0F172A" strokeWidth={2} />
        </TouchableOpacity>
        <Animated.Text style={[styles.headerTitle, { opacity: headerOpacity }]}>
          {selectedLead.applicantName}
        </Animated.Text>
        <TouchableOpacity style={styles.editButton}>
          <Edit3 size={20} color="#4F46E5" strokeWidth={2} />
        </TouchableOpacity>
      </Animated.View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'details' && styles.activeTabButton]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'details' && styles.activeTabButtonText]}>
            Details
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'timeline' && styles.activeTabButton]}
          onPress={() => setActiveTab('timeline')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'timeline' && styles.activeTabButtonText]}>
            Timeline
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'remarks' && styles.activeTabButton]}
          onPress={() => setActiveTab('remarks')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'remarks' && styles.activeTabButtonText]}>
            Remarks
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContainer}>
        {activeTab === 'details' && renderDetailsTab()}
        {activeTab === 'timeline' && renderTimelineTab()}
        {activeTab === 'remarks' && renderRemarksTab()}
      </View>

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
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
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
    zIndex: 10,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  tabNavigation: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#4F46E5',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabButtonText: {
    color: '#4F46E5',
  },
  tabContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  
  // Hero Section Styles
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    marginBottom: 8,
  },
  heroContent: {
    alignItems: 'center',
  },
  leadIdContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  leadIdLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 1,
  },
  leadIdValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  applicantInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  applicantName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  applicantEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Quick Stats Styles
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Section Styles
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // Contact Grid Styles
  contactGrid: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  contactValue: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },

  // Assignment Grid Styles
  assignmentGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  assignmentCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  assignmentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  assignmentId: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Timeline Grid Styles
  timelineGrid: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  timelineValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },

  // Comments Styles
  commentsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentsText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 22,
  },
  
  // Timeline Tab Styles
  timelineContainer: {
    padding: 20,
  },
  timelineEventItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 32,
  },
  timelineIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 1,
  },
  timelineRight: {
    flex: 1,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  timelineDate: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  timelineMessage: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 22,
  },
  rejectInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  rejectLabel: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rejectText: {
    fontSize: 14,
    color: '#7F1D1D',
    fontWeight: '500',
    lineHeight: 20,
  },
  
  // Remarks Tab Styles
  remarksContainer: {
    flex: 1,
  },
  remarksScroll: {
    flex: 1,
    padding: 20,
  },
  remarksContent: {
    paddingBottom: 20,
  },
  userRemarksSection: {
    marginBottom: 24,
  },
  userHeader: {
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  messageItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  messageText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  remarkInput: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  remarkTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default LeadDetailsScreen;