// src/screens/leads/tabs/LeadTimelineTab.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import { Clock, CheckCircle, AlertCircle, X as XIcon, ImageIcon, ZoomIn } from 'lucide-react-native';

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
  rejectImage?: string | null;
};

type Props = {
  leadTimeline?: Record<string, TimelineItem> | null;
  isTimelineLoading: boolean;
};

const LeadTimelineTab: React.FC<Props> = ({ leadTimeline, isTimelineLoading }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
              {!!event.rejectImage && (
                <TouchableOpacity
                  style={styles.imagePreview}
                  onPress={() => setSelectedImage(event.rejectImage!)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: event.rejectImage }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay}>
                    <ZoomIn size={20} color="#fff" strokeWidth={2.5} />
                    <Text style={styles.imageOverlayText}>View Image</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
      <View style={{ height: 16 }} />

      {/* Full Screen Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseArea}
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reject Image</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedImage(null)}
              >
                <XIcon size={24} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          {selectedImage && (
            <View style={styles.modalImageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </Modal>
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

  imagePreview: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  thumbnailImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8FAFC',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  imageOverlayText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalCloseArea: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullImage: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height - 200,
  },
});

export default LeadTimelineTab;
