import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SnapshotData } from '../../../redux/slices/dashboardSlice';
import SnapshotCard from './SnapshotCard';
import SnapshotSkeleton from './SnapshotSkeleton';
import * as Icons from 'lucide-react-native';

interface SnapshotSectionProps {
  snapshot: SnapshotData | null;
  isLoading: boolean;
}

const SnapshotSection: React.FC<SnapshotSectionProps> = ({ snapshot, isLoading }) => {
  if (isLoading || !snapshot) {
    return <SnapshotSkeleton />;
  }

  // Safe defaults
  const commissionEarned = snapshot.commissionEarned || {
    current_month_amount: 0,
    previous_month_amount: 0,
    delta_percentage: 0,
  };

  const totalDisbursal = snapshot.totalDisbursal || {
    current_month_amount: 0,
    previous_month_amount: 0,
    delta_percentage: 0,
  };

  const activeLeads = snapshot.activeLeads || {
    totalActiveLeads: 0,
    uniqueCount: 0,
  };

  const leadAdded = snapshot.leadAdded || {
    leads_added: 0,
    unique_lead: 0,
  };

  const approvalStatus = snapshot.approvalStatus || {
    current_month_amount: 0,
    previous_month_amount: 0,
    delta_percentage: 0,
  };

  // Helpers
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getTrendColor = (percentage: number) => {
    return percentage >= 0 ? '#10B981' : '#EF4444';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Performance Overview</Text>

      <View style={styles.cardsGrid}>
        {/* Commission */}
        <View style={styles.card}>
          <SnapshotCard
            title="Commission Earned"
            value={formatCurrency(commissionEarned.current_month_amount)}
            subtitle={`Previous: ${formatCurrency(commissionEarned.previous_month_amount)}`}
            trend={{
              value: formatPercentage(commissionEarned.delta_percentage),
              color: getTrendColor(commissionEarned.delta_percentage),
            }}
            icon={Icons.DollarSign}
            iconColor="#10B981"
            iconBackground="#ECFDF5"
            cardType="commission"
          />
        </View>

        {/* Disbursal */}
        <View style={styles.card}>
          <SnapshotCard
            title="Total Disbursal"
            value={formatCurrency(totalDisbursal.current_month_amount)}
            subtitle={`Previous: ${formatCurrency(totalDisbursal.previous_month_amount)}`}
            trend={{
              value: formatPercentage(totalDisbursal.delta_percentage),
              color: getTrendColor(totalDisbursal.delta_percentage),
            }}
            icon={Icons.Target || Icons.Crosshair || Icons.Bullseye}
            iconColor="#4F46E5"
            iconBackground="#EEF2FF"
            cardType="disbursal"
          />
        </View>

        {/* Leads */}
        <View style={styles.card}>
          <SnapshotCard
            title="Leads Added"
            value={leadAdded.leads_added.toString()}
            subtitle={`${leadAdded.unique_lead} unique • ${activeLeads.totalActiveLeads} active (${activeLeads.uniqueCount} unique)`}
            icon={Icons.Users}
            iconColor="#F59E0B"
            iconBackground="#FFFBEB"
            cardType="leads"
          />
        </View>

        {/* Approvals */}
        <View style={styles.card}>
          <SnapshotCard
            title="Approval Amount"
            value={formatCurrency(approvalStatus.current_month_amount)}
            subtitle={`Previous: ${formatCurrency(approvalStatus.previous_month_amount)}`}
            trend={{
              value: formatPercentage(approvalStatus.delta_percentage),
              color: getTrendColor(approvalStatus.delta_percentage),
            }}
            icon={Icons.TrendingUp}
            iconColor="#8B5CF6"
            iconBackground="#F3E8FF"
            cardType="approval"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%', // 2-column layout
    marginBottom: 16, // consistent row spacing
  },
});

export default SnapshotSection;
