import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { 
  fetchCommissionData, 
  fetchDisbursedLeads, 
  fetchMonthlyBreakdown,
  clearError,
  DisbursedLead,
  MonthlyBreakdown
} from '../../redux/slices/commissionSlice';
import { fetchUserData, isPartnerUser } from '../../redux/slices/userDataSlice';
import { DollarSign, TrendingUp, Calendar, Building2, User, CreditCard, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import { Snackbar } from 'react-native-paper';

const CommissionScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    commissionData, 
    disbursedLeads, 
    monthlyBreakdown,
    isLoading, 
    isPayoutLoading,
    isBreakdownLoading,
    error 
  } = useSelector((state: RootState) => state.commission);
  
  const { userData } = useSelector((state: RootState) => state.userData);
  
  const [activeTab, setActiveTab] = useState<'rates' | 'payouts' | 'breakdown'>('rates');

  useEffect(() => {
    dispatch(fetchUserData() as any);
    dispatch(fetchCommissionData() as any);
    dispatch(fetchDisbursedLeads() as any);
    dispatch(fetchMonthlyBreakdown() as any);
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCommissionData() as any);
    dispatch(fetchDisbursedLeads() as any);
    dispatch(fetchMonthlyBreakdown() as any);
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'processing':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'processing':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  // Check if user has lead sharing role
  const isLeadSharingRole = userData && isPartnerUser(userData) && 
    userData.personalInfo.roleSelection === 'leadSharing';

  const renderLeadSharingView = () => (
    <View style={styles.leadSharingContainer}>
      <View style={styles.leadSharingCard}>
        <View style={styles.leadSharingIcon}>
          <DollarSign size={32} color="#4F46E5" strokeWidth={2} />
        </View>
        
        <Text style={styles.leadSharingTitle}>Lead Sharing Commission</Text>
        <Text style={styles.leadSharingRate}>1.5% Fixed Rate</Text>
        
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            • Commission rate is fixed at 1.5% for all lead sharing partners
          </Text>
          <Text style={styles.disclaimerText}>
            • Payouts are processed monthly after successful disbursements
          </Text>
          <Text style={styles.disclaimerText}>
            • TDS of 2% will be deducted from payouts
          </Text>
          <Text style={styles.disclaimerText}>
            • GST of 18% additional if applicable
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCommissionRatesTab = () => {
    if (isLeadSharingRole) {
      return renderLeadSharingView();
    }

    const userCommissionType = userData && isPartnerUser(userData) ? 
      userData.commissionPlan : 'gold';
    
    const userCommissionData = commissionData.find(
      data => data.commissionType === userCommissionType
    );

    if (!userCommissionData) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No commission data available</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.commissionHeader}>
          <View style={styles.planBadge}>
            <Text style={styles.planText}>{userCommissionType.toUpperCase()} PLAN</Text>
          </View>
        </View>

        {userCommissionData.sheets.map((sheet, index) => (
          <View key={sheet._id} style={styles.sheetContainer}>
            <Text style={styles.sheetTitle}>{sheet.sheetType}</Text>
            
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Lender</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Term Loan</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Overdraft</Text>
              </View>
              
              {sheet.entries
                .filter(entry => entry.termLoan > 0 || entry.overdraft > 0)
                .map((entry, entryIndex) => (
                <View key={entry._id} style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 2 }]}>
                    <Text style={styles.lenderName}>{entry.lenderName}</Text>
                    {entry.remark && (
                      <Text style={styles.remarkText}>{entry.remark}</Text>
                    )}
                  </View>
                  <View style={[styles.tableCell, { flex: 1 }]}>
                    <Text style={styles.commissionRate}>
                      {entry.termLoan > 0 ? `${entry.termLoan}%` : '-'}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 1 }]}>
                    <Text style={styles.commissionRate}>
                      {entry.overdraft > 0 ? `${entry.overdraft}%` : '-'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderPayoutsTab = () => {
    // Filter current month disbursed leads
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const currentMonthLeads = disbursedLeads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
    });

    const renderPayoutItem = ({ item }: { item: DisbursedLead }) => {
      const StatusIcon = getStatusIcon(item.payoutStatus);
      
      return (
        <View style={styles.payoutCard}>
          <View style={styles.payoutHeader}>
            <View style={styles.payoutInfo}>
              <Text style={styles.leadIdText}>#{item.leadId}</Text>
              <Text style={styles.applicantName}>{item.applicant.name}</Text>
              {item.applicant.business && (
                <Text style={styles.businessName}>{item.applicant.business}</Text>
              )}
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.payoutStatus)}15` }]}>
              <StatusIcon size={12} color={getStatusColor(item.payoutStatus)} strokeWidth={2} />
              <Text style={[styles.statusText, { color: getStatusColor(item.payoutStatus) }]}>
                {item.payoutStatus.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.payoutDetails}>
            <View style={styles.payoutRow}>
              <View style={styles.payoutItem}>
                <Building2 size={14} color="#6B7280" strokeWidth={2} />
                <Text style={styles.payoutLabel}>Lender</Text>
                <Text style={styles.payoutValue}>{item.lender.name}</Text>
              </View>
              
              <View style={styles.payoutItem}>
                <CreditCard size={14} color="#6B7280" strokeWidth={2} />
                <Text style={styles.payoutLabel}>Type</Text>
                <Text style={styles.payoutValue}>{item.lender.loanType.replace(/_/g, ' ')}</Text>
              </View>
            </View>

            <View style={styles.payoutRow}>
              <View style={styles.payoutItem}>
                <DollarSign size={14} color="#6B7280" strokeWidth={2} />
                <Text style={styles.payoutLabel}>Disbursed</Text>
                <Text style={styles.payoutValue}>{formatCurrency(item.disbursedAmount)}</Text>
              </View>
              
              <View style={styles.payoutItem}>
                <TrendingUp size={14} color="#6B7280" strokeWidth={2} />
                <Text style={styles.payoutLabel}>Commission</Text>
                <Text style={styles.payoutValue}>{item.commission}%</Text>
              </View>
            </View>

            <View style={styles.payoutSummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Gross Payout</Text>
                <Text style={styles.summaryValue}>{formatCurrency(item.grossPayout)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Net Payout</Text>
                <Text style={[styles.summaryValue, styles.netPayoutValue]}>
                  {formatCurrency(item.netPayout)}
                </Text>
              </View>
            </View>

            {item.remark && (
              <View style={styles.remarkContainer}>
                <Text style={styles.remarkLabel}>Remark:</Text>
                <Text style={styles.remarkText}>{item.remark}</Text>
              </View>
            )}
          </View>

          <View style={styles.payoutFooter}>
            <Text style={styles.dateText}>
              Disbursed: {formatDate(item.disbursedId.actualDisbursedDate)}
            </Text>
            {item.isTopupLoan && (
              <View style={styles.topupBadge}>
                <Text style={styles.topupText}>TOP-UP</Text>
              </View>
            )}
          </View>
        </View>
      );
    };

    return (
      <View style={styles.tabContent}>
        <View style={styles.payoutSummaryHeader}>
          <Text style={styles.tabTitle}>Current Month Payouts</Text>
          <Text style={styles.tabSubtitle}>
            {currentMonthLeads.length} disbursement{currentMonthLeads.length !== 1 ? 's' : ''} this month
          </Text>
        </View>

        <FlatList
          data={currentMonthLeads}
          renderItem={renderPayoutItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.payoutsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <DollarSign size={64} color="#D1D5DB" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No payouts this month</Text>
              <Text style={styles.emptySubtitle}>Payouts will appear here after disbursements</Text>
            </View>
          }
        />
      </View>
    );
  };

  const renderBreakdownTab = () => {
    const renderBreakdownItem = ({ item }: { item: MonthlyBreakdown }) => (
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownHeader}>
          <View style={styles.monthContainer}>
            <Calendar size={16} color="#4F46E5" strokeWidth={2} />
            <Text style={styles.monthText}>
              {new Date(item.month + '-01').toLocaleDateString('en-GB', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.paymentStatus) }]} />
            <Text style={[styles.statusLabel, { color: getStatusColor(item.paymentStatus) }]}>
              {item.paymentStatus}
            </Text>
          </View>
        </View>

        <View style={styles.breakdownMetrics}>
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Total Disbursals</Text>
              <Text style={styles.metricValue}>{formatCurrency(item.totalDisbursals)}</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Commission Earned</Text>
              <Text style={styles.metricValue}>{formatCurrency(item.commissionEarned)}</Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Payout Paid</Text>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>
                {formatCurrency(item.payoutPaid)}
              </Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Payout Pending</Text>
              <Text style={[styles.metricValue, { color: '#F59E0B' }]}>
                {formatCurrency(item.payoutPending)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.breakdownFooter}>
          <View style={styles.gstStatus}>
            <Text style={styles.gstLabel}>GST Status:</Text>
            <Text style={[styles.gstValue, { color: getStatusColor(item.gstStatus) }]}>
              {item.gstStatus}
            </Text>
          </View>
        </View>
      </View>
    );

    return (
      <View style={styles.tabContent}>
        <View style={styles.breakdownSummaryHeader}>
          <Text style={styles.tabTitle}>Monthly Breakdown</Text>
          <Text style={styles.tabSubtitle}>Commission and payout summary by month</Text>
        </View>

        <FlatList
          data={monthlyBreakdown}
          renderItem={renderBreakdownItem}
          keyExtractor={(item) => item.month}
          contentContainerStyle={styles.breakdownList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Calendar size={64} color="#D1D5DB" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No breakdown data</Text>
              <Text style={styles.emptySubtitle}>Monthly breakdown will appear here</Text>
            </View>
          }
        />
      </View>
    );
  };

  const isAnyLoading = isLoading || isPayoutLoading || isBreakdownLoading;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <DollarSign size={24} color="#4F46E5" strokeWidth={2} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Commission</Text>
            <Text style={styles.headerSubtitle}>
              {isLeadSharingRole ? 'Lead sharing rates' : 'Rates and payouts'}
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      {!isLeadSharingRole && (
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'rates' && styles.activeTabButton]}
            onPress={() => setActiveTab('rates')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'rates' && styles.activeTabButtonText]}>
              Rates
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'payouts' && styles.activeTabButton]}
            onPress={() => setActiveTab('payouts')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'payouts' && styles.activeTabButtonText]}>
              Payouts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'breakdown' && styles.activeTabButton]}
            onPress={() => setActiveTab('breakdown')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'breakdown' && styles.activeTabButtonText]}>
              Breakdown
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Content */}
      <View style={styles.tabContainer}>
        {isLeadSharingRole ? (
          renderLeadSharingView()
        ) : (
          <>
            {activeTab === 'rates' && renderCommissionRatesTab()}
            {activeTab === 'payouts' && renderPayoutsTab()}
            {activeTab === 'breakdown' && renderBreakdownTab()}
          </>
        )}
      </View>

      {/* Error Snackbar */}
      <Snackbar
        visible={!!error}
        onDismiss={handleDismissError}
        action={{
          label: 'Dismiss',
          onPress: handleDismissError,
        }}
      >
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  tabNavigation: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#4F46E5',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabButtonText: {
    color: '#4F46E5',
  },
  tabContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  tabSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },

  // Lead Sharing Styles
  leadSharingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  leadSharingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    width: '100%',
    maxWidth: 400,
  },
  leadSharingIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#EEF2FF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  leadSharingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  leadSharingRate: {
    fontSize: 32,
    fontWeight: '900',
    color: '#4F46E5',
    marginBottom: 32,
  },
  disclaimerContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 8,
  },

  // Commission Rates Styles
  commissionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  planBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  planText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableContainer: {
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableCell: {
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  lenderName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  remarkText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  commissionRate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
  },

  // Payouts Styles
  payoutSummaryHeader: {
    marginBottom: 20,
  },
  payoutsList: {
    paddingBottom: 20,
  },
  payoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  payoutInfo: {
    flex: 1,
    marginRight: 12,
  },
  leadIdText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  businessName: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  payoutDetails: {
    marginBottom: 16,
  },
  payoutRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  payoutItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  payoutLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  payoutValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
    textAlign: 'center',
  },
  payoutSummary: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#0369A1',
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '700',
  },
  netPayoutValue: {
    color: '#10B981',
  },
  remarkContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  remarkLabel: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '700',
    marginBottom: 4,
  },
  payoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  topupBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  topupText: {
    fontSize: 9,
    color: '#92400E',
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Breakdown Styles
  breakdownSummaryHeader: {
    marginBottom: 20,
  },
  breakdownList: {
    paddingBottom: 20,
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  breakdownMetrics: {
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 6,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '700',
    textAlign: 'center',
  },
  breakdownFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  gstStatus: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  gstLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  gstValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default CommissionScreen;