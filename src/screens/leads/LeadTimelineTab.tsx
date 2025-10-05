// src/screens/leads/tabs/LeadTimelineTab.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Clock, CheckCircle, AlertCircle, X as XIcon } from 'lucide-react-native';

const safeLower = (v: unknown) => (typeof v === 'string' ? v : '').toLowerCase();

const getStatusColor = (status?: string) => {
  switch (safeLower(status)) {
    case 'approved':   return '#10B981';
    case 'disbursed':  return '#059669';
    case 'rejected':
    case 'expired':    return '#EF4444';
    case 'pending':
    case 'login':      return '#8B5CF6';
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

const formatDate = (d?: string) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

type TimelineItem = {
  _id: string;
  status?: string;
  createdAt: string;
  message?: string;
  rejectReason?: string;
  rejectComment?: string;
  closeReason?: string;
};

type Props = {
  leadTimeline?: Record<string, TimelineItem> | null;
  isTimelineLoading: boolean;
};

const LeadTimelineTab: React.FC<Props> = ({ leadTimeline, isTimelineLoading }) => {
  if (isTimelineLoading) {
    return (
      <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading timeline…</Text></View>
    );
  }

  if (!leadTimeline || !Object.values(leadTimeline).length) {
    return (
      <View style={styles.emptyContainer}>
        <Clock size={44} color="#CBD5E1" strokeWidth={1.5} />
        <Text style={styles.emptyTitle}>No timeline data</Text>
        <Text style={styles.emptySub}>Updates will appear here</Text>
      </View>
    );
  }

  const items = Object.values(leadTimeline)
    .filter((e): e is TimelineItem => !!e && !!e.status)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.timelineList} showsVerticalScrollIndicator={false}>
      {items.map((event) => {
        const Icon = getStatusIcon(event.status);
        const color = getStatusColor(event.status);
        return (
          <View key={event._id} style={styles.timelineItem}>
            <View style={[styles.timelineIconWrap, { backgroundColor: color }]}>
              <Icon size={16} color="#fff" />
            </View>
            <View style={styles.timelineCard}>
              <View style={styles.timelineHeader}>
                <Text style={[styles.timelineStatus, { color }]}>{(event.status || '—').replace('_', ' ')}</Text>
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
      <View style={{ height: 16 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { fontSize: 14, color: '#64748B', fontWeight: '700' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#374151' },
  emptySub: { fontSize: 13, color: '#6B7280' },
});

export default LeadTimelineTab;
