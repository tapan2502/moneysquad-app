import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import type { Lead } from '../../redux/slices/leadsSlice';

type Props = { lead: Lead; onPress: (lead: Lead) => void };

const formatDate = (s?: string) => {
  if (!s) return '-';
  const d = new Date(s);
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const formatCurrency = (n?: number) => {
  const v = typeof n === 'number' ? n : 0;
  if (v >= 1e7) return `₹${(v/1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `₹${(v/1e5).toFixed(1)}L`;
  if (v >= 1e3) return `₹${(v/1e3).toFixed(1)}K`;
  return `₹${v.toLocaleString()}`;
};
const getStatusColor = (status?: string) => {
  switch ((status ?? '').toLowerCase()) {
    case 'new lead': return '#6BC6D4';
    case 'pending': return '#FFD85A';
    case 'login': return '#8B9EFF';
    case 'approved': return '#6FD58A';
    case 'rejected': return '#F0808B';
    case 'disbursed': return '#12AA9E';
    case 'closed': return '#A9B1B7';
    case 'expired': return '#F0808B';
    default: return '#A9B1B7';
  }
};

const LeadCard: React.FC<Props> = ({ lead, onPress }) => {
  const city = lead?.pincode?.city ?? '-';
  const state = lead?.pincode?.state ?? '-';
  const location = `${city}, ${state}`;
  const loanType = (lead?.loan?.type ?? '').replace(/_/g, ' ');
  const amount = lead?.loan?.amount;
  const status = lead?.status ?? 'Unknown';
  const lender = lead?.lenderType || 'Not Assigned';
  const manager = lead?.manager ? `${lead.manager.firstName} ${lead.manager.lastName}` : 'Not Assigned';

  // micro animation: soft scale + tiny lift
  const scale = useRef(new Animated.Value(1)).current;
  const onIn = () => Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  const statusTint = useMemo(() => {
    const c = getStatusColor(status);
    return { dot: c, bg: `${c}1A`, text: c }; // subtle ~10% tint
  }, [status]);

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
      <Pressable
        onPress={() => onPress(lead)}
        onPressIn={onIn}
        onPressOut={onOut}
        android_ripple={{ color: '#EEF2FF' }}
        style={styles.card}
      >
        {/* Soft premium background */}
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Accent edge */}
        <View style={[styles.accent, { backgroundColor: statusTint.dot }]} />

        {/* Top row: left (title/id/type), right (STATUS) */}
        <View style={styles.topRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.title} numberOfLines={1}>{lead?.applicantName ?? '-'}</Text>
            <View style={styles.idRow}>
              <Text style={styles.id}>#{lead?.leadId ?? '-'}</Text>
              {!!loanType && <Text style={styles.dot}>•</Text>}
              {!!loanType && <Text style={styles.type} numberOfLines={1}>{loanType}</Text>}
            </View>
          </View>

          <View style={styles.rightTop}>
            <View style={[styles.statusCap, { backgroundColor: statusTint.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusTint.dot }]} />
              <Text style={[styles.statusText, { color: statusTint.text }]}>{(status || 'UNKNOWN').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Meta line 1: lender • manager */}
        <View style={styles.metaLine}>
          <Feather name="briefcase" size={12} color="#6B7280" />
          <Text style={[styles.meta, styles.metaShrink]} numberOfLines={1}>{lender}</Text>
          <Text style={styles.bullet}>•</Text>
          <Feather name="user" size={12} color="#6B7280" />
          <Text style={[styles.meta, styles.metaShrink]} numberOfLines={1}>{manager}</Text>
        </View>

        {/* Meta line 2: location (dedicated, up to 2 lines) */}
        <View style={styles.locationLine}>
          <Feather name="map-pin" size={12} color="#6B7280" />
          <Text style={styles.locationText} numberOfLines={2}>{location}</Text>
        </View>

        {/* Footer: left = updated, right = amount (your requested “opposite” positions) */}
        <View style={styles.footerRow}>
          <View style={styles.footerLeft}>
            <Feather name="calendar" size={12} color="#98A2B3" />
            <Text style={styles.footerText}>Updated {formatDate(lead?.statusUpdatedAt)}</Text>
          </View>
          <Text style={styles.amount}>{formatCurrency(amount)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9EEF9',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 10,
    elevation: 2,
    paddingVertical: 12,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },

  // Top
  topRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  title: { fontSize: 17, fontWeight: '800', color: '#0F172A', letterSpacing: -0.2 },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  id: { fontSize: 12, fontWeight: '800', color: '#4F46E5' },
  dot: { fontSize: 12, color: '#94A3B8' },
  type: { fontSize: 11, fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 },
  rightTop: { alignItems: 'flex-end' },
  statusCap: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },

  // Meta
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  meta: { fontSize: 13, color: '#334155', fontWeight: '600' },
  metaShrink: { flexShrink: 1 },

  locationLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 },
  locationText: { flex: 1, fontSize: 13, lineHeight: 18, color: '#334155', fontWeight: '600' },

  // Footer (opposite alignment)
  footerRow: {
    marginTop: 10, paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EDF2F7',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  amount: { fontSize: 16, fontWeight: '900', color: '#0FAA9E' }, // fintech green, bottom-right
});

export default LeadCard;
