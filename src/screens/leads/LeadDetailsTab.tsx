// src/screens/leads/tabs/LeadDetailsTab.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)     return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString()}`;
};

type Props = {
  lead: Lead;
  scrollY: Animated.Value;
};

const LeadDetailsTab: React.FC<Props> = ({ lead, scrollY }) => {
  const statusColor = useMemo(() => getStatusColor(lead.status), [lead.status]);
  const gradientColors = useMemo(() => ['#EEF2FF', '#FFFFFF'], []);
  const statusTint = useMemo(() => ({ dot: statusColor, bg: `${statusColor}1A`, text: statusColor }), [statusColor]);

  const monogram = (lead?.applicantName || '?').trim().charAt(0).toUpperCase();
  const city = lead?.pincode?.city || '—';
  const state = lead?.pincode?.state || '—';
  const location = `${city}, ${state}`;
  const type = (lead?.loan?.type || '—').replace(/_/g, ' ');

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      scrollEventThrottle={16}
    >
      {/* Premium hero band */}
      <LinearGradient colors={gradientColors} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroLeft}>
            <View style={[styles.avatar, { borderColor: statusColor }]}>
              <Text style={styles.avatarTxt}>{monogram}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{lead.applicantName || '—'}</Text>
              <Text style={styles.secText} numberOfLines={1}>{lead.email || '—'}</Text>
            </View>
          </View>

          <View style={styles.heroRight}>
            {/* STATUS */}
            <View style={[styles.statusCap, { backgroundColor: statusTint.bg }]}>
              <View style={[styles.dot, { backgroundColor: statusTint.dot }]} />
              <Text style={[styles.statusTxt, { color: statusTint.text }]} numberOfLines={1}>
                {(lead.status || 'UNKNOWN').toUpperCase()}
              </Text>
            </View>
            {/* ID */}
            <View style={styles.idCap}>
              <Text style={styles.idKey}>ID</Text>
              <Text style={styles.idVal} numberOfLines={1}>{lead.leadId || '—'}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Metric chips (dense, modern) */}
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <DollarSign size={16} color="#0EA5E9" />
          <Text style={styles.metricVal} numberOfLines={1}>{formatCurrency(lead?.loan?.amount)}</Text>
          <Text style={styles.metricLbl}>Amount</Text>
        </View>
        <View style={styles.metric}>
          <CreditCard size={16} color="#6366F1" />
          <Text style={styles.metricVal} numberOfLines={1}>{type}</Text>
          <Text style={styles.metricLbl}>Type</Text>
        </View>
        <View style={styles.metric}>
          <MapPin size={16} color="#F59E0B" />
          <Text style={styles.metricVal} numberOfLines={1}>{city}</Text>
          <Text style={styles.metricLbl}>City</Text>
        </View>
      </View>

      {/* Info grid (sleek key–value list) */}
      <Card title="Contact">
        <KV icon={<Phone size={16} color="#64748B" />} label="Phone" value={lead.mobile || '—'} />
        <Divider />
        <KV icon={<Mail size={16} color="#64748B" />} label="Email" value={lead.email || '—'} />
        <Divider />
        <KV
          icon={<MapPin size={16} color="#64748B" />}
          label="Address"
          value={`${location}${lead.pincode?.pincode ? ` • ${lead.pincode.pincode}` : ''}`}
          multiline
        />
        {!!lead.businessName && (
          <>
            <Divider />
            <KV icon={<Building2 size={16} color="#64748B" />} label="Business" value={lead.businessName} />
          </>
        )}
      </Card>

      {/* Assignment compact cards */}
      <Card title="Assignment" innerPad={8}>
        <View style={styles.assignRow}>
          <SmallCard
            icon={<Users size={14} color="#0EA5E9" />}
            title="Partner"
            name={lead.partnerId?.basicInfo?.fullName || '—'}
            id={lead.partnerId?.partnerId}
          />
          <SmallCard
            icon={<Target size={14} color="#F59E0B" />}
            title="Manager"
            name={lead.manager ? `${lead.manager.firstName} ${lead.manager.lastName}` : 'Not Assigned'}
            id={lead.manager?.managerId}
          />
        </View>
      </Card>

      {/* Manager Details */}
      {lead.manager && (
        <Card title="Manager Details">
          <KV icon={<User size={16} color="#64748B" />} label="Name" value={`${lead.manager.firstName} ${lead.manager.lastName}`} />
          <Divider />
          <KV icon={<PhoneCall size={16} color="#64748B" />} label="Mobile" value={lead.manager.mobile || '—'} />
          <Divider />
          <KV icon={<MailIcon size={16} color="#64748B" />} label="Email" value={lead.manager.email || '—'} />
          {lead.manager.managerId && (
            <>
              <Divider />
              <KV icon={<Briefcase size={16} color="#64748B" />} label="Manager ID" value={lead.manager.managerId} />
            </>
          )}
        </Card>
      )}

      {/* Disbursement Details */}
      <Card title="Disbursement Details">
        {lead.disbursedData ? (
          <>
            <KV
              icon={<DollarSign size={16} color="#64748B" />}
              label="Loan Amount"
              value={formatCurrency(lead.disbursedData.loanAmount)}
            />
            <Divider />
            <KV
              icon={<CalendarClock size={16} color="#64748B" />}
              label="Tenure"
              value={`${lead.disbursedData.tenureMonths || 0} months`}
            />
            <Divider />
            <KV
              icon={<Percent size={16} color="#64748B" />}
              label="Interest Rate"
              value={`${lead.disbursedData.interestRatePA || 0}% p.a.`}
            />
            <Divider />
            <KV
              icon={<FileText size={16} color="#64748B" />}
              label="Processing Fee"
              value={`${lead.disbursedData.processingFee || 0}%`}
            />
            <Divider />
            <KV
              icon={<DollarSign size={16} color="#64748B" />}
              label="Insurance"
              value={formatCurrency(lead.disbursedData.insuranceCharges)}
            />
            <Divider />
            <KV
              icon={<Briefcase size={16} color="#64748B" />}
              label="Loan Scheme"
              value={lead.disbursedData.loanScheme || '—'}
            />
            <Divider />
            <KV
              icon={<FileText size={16} color="#64748B" />}
              label="LAN Number"
              value={lead.disbursedData.lanNumber || '—'}
            />
            <Divider />
            <KV
              icon={<Calendar size={16} color="#64748B" />}
              label="Disbursed Date"
              value={formatDate(lead.disbursedData.actualDisbursedDate, false)}
            />
          </>
        ) : (
          <View style={styles.notAvailable}>
            <Landmark size={32} color="#CBD5E1" strokeWidth={1.5} />
            <Text style={styles.notAvailableText}>Disbursement details not available</Text>
            <Text style={styles.notAvailableSub}>Details will appear once the loan is disbursed</Text>
          </View>
        )}
      </Card>

      {/* Timeline summary */}
      <Card title="Timeline">
        <View style={styles.tlRow}>
          <Chip icon={<Calendar size={14} color="#0EA5E9" />} text={formatDate(lead.createdAt)} />
          <Chip icon={<TrendingUp size={14} color="#8B5CF6" />} text={formatDate(lead.statusUpdatedAt)} />
        </View>
      </Card>

      {/* Comments (if any) */}
      {!!lead.comments && (
        <Card title="Comments">
          <View style={styles.note}>
            <Text style={styles.noteTxt}>{lead.comments}</Text>
          </View>
        </Card>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
};

/* ---------- Small internal building blocks ---------- */
const Card: React.FC<{ title: string; children: React.ReactNode; innerPad?: number }> = ({ title, children, innerPad = 16 }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={{ paddingHorizontal: innerPad, paddingBottom: innerPad }}>{children}</View>
  </View>
);

const KV: React.FC<{ icon: React.ReactNode; label: string; value: string; multiline?: boolean }> = ({ icon, label, value, multiline }) => (
  <View style={styles.kvRow}>
    <View style={styles.kvLeft}>
      {icon}
      <Text style={styles.kvLabel}>{label}</Text>
    </View>
    <Text
      style={[styles.kvValue, multiline && { lineHeight: 20 }]}
      numberOfLines={multiline ? 3 : 1}
    >
      {value}
    </Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

const SmallCard: React.FC<{ icon: React.ReactNode; title: string; name: string; id?: string }> = ({ icon, title, name, id }) => (
  <View style={styles.smallCard}>
    <View style={styles.smallHead}>
      {icon}
      <Text style={styles.smallTitle}>{title}</Text>
    </View>
    <Text style={styles.smallName} numberOfLines={1}>{name}</Text>
    {!!id && <Text style={styles.smallId}>ID: {id}</Text>}
  </View>
);

const Chip: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <View style={styles.chip}>
    {icon}
    <Text style={styles.chipTxt}>{text}</Text>
  </View>
);

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },

  // HERO
  hero: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6EAF2',
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2,
  },
  avatarTxt: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  name: { fontSize: 18, fontWeight: '900', color: '#0F172A', letterSpacing: -0.2 },
  secText: { fontSize: 12.5, fontWeight: '700', color: '#6B7280', marginTop: 2 },

  heroRight: { alignItems: 'flex-end', gap: 6, maxWidth: 170 },
  statusCap: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  idCap: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E6EAF2',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  idKey: { fontSize: 10, color: '#64748B', fontWeight: '900', letterSpacing: 0.4 },
  idVal: { fontSize: 12, color: '#0F172A', fontWeight: '800' },

  // METRICS
  metrics: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 12, marginBottom: 10 },
  metric: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E6EAF2',
    alignItems: 'center',
  },
  metricVal: { marginTop: 6, fontSize: 14, fontWeight: '900', color: '#0F172A' },
  metricLbl: { marginTop: 2, fontSize: 10.5, fontWeight: '800', color: '#64748B', letterSpacing: 0.2 },

  // CARD
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E6EAF2',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
    fontSize: 14.5, fontWeight: '900', color: '#0F172A', letterSpacing: -0.2,
  },

  // KEY–VALUE
  kvRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  kvLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 110 },
  kvLabel: { fontSize: 12, color: '#6B7280', fontWeight: '800' },
  kvValue: { flex: 1, fontSize: 14, fontWeight: '800', color: '#0F172A' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E6EAF2' },

  // ASSIGNMENT
  assignRow: { flexDirection: 'row', gap: 10, padding: 8, paddingTop: 0 },
  smallCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6EAF2',
  },
  smallHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  smallTitle: { fontSize: 11, fontWeight: '900', color: '#6B7280', letterSpacing: 0.4 },
  smallName: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
  smallId: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', marginTop: 2 },

  // TIMELINE SUMMARY
  tlRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', paddingHorizontal: 16, paddingBottom: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E6EAF2'
  },
  chipTxt: { fontSize: 12, fontWeight: '800', color: '#0F172A' },

  // COMMENTS
  note: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6EAF2',
  },
  noteTxt: { fontSize: 13.5, color: '#1F2937', fontWeight: '600', lineHeight: 20 },

  // NOT AVAILABLE
  notAvailable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 8,
  },
  notAvailableText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#64748B',
    textAlign: 'center',
  },
  notAvailableSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default LeadDetailsTab;
