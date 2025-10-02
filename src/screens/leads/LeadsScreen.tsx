// src/screens/leads/LeadsScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../redux/store';
import { fetchAllLeads, clearError, Lead } from '../../redux/slices/leadsSlice';
import { Search, Filter, MapPin, Calendar, Building2, Plus } from 'lucide-react-native';
import { Snackbar } from 'react-native-paper';

const LeadsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { leads, isLoading, error } = useSelector((state: RootState) => state.leads);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchAllLeads() as any);
  }, [dispatch]);

  // Safer filtering (guards all possibly-null fields)
  const filteredLeads = useMemo<Lead[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) => {
      const name = (l?.applicantName ?? '').toLowerCase();
      const id = (l?.leadId ?? '').toLowerCase();
      const mobile = l?.mobile ?? '';
      const email = (l?.email ?? '').toLowerCase();
      return (
        name.includes(q) ||
        id.includes(q) ||
        mobile.includes(q) ||
        email.includes(q)
      );
    });
  }, [leads, searchQuery]);

  const handleRefresh = () => {
    dispatch(fetchAllLeads() as any);
  };

  const handleLeadPress = (lead: Lead) => {
    const id = (lead as any)?.id ?? (lead as any)?._id ?? lead.leadId;
    navigation.navigate('LeadDetails', { leadId: id });
  };

  const handleCreateLead = () => {
    navigation.navigate('CreateLead');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount?: number) => {
    const n = typeof amount === 'number' ? amount : 0;
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n.toLocaleString()}`;
  };

  const getStatusColor = (status?: string) => {
    switch ((status ?? '').toLowerCase()) {
      case 'new lead': return '#3B82F6';
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

  const getStatusBackground = (status?: string) => `${getStatusColor(status)}15`; // 8-digit hex with alpha

  const renderLeadItem = ({ item }: { item: Lead }) => {
    const city = item?.pincode?.city ?? '-';
    const state = item?.pincode?.state ?? '-';
    const loanType = (item?.loan?.type ?? '').replace(/_/g, ' ');
    const loanAmt = item?.loan?.amount;
    const status = item?.status ?? 'Unknown';

    return (
      <TouchableOpacity style={styles.leadCard} onPress={() => handleLeadPress(item)} activeOpacity={0.7}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.leadInfo}>
            <Text style={styles.leadId}>#{item?.leadId ?? '-'}</Text>
            <Text style={styles.applicantName} numberOfLines={1}>
              {item?.applicantName ?? '-'}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getStatusBackground(status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
              {(status || 'UNKNOWN').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Location</Text>
            <View style={styles.detailValueRow}>
              <MapPin size={12} color="#6B7280" strokeWidth={2} />
              <Text style={styles.detailValue} numberOfLines={1}>{city}, {state}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Manager</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item?.manager ? `${item.manager.firstName} ${item.manager.lastName}` : 'Not Assigned'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Lender</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item?.lenderType || 'Not Assigned'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Loan</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {loanType || '-'} {loanType ? ' - ' : ''}{formatCurrency(loanAmt)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Calendar size={12} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.footerText}>Updated: {formatDate(item?.statusUpdatedAt)}</Text>
          </View>

          {!!item?.businessName && (
            <View style={styles.footerItem}>
              <Building2 size={12} color="#9CA3AF" strokeWidth={2} />
              <Text style={styles.footerText} numberOfLines={1}>{item.businessName}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Leads</Text>
          <Text style={styles.headerSubtitle}>
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreateLead} activeOpacity={0.8}>
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#6B7280" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search leads by name, ID, mobile, or email"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.filterButton}>
          <Filter size={18} color="#4F46E5" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Leads List */}
      <FlatList
        data={filteredLeads}
        renderItem={renderLeadItem}
        keyExtractor={(item) => (item?.id ?? (item as any)?._id ?? item.leadId)}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No leads found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Leads will appear here once created'}
            </Text>
          </View>
        }
      />

      {/* Error Snackbar */}
      <Snackbar
        visible={!!error}
        onDismiss={handleDismissError}
        action={{ label: 'Dismiss', onPress: handleDismissError }}
      >
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  createButton: {
    width: 44, height: 44, backgroundColor: '#4F46E5', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  searchContainer: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#0F172A', fontWeight: '500' },
  filterButton: {
    width: 44, height: 44, backgroundColor: '#EEF2FF', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E0E7FF',
  },
  listContainer: { padding: 16, paddingBottom: 100 },
  leadCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  leadInfo: { flex: 1, marginRight: 12 },
  leadId: { fontSize: 12, color: '#4F46E5', fontWeight: '700', marginBottom: 4, letterSpacing: 0.5 },
  applicantName: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 12 },
  detailItem: { width: '48%', marginBottom: 8 },
  detailLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailValue: { fontSize: 13, color: '#0F172A', fontWeight: '600', flex: 1 },
  footer: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, gap: 8 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, color: '#64748B', fontWeight: '500', flex: 1 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 32 },
});

export default LeadsScreen;
