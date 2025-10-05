// src/screens/leads/LeadDetailsScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Pencil as Edit3,
} from 'lucide-react-native';

import { RootState } from '../../redux/store';
import {
  fetchLeadById, fetchLeadTimeline, fetchLeadRemarks,
  createLeadRemark, clearError
} from '../../redux/slices/leadsSlice';
import LeadRemarksTab from './LeadRemarksTab';
import LeadTimelineTab from './LeadTimelineTab';
import LeadDetailsTab from './LeadDetailsTab';



const safeLower = (v: unknown) => (typeof v === 'string' ? v : '').toLowerCase();

const LeadDetailsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
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

  useEffect(() => {
    if (leadId) dispatch(fetchLeadById(leadId) as any);
  }, [dispatch, leadId]);

  useEffect(() => {
    if (selectedLead?.leadId) {
      dispatch(fetchLeadTimeline(selectedLead.leadId) as any);
      dispatch(fetchLeadRemarks(selectedLead.leadId) as any);
    }
  }, [dispatch, selectedLead?.leadId]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const canEdit = useMemo(() => safeLower(selectedLead?.status) === 'new lead' || safeLower(selectedLead?.status) === 'new_lead', [selectedLead?.status]);

  const handleBack = () => navigation.goBack();

  const handleSendRemark = () => {
    if (!remarkMessage.trim() || !selectedLead?.leadId) return;
    dispatch(createLeadRemark({ leadId: selectedLead.leadId, message: remarkMessage.trim() }) as any);
    setRemarkMessage('');
  };

  if (isLoading || !selectedLead) {
    return (
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.loadingRoot}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <Text style={styles.loadingText}>Loading lead details…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {/* Sticky, premium header with fade-in background */}
      <Animated.View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }, {
        backgroundColor: headerOpacity.interpolate({
          inputRange: [0, 1],
          outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,1)'],
        }),
        borderBottomColor: headerOpacity.interpolate({
          inputRange: [0, 1],
          outputRange: ['rgba(241,245,249,0)', 'rgba(241,245,249,1)'],
        }) as any
      }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.8}>
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>

        <Animated.Text style={[styles.headerTitle, { opacity: headerOpacity }]} numberOfLines={1}>
          {selectedLead.applicantName || 'Lead'}
        </Animated.Text>

        {canEdit ? (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('CreateLead', { leadId: selectedLead.id })}
            activeOpacity={0.85}
          >
            <Edit3 size={18} color="#4F46E5" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 34, height: 34 }} /> // spacer to balance header layout
        )}
      </Animated.View>

      {/* Top gradient strip for premium feel (subtle) */}
      <LinearGradient
        colors={['#EEF2FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topGradient}
      />

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['details','timeline','remarks'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
            onPress={() => setActiveTab(t)}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t[0].toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content router */}
      <View style={{ flex: 1 }}>
        {activeTab === 'details' && (
          <LeadDetailsTab
            lead={selectedLead}
            scrollY={scrollY}
          />
        )}
        {activeTab === 'timeline' && (
          <LeadTimelineTab
            leadTimeline={leadTimeline}
            isTimelineLoading={isTimelineLoading}
          />
        )}
        {activeTab === 'remarks' && (
          <LeadRemarksTab
            leadId={selectedLead.leadId}
            remarksData={leadRemarks}
            isRemarksLoading={isRemarksLoading}
            remarkMessage={remarkMessage}
            setRemarkMessage={setRemarkMessage}
            onSendRemark={handleSendRemark}
          />
        )}
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => dispatch(clearError())}
        action={{ label: 'Dismiss', onPress: () => dispatch(clearError()) }}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Sticky header
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '900', color: '#0F172A' },
  editBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },

  // Gradient strip under header (premium tone)
  topGradient: { height: 10, width: '100%' },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  tabBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 2, borderBottomColor: 'transparent'
  },
  tabBtnActive: { borderBottomColor: '#4F46E5' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#64748B', letterSpacing: 0.2 },
  tabTextActive: { color: '#4F46E5' },

  // Loading
  loadingRoot: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { fontSize: 14, color: '#64748B', fontWeight: '700' },

  snackbar: { backgroundColor: '#0F172A' },
});

export default LeadDetailsScreen;
