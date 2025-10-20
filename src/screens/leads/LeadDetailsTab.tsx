// src/screens/leads/tabs/LeadDetailsTab.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { openPhoneDialer, openEmailClient } from '@/src/utils/linking';
import {
  MapPin, Phone, Mail, Building2, DollarSign, Calendar,
  CreditCard, Users, Target, TrendingUp, Briefcase, Landmark,
  Percent, CalendarClock, FileText, User, PhoneCall, MailIcon
} from 'lucide-react-native';
import { Lead } from '@/src/redux/slices/leadsSlice';

const safeLower = (v: unknown) => (typeof v === 'string' ? v : '').toLowerCase();

const getStatusColor = (status?: string) => {
  switch (safeLower(status)) {
    case 'new lead':
    case 'new_lead': return '#3B82F6';
    case 'assigned': return '#F59E0B';
    case 'pending': return '#8B5CF6';
    case 'login': return '#06B6D4';
    case 'approved': return '#10B981';
    case 'disbursed': return '#059669';
    case 'rejected': return '#EF4444';
    case 'closed': return '#6B7280';
    case 'expired': return '#DC2626';
    default: return '#6B7280';
  }
};

const formatDate = (d?: string, withTime = true) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
  });
};

const formatCurrency = (amount?: number) => {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString()}`;
};

type Props = {
  lead: Lead;
  scrollY: Animated.Value;
};

const LeadDetailsTab: React.FC<Props> = ({ lead, scrollY }) => {
  const statusColor = useMemo(() => getStatusColor(lead.status), [lead.status]);
  const monogram = (lead?.applicantName || '?').trim().charAt(0).toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      scrollEventThrottle={16}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={[styles.avatar, { backgroundColor: statusColor }]}>
            <Text style={styles.avatarText}>{monogram}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{lead.applicantName || '—'}</Text>
            <Text style={styles.id}>ID: {lead.leadId || '—'}</Text>
          </View>
          <View style={[styles.status, { backgroundColor: `${statusColor}15` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {(lead.status || 'N/A').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => openPhoneDialer(lead.mobile)}
          >
            <Phone size={18} color="#FFFFFF" />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            onPress={() => openEmailClient(lead.email)}
          >
            <Mail size={18} color="#4F46E5" />
            <Text style={styles.actionTextSecondary}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact Details</Text>
        <Row icon={<Phone size={18} color="#64748B" />} label="Mobile" value={lead.mobile || '—'} />
        <Row icon={<Mail size={18} color="#64748B" />} label="Email" value={lead.email || '—'} />
        <Row
          icon={<MapPin size={18} color="#64748B" />}
          label="Address"
          value={`${lead?.pincode?.city || '—'}, ${lead?.pincode?.state || '—'}${lead.pincode?.pincode ? ` • ${lead.pincode.pincode}` : ''}`}
        />
        {lead.businessName && (
          <Row icon={<Building2 size={18} color="#64748B" />} label="Business" value={lead.businessName} />
        )}
      </View>

      {/* Manager Details */}
      {lead.manager && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Relationship Manager</Text>
          <View style={styles.managerHeader}>
            <View style={styles.managerInfo}>
              <Text style={styles.managerName}>
                {lead.manager.firstName} {lead.manager.lastName}
              </Text>
              {lead.manager.managerId && (
                <Text style={styles.managerId}>ID: {lead.manager.managerId}</Text>
              )}
            </View>
            <View style={styles.managerActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => openPhoneDialer(lead.manager?.mobile)}
              >
                <Phone size={20} color="#4F46E5" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => openEmailClient(lead.manager?.email)}
              >
                <Mail size={20} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Disbursement Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Disbursement Details</Text>
        {lead.disbursedData ? (
          <>
            <Row label="Amount" value={formatCurrency(lead.disbursedData.loanAmount)} icon={<DollarSign size={18} color="#64748B" />} />
            <Row label="Tenure" value={`${lead.disbursedData.tenureMonths || 0} months`} icon={<CalendarClock size={18} color="#64748B" />} />
            <Row label="Interest Rate" value={`${lead.disbursedData.interestRatePA || 0}% p.a.`} icon={<Percent size={18} color="#64748B" />} />
            <Row label="Processing Fee" value={`${lead.disbursedData.processingFee || 0}%`} icon={<FileText size={18} color="#64748B" />} />
            <Row label="Insurance" value={formatCurrency(lead.disbursedData.insuranceCharges)} icon={<DollarSign size={18} color="#64748B" />} />
            <Row label="Scheme" value={lead.disbursedData.loanScheme || '—'} icon={<Briefcase size={18} color="#64748B" />} />
            <Row label="LAN Number" value={lead.disbursedData.lanNumber || '—'} icon={<FileText size={18} color="#64748B" />} />
            <Row label="Disbursed Date" value={formatDate(lead.disbursedData.actualDisbursedDate, false)} icon={<Calendar size={18} color="#64748B" />} />
          </>
        ) : (
          <View style={styles.empty}>
            <Landmark size={32} color="#CBD5E1" />
            <Text style={styles.emptyText}>Not disbursed yet</Text>
          </View>
        )}
      </View>

      {/* Timeline */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Timeline</Text>
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <Calendar size={16} color="#0EA5E9" />
            <View>
              <Text style={styles.timelineLabel}>Created</Text>
              <Text style={styles.timelineValue}>{formatDate(lead.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.timelineItem}>
            <TrendingUp size={16} color="#8B5CF6" />
            <View>
              <Text style={styles.timelineLabel}>Updated</Text>
              <Text style={styles.timelineValue}>{formatDate(lead.statusUpdatedAt)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Comments */}
      {lead.comments && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comments</Text>
          <Text style={styles.comment}>{lead.comments}</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

/* -------------------- Reusable Components -------------------- */
const Row: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      {icon}
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#FFF', padding: 16, gap: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  headerInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  id: { fontSize: 13, color: '#64748B', marginTop: 2 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 12 },
  actionBtnSecondary: { backgroundColor: '#F1F5F9' },
  actionText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  actionTextSecondary: { fontSize: 15, fontWeight: '600', color: '#4F46E5' },
  card: { backgroundColor: '#FFF', marginTop: 12, padding: 16 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  rowValue: { fontSize: 14, fontWeight: '600', color: '#0F172A', textAlign: 'right' },
  managerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  managerInfo: { flex: 1 },
  managerName: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  managerId: { fontSize: 13, color: '#64748B', marginTop: 2 },
  managerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  timeline: { gap: 16 },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timelineLabel: { fontSize: 12, color: '#64748B' },
  timelineValue: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, color: '#94A3B8' },
  comment: { fontSize: 14, color: '#475569', lineHeight: 20 },
});

export default LeadDetailsTab;
