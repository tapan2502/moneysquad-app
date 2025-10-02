// src/screens/leads/LeadDetailsScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Animated
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RootState } from '../../redux/store';
import {
  fetchLeadById, fetchLeadTimeline, fetchLeadRemarks,
  createLeadRemark, clearError
} from '../../redux/slices/leadsSlice';
import {
  ArrowLeft, MapPin, Phone, Mail, Building2, DollarSign, Calendar,
  MessageCircle, Send, Clock, CheckCircle, AlertCircle, X as XIcon,
  CreditCard, Users, Target, TrendingUp, Pencil as Edit3
} from 'lucide-react-native';
import { Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const safeLower = (v: unknown) => (typeof v === 'string' ? v : '').toLowerCase();

const getStatusColor = (status?: string) => {
  switch (safeLower(status)) {
    case 'new lead':
    case 'new_lead':   return '#3B82F6';
    case 'assigned':   return '#F59E0B';
    case 'pending':    return '#8B5CF6';
    case 'login':      return '#06B6D4';
    case 'approved':   return '#10B981';
    case 'disbursed':  return '#059669';
    case 'rejected':   return '#EF4444';
    case 'closed':     return '#6B7280';
    case 'expired':    return '#DC2626';
    default:           return '#6B7280';
  }
};

const getStatusIcon = (status?: string) => {
  switch (safeLower(status)) {
    case 'approved':
    case 'disbursed':  return CheckCircle;
    case 'rejected':
    case 'expired':    return XIcon;
    case 'pending':
    case 'login':      return AlertCircle;
    default:           return Clock;
  }
};

const getRoleColor = (role?: string) => {
  switch (safeLower(role)) {
    case 'partner':   return '#3B82F6';
    case 'manager':   return '#F59E0B';
    case 'admin':     return '#EF4444';
    case 'associate': return '#10B981';
    default:          return '#6B7280';
  }
};

const formatDate = (d?: string) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const formatCurrency = (amount?: number) => {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)     return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString()}`;
};

const LeadDetailsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { leadId } = route.params;

  const {
    selectedLead, leadTimeline, leadRemarks,
    isLoading, isTimelineLoading, isRemarksLoading, error
  } = useSelector((s: RootState) => s.leads);

  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'remarks'>('details');
  const [remarkMessage, setRemarkMessage] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch lead itself
  useEffect(() => {
    if (leadId) dispatch(fetchLeadById(leadId) as any);
  }, [dispatch, leadId]);

  // When we have the real DB leadId, fetch timeline & remarks
  useEffect(() => {
    if (selectedLead?.leadId) {
      dispatch(fetchLeadTimeline(selectedLead.leadId) as any);
      dispatch(fetchLeadRemarks(selectedLead.leadId) as any);
    }
  }, [dispatch, selectedLead?.leadId]);

  const handleBack = () => navigation.goBack();

  const handleSendRemark = () => {
    if (!remarkMessage.trim() || !selectedLead?.leadId) return;
    dispatch(createLeadRemark({
      leadId: selectedLead.leadId,
      message: remarkMessage.trim()
    }) as any);
    setRemarkMessage('');
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (isLoading || !selectedLead) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading lead details...</Text>
      </View>
    );
  }

  const statusColor = getStatusColor(selectedLead.status);
  const gradientColors = [statusColor, `${statusColor}CC`];

  const detailsTab = (
    <ScrollView
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      {/* Hero */}
      <LinearGradient colors={gradientColors} style={styles.heroSection}>
        <View style={styles.heroContent}>
          <View style={styles.leadIdContainer}>
            <Text style={styles.leadIdLabel}>LEAD ID</Text>
            <Text style={styles.leadIdValue}>{selectedLead.leadId || '—'}</Text>
          </View>

          <View style={styles.applicantInfo}>
            <Text style={styles.applicantName} numberOfLines={1}>
              {selectedLead.applicantName || '—'}
            </Text>
            <Text style={styles.applicantEmail} numberOfLines={1}>
              {selectedLead.email || '—'}
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {(selectedLead.status || 'unknown').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.quickRow}>
        <View style={styles.statCard}>
          <DollarSign size={18} color="#0EA5E9" strokeWidth={2} />
          <Text style={styles.statValue}>{formatCurrency(selectedLead.loan?.amount)}</Text>
          <Text style={styles.statLabel}>Loan Amount</Text>
        </View>

        <View style={styles.statCard}>
          <CreditCard size={18} color="#6366F1" strokeWidth={2} />
          <Text style={styles.statValue}>
            {(selectedLead.loan?.type || '—').replace(/_/g, ' ')}
          </Text>
          <Text style={styles.statLabel}>Loan Type</Text>
        </View>

        <View style={styles.statCard}>
          <MapPin size={18} color="#F59E0B" strokeWidth={2} />
          <Text style={styles.statValue}>
            {selectedLead.pincode?.city || '—'}
          </Text>
          <Text style={styles.statLabel}>Location</Text>
        </View>
      </View>

      {/* Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.list}>
          <View style={styles.listItem}>
            <Phone size={16} color="#64748B" />
            <Text style={styles.listValue}>{selectedLead.mobile || '—'}</Text>
          </View>
          <View style={styles.listItem}>
            <Mail size={16} color="#64748B" />
            <Text style={styles.listValue}>{selectedLead.email || '—'}</Text>
          </View>
          <View style={styles.listItem}>
            <MapPin size={16} color="#64748B" />
            <Text style={styles.listValue}>
              {(selectedLead.pincode?.city || '—')}, {(selectedLead.pincode?.state || '—')}
              {selectedLead.pincode?.pincode ? ` • ${selectedLead.pincode.pincode}` : ''}
            </Text>
          </View>
          {!!selectedLead.businessName && (
            <View style={styles.listItem}>
              <Building2 size={16} color="#64748B" />
              <Text style={styles.listValue}>{selectedLead.businessName}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Assignment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assignment</Text>
        <View style={styles.assignmentRow}>
          <View style={styles.assignmentCard}>
            <View style={styles.assignmentHeader}>
              <Users size={14} color="#0EA5E9" />
              <Text style={styles.assignmentTitle}>Partner</Text>
            </View>
            <Text style={styles.assignmentName} numberOfLines={1}>
              {selectedLead.partnerId?.basicInfo?.fullName || '—'}
            </Text>
            {selectedLead.partnerId?.partnerId && (
              <Text style={styles.assignmentId}>ID: {selectedLead.partnerId.partnerId}</Text>
            )}
          </View>

          <View style={styles.assignmentCard}>
            <View style={styles.assignmentHeader}>
              <Target size={14} color="#F59E0B" />
              <Text style={styles.assignmentTitle}>Manager</Text>
            </View>
            <Text style={styles.assignmentName} numberOfLines={1}>
              {selectedLead.manager
                ? `${selectedLead.manager.firstName} ${selectedLead.manager.lastName}`
                : 'Not Assigned'}
            </Text>
            {!!selectedLead.manager?.managerId && (
              <Text style={styles.assignmentId}>ID: {selectedLead.manager.managerId}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Timeline summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <View style={styles.timelineSummary}>
          <View style={styles.timelineChip}>
            <Calendar size={14} color="#0EA5E9" />
            <Text style={styles.timelineChipText}>{formatDate(selectedLead.createdAt)}</Text>
          </View>
          <View style={styles.timelineChip}>
            <TrendingUp size={14} color="#8B5CF6" />
            <Text style={styles.timelineChipText}>{formatDate(selectedLead.statusUpdatedAt)}</Text>
          </View>
        </View>
      </View>

      {/* Comments */}
      {!!selectedLead.comments && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comments</Text>
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>{selectedLead.comments}</Text>
          </View>
        </View>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );

  const timelineTab = (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {isTimelineLoading ? (
        <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading timeline...</Text></View>
      ) : leadTimeline ? (
        <View style={styles.timelineList}>
          {Object.values(leadTimeline)
            .filter((e): e is NonNullable<typeof e> => !!e && !!e.status)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((event) => {
              const Icon = getStatusIcon(event.status);
              return (
                <View key={event._id} style={styles.timelineItem}>
                  <View style={[styles.timelineIconWrap, { backgroundColor: getStatusColor(event.status) }]}>
                    <Icon size={16} color="#fff" />
                  </View>
                  <View style={styles.timelineCard}>
                    <View style={styles.timelineHeader}>
                      <Text style={[styles.timelineStatus, { color: getStatusColor(event.status) }]}>
                        {(event.status || '—').replace('_', ' ')}
                      </Text>
                      <Text style={styles.timelineDate}>{formatDate(event.createdAt)}</Text>
                    </View>
                    {!!event.message && <Text style={styles.timelineMsg}>{event.message}</Text>}
                    {!!event.rejectReason && (
                      <View style={styles.alertBlock}>
                        <Text style={styles.alertLabel}>Reject Reason</Text>
                        <Text style={styles.alertText}>{event.rejectReason}</Text>
                      </View>
                    )}
                    {!!event.rejectComment && (
                      <View style={styles.alertBlock}>
                        <Text style={styles.alertLabel}>Comment</Text>
                        <Text style={styles.alertText}>{event.rejectComment}</Text>
                      </View>
                    )}
                    {!!event.closeReason && (
                      <View style={styles.alertBlock}>
                        <Text style={styles.alertLabel}>Close Reason</Text>
                        <Text style={styles.alertText}>{event.closeReason}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Clock size={44} color="#CBD5E1" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No timeline data</Text>
          <Text style={styles.emptySub}>Updates will appear here</Text>
        </View>
      )}
    </ScrollView>
  );

  const remarksTab = (
    <KeyboardAvoidingView style={styles.remarksWrap} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.remarksScroll} showsVerticalScrollIndicator={false}>
        {isRemarksLoading ? (
          <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading remarks...</Text></View>
        ) : leadRemarks?.remarkMessage?.length ? (
          <View style={{ paddingBottom: 16 }}>
            {leadRemarks.remarkMessage.map((u) => (
              <View key={u._id} style={styles.userRemarks}>
                <View style={styles.userRow}>
                  <View style={[styles.avatar, { backgroundColor: getRoleColor(u.role) }]}>
                    <Text style={styles.avatarText}>{(u.name || '?').charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{u.name || '—'}</Text>
                    <View style={[styles.rolePill, { backgroundColor: `${getRoleColor(u.role)}14` }]}>
                      <Text style={[styles.rolePillText, { color: getRoleColor(u.role) }]}>
                        {(u.role || 'USER').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                {(u.messages || []).map((m, idx) => (
                  <View key={idx} style={styles.remarkCard}>
                    <Text style={styles.remarkText}>{m.text}</Text>
                    <Text style={styles.remarkTime}>{formatDate(m.timestamp)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MessageCircle size={44} color="#CBD5E1" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No remarks yet</Text>
            <Text style={styles.emptySub}>Be the first to add one</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.remarkInputBar}>
        <TextInput
          style={styles.remarkInput}
          placeholder="Add a remark..."
          value={remarkMessage}
          onChangeText={setRemarkMessage}
          multiline
          maxLength={500}
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity
          style={[styles.sendBtn, { opacity: remarkMessage.trim() ? 1 : 0.5 }]}
          onPress={handleSendRemark}
          disabled={!remarkMessage.trim() || isRemarksLoading}
        >
          <Send size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      {/* Compact sticky header */}
      <Animated.View style={[styles.header, {
        backgroundColor: headerOpacity.interpolate({
          inputRange: [0, 1],
          outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,1)'],
        })
      }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <Animated.Text style={[styles.headerTitle, { opacity: headerOpacity }]} numberOfLines={1}>
          {selectedLead.applicantName || 'Lead'}
        </Animated.Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('CreateLead', { leadId: selectedLead.id })}
        >
          <Edit3 size={18} color="#4F46E5" />
        </TouchableOpacity>
      </Animated.View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['details','timeline','remarks'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t[0].toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'details' && detailsTab}
        {activeTab === 'timeline' && timelineTab}
        {activeTab === 'remarks' && remarksTab}
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => dispatch(clearError())}
        action={{ label: 'Dismiss', onPress: () => dispatch(clearError()) }}
      >
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  // Layout
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingTop: 48, paddingHorizontal: 16, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9', zIndex: 10,
  },
  backBtn: { padding: 6, marginRight: 10 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: '#0F172A' },
  editBtn: { padding: 8, borderRadius: 10, backgroundColor: '#EEF2FF' },

  tabs: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
  },
  tabBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 2, borderBottomColor: 'transparent'
  },
  tabBtnActive: { borderBottomColor: '#4F46E5' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#4F46E5' },

  tabContent: { flex: 1 },

  // Hero
  heroSection: { paddingHorizontal: 18, paddingVertical: 24, marginBottom: 8 },
  heroContent: { alignItems: 'center' },
  leadIdContainer: { alignItems: 'center', marginBottom: 12 },
  leadIdLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '700', letterSpacing: 1 },
  leadIdValue: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  applicantInfo: { alignItems: 'center', marginBottom: 14 },
  applicantName: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 2 },
  applicantEmail: { fontSize: 13, color: 'rgba(255,255,255,0.92)', fontWeight: '600' },
  statusContainer: { alignItems: 'center' },
  statusBadge: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)'
  },
  statusText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  // Quick stats
  quickRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 18 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center'
  },
  statValue: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 6, marginBottom: 2, textAlign: 'center' },
  statLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600' },

  // Sections
  section: {
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 14,
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E5E7EB'
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },

  // Lists
  list: { gap: 8 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  listValue: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827' },

  // Assignment
  assignmentRow: { flexDirection: 'row', gap: 10 },
  assignmentCard: {
    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB'
  },
  assignmentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  assignmentTitle: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  assignmentName: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  assignmentId: { fontSize: 11, fontWeight: '600', color: '#9CA3AF' },

  // Timeline (summary)
  timelineSummary: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  timelineChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E5E7EB'
  },
  timelineChipText: { fontSize: 12, fontWeight: '700', color: '#0F172A' },

  // Notes
  noteCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  noteText: { fontSize: 14, color: '#1F2937', fontWeight: '600', lineHeight: 20 },

  // Timeline tab (list)
  timelineList: { padding: 16, gap: 12 },
  timelineItem: { flexDirection: 'row', gap: 12 },
  timelineIconWrap: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  timelineCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB'
  },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  timelineStatus: { fontSize: 14, fontWeight: '900', letterSpacing: -0.2 },
  timelineDate: { fontSize: 11, color: '#6B7280', fontWeight: '700' },
  timelineMsg: { fontSize: 13, color: '#374151', fontWeight: '600', lineHeight: 20 },
  alertBlock: { marginTop: 10, padding: 12, backgroundColor: '#FEF2F2', borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#EF4444' },
  alertLabel: { fontSize: 10, color: '#DC2626', fontWeight: '900', marginBottom: 4, letterSpacing: 0.4 },
  alertText: { fontSize: 13, color: '#7F1D1D', fontWeight: '600', lineHeight: 18 },

  // Remarks tab
  remarksWrap: { flex: 1 },
  remarksScroll: { flex: 1, padding: 16 },
  userRemarks: { marginBottom: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  userName: { fontSize: 14, fontWeight: '900', color: '#0F172A', marginBottom: 2 },
  rolePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  rolePillText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },

  remarkCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#E5E7EB'
  },
  remarkText: { fontSize: 13, color: '#374151', fontWeight: '600', lineHeight: 20, marginBottom: 6 },
  remarkTime: { fontSize: 11, color: '#6B7280', fontWeight: '700' },

  remarkInputBar: {
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F5F9',
    padding: 14, flexDirection: 'row', alignItems: 'flex-end', gap: 10
  },
  remarkInput: {
    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0F172A',
    fontWeight: '600', maxHeight: 100, borderWidth: 1, borderColor: '#E2E8F0'
  },
  sendBtn: {
    backgroundColor: '#4F46E5', borderRadius: 12, padding: 10,
    justifyContent: 'center', alignItems: 'center'
  },

  // Loading / Empty
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { fontSize: 14, color: '#64748B', fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#374151' },
  emptySub: { fontSize: 13, color: '#6B7280' },
});

export default LeadDetailsScreen;
