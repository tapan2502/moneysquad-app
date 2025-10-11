import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, StatusBar, Modal, Linking } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Info, X } from 'lucide-react-native';
import { Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../../redux/store';
import { fetchAllLeads, clearError, Lead } from '../../redux/slices/leadsSlice';

import LeadFilterModal, { FilterState } from '../leads/LeadFilterModal';
import LeadCard from './LeadCard';

const LeadsScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { leads, isLoading, error } = useSelector((state: RootState) => state.leads);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    loanType: [],
    lender: [],
    manager: [],
    associate: [],
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    dispatch(fetchAllLeads() as any);
  }, [dispatch]);

  // Unique filter options from leads
  const filterOptions = useMemo(() => {
    const statuses = new Set<string>();
    const loanTypes = new Set<string>();
    const lenders = new Set<string>();
    const managers = new Set<string>();
    const associates = new Set<string>();

    leads.forEach((lead) => {
      if (lead.status) statuses.add(lead.status);
      if (lead.loan?.type) loanTypes.add(lead.loan.type);
      if (lead.lenderType) lenders.add(lead.lenderType);
      if (lead.manager) managers.add(`${lead.manager.firstName} ${lead.manager.lastName}`);
      if (lead.associate) associates.add(`${lead.associate.firstName} ${lead.associate.lastName}`);
    });

    return {
      statuses: Array.from(statuses),
      loanTypes: Array.from(loanTypes),
      lenders: Array.from(lenders),
      managers: Array.from(managers),
      associates: Array.from(associates),
    };
  }, [leads]);

  // Filters + search
  const filteredLeads = useMemo<Lead[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    return leads.filter((lead) => {
      if (q) {
        const name = (lead?.applicantName ?? '').toLowerCase();
        const id = (lead?.leadId ?? '').toLowerCase();
        const mobile = lead?.mobile ?? '';
        const email = (lead?.email ?? '').toLowerCase();
        const matchesSearch = name.includes(q) || id.includes(q) || mobile.includes(q) || email.includes(q);
        if (!matchesSearch) return false;
      }
      if (filters.status.length > 0 && !filters.status.includes(lead.status || '')) return false;
      if (filters.loanType.length > 0 && !filters.loanType.includes(lead.loan?.type || '')) return false;
      if (filters.lender.length > 0 && !filters.lender.includes(lead.lenderType || '')) return false;

      if (filters.manager.length > 0) {
        const m = lead.manager ? `${lead.manager.firstName} ${lead.manager.lastName}` : '';
        if (!filters.manager.includes(m)) return false;
      }
      if (filters.associate.length > 0) {
        const a = lead.associate ? `${lead.associate.firstName} ${lead.associate.lastName}` : '';
        if (!filters.associate.includes(a)) return false;
      }
      if (filters.dateFrom || filters.dateTo) {
        const d = new Date(lead.statusUpdatedAt || lead.createdAt || '');
        if (filters.dateFrom && d < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && d > new Date(filters.dateTo)) return false;
      }
      return true;
    });
  }, [leads, searchQuery, filters]);

  const activeFilterCount = useMemo(
    () =>
      filters.status.length +
      filters.loanType.length +
      filters.lender.length +
      filters.manager.length +
      filters.associate.length +
      (filters.dateFrom ? 1 : 0) +
      (filters.dateTo ? 1 : 0),
    [filters]
  );

  const handleRefresh = () => dispatch(fetchAllLeads() as any);

  const handleLeadPress = (lead: Lead) => {
    const id = (lead as any)?.id ?? (lead as any)?._id ?? lead.leadId;
    navigation.navigate('LeadDetails', { leadId: id });
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

  const toggleFilter = (category: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const current = prev[category] as string[];
      return current.includes(value)
        ? { ...prev, [category]: current.filter((v) => v !== value) }
        : { ...prev, [category]: [...current, value] };
    });
  };

  const handleDateFromChange = (date: string) => {
    setFilters((prev) => ({ ...prev, dateFrom: date }));
  };

  const handleDateToChange = (date: string) => {
    setFilters((prev) => ({ ...prev, dateTo: date }));
  };

  const clearFilters = () =>
    setFilters({
      status: [],
      loanType: [],
      lender: [],
      manager: [],
      associate: [],
      dateFrom: '',
      dateTo: '',
    });

  const handleDismissError = () => dispatch(clearError());

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Paint under status bar; content padded via insets */}
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Premium header with gradient */}
      <LinearGradient
        colors={['#EEF2FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Leads</Text>
          <Text style={styles.headerSubtitle}>
            {filteredLeads.length} of {leads.length} lead{leads.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowInfoModal(true)}
            activeOpacity={0.7}
          >
            <Info size={20} color="#4F46E5" strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateLead')} activeOpacity={0.85}>
            <Feather name="plus" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Sleek curved toolbar: Search + Filter */}
      <View style={styles.toolbar}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, ID, mobile, email"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>

        <TouchableOpacity
          style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.9}
        >
          <Feather name="filter" size={18} color={activeFilterCount > 0 ? '#FFFFFF' : '#4F46E5'} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active filter summary (compact) */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersBar}>
          <Text numberOfLines={1} style={styles.activeFiltersText}>
            {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={clearFilters} style={styles.clearInline}>
            <Text style={styles.clearInlineText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => (item?.id ?? (item as any)?._id ?? item.leadId)}
        renderItem={({ item }) => <LeadCard lead={item} onPress={handleLeadPress} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(24, insets.bottom + 16) }]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} colors={['#4F46E5']} tintColor="#4F46E5" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Feather name="search" size={48} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>No leads found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || activeFilterCount > 0
                ? 'Try adjusting your search or filters'
                : 'Leads will appear here once created'}
            </Text>
          </View>
        }
      />

      <LeadFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={() => setShowFilterModal(false)}
        onClear={clearFilters}
        filters={filters}
        toggleFilter={toggleFilter}
        options={filterOptions}
        getStatusColor={(s) => getStatusColor(s)}
        setDateFrom={handleDateFromChange}
        setDateTo={handleDateToChange}
      />

      <Snackbar
        visible={!!error}
        onDismiss={handleDismissError}
        action={{ label: 'Dismiss', onPress: handleDismissError }}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>

      <Modal
        visible={showInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContainer}>
            <View style={styles.infoModalHeader}>
              <View style={styles.infoIconContainer}>
                <Info size={24} color="#4F46E5" strokeWidth={2.5} />
              </View>
              <TouchableOpacity
                onPress={() => setShowInfoModal(false)}
                style={styles.closeButton}
              >
                <X size={20} color="#64748B" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <Text style={styles.infoModalTitle}>Leads Display Period</Text>
            <Text style={styles.infoModalMessage}>
              Leads added in last 60 days. For older leads or to download the leads data go to Archived Leads section on the web app.
            </Text>

            <TouchableOpacity
              style={styles.webLinkButton}
              onPress={() => {
                setShowInfoModal(false);
                Linking.openURL('https://app.moneysquad.in/');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.webLinkText}>https://app.moneysquad.in/</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.infoModalButton}
              onPress={() => setShowInfoModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.infoModalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FB' },

  // Header — compact, padded by insets, subtle divider
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6EAF2',
  },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0F172A', letterSpacing: -0.4 },
  headerSubtitle: { fontSize: 13, color: '#6B7280', fontWeight: '700', marginTop: 4 },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  infoButton: {
    width: 48,
    height: 48,
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },

  createButton: {
    width: 48,
    height: 48,
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  // Sleek curved toolbar (search + filter)
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 18, // curved edges for the whole bar
    borderWidth: 1,
    borderColor: '#E6EAF2',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 999, // pill
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E6EAF2',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14.5,
    color: '#0F172A',
    fontWeight: '600',
  },

  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    position: 'relative',
  },
  filterButtonActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  filterBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },

  // Active filters summary
  activeFiltersBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EAF2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeFiltersText: { fontSize: 13, color: '#334155', fontWeight: '700' },
  clearInline: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  clearInlineText: { color: '#EF4444', fontSize: 12, fontWeight: '900' },

  // List / empty / snackbar
  listContent: { padding: 16 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32 },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#334155', marginBottom: 10, letterSpacing: -0.3 },
  emptySubtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22 },

  snackbar: { backgroundColor: '#0F172A' },

  // Info Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#EEF2FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E7FF',
  },
  closeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  infoModalMessage: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '500',
  },
  webLinkButton: {
    backgroundColor: '#F0FDFC',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  webLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B9AE',
    textAlign: 'center',
  },
  infoModalButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  infoModalButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default LeadsScreen;
