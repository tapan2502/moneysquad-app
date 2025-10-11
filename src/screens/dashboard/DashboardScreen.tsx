import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { 
  fetchSnapshotData,
  fetchTrends,
  fetchMatrix,
  fetchFunnelData,
  fetchRejectionReasonCount,
  clearError
} from '../../redux/slices/dashboardSlice';
import DashboardHeader from './components/DashboardHeader';
import FilterSection from './components/FilterSection';
import SnapshotSection from './components/SnapshotSection';
import TrendsSection from './components/TrendsSection';
import MatrixSection from './components/MatrixSection';
import FunnelSection from './components/FunnelSection';
import RejectionReasonsSection from './components/RejectionReasonsSection';
import ReferEarnBanner from './components/ReferEarnBanner';
import { Snackbar } from 'react-native-paper';
import Sidebar from '../../components/sidebar/Sidebar';

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedPeriod, setSelectedPeriod] = useState('6');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { 
    snapshot, 
    snapshotLoading,
    matrix, 
    matrixLoading,
    funnelStages, 
    funnelLoading,
    rejectionReasonCount, 
    rejectionLoading,
    trends, 
    trendsLoading,
    funnelError,
    snapshotError,
    rejectionError,
    trendsError,
    matrixError
  } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { selectedLoanType, selectedAssociate, selectedMonth } = useSelector(
    (state: RootState) => state.filter
  );

  const isLoading = snapshotLoading || matrixLoading || funnelLoading || rejectionLoading || trendsLoading;
  const error = funnelError || snapshotError || rejectionError || trendsError || matrixError;

  useEffect(() => {
    loadDashboardData();
  }, [selectedLoanType, selectedAssociate, selectedMonth, selectedPeriod]);

  const loadDashboardData = () => {
    const apiFilters = {
      period: selectedMonth,
      loanType: selectedLoanType !== 'all' ? selectedLoanType : undefined,
      associateId: selectedAssociate !== 'all' ? selectedAssociate : undefined,
    };
    
    dispatch(fetchSnapshotData(apiFilters) as any);
    
    // For trends, we need to pass the selected period as trendMonths
    const trendsFilters = {
      ...apiFilters,
      trendMonths: parseInt(selectedPeriod || '6'), // Default to 6 months
    };
    dispatch(fetchTrends(trendsFilters) as any);
    
    // Fetch other dashboard data
    dispatch(fetchMatrix(apiFilters) as any);
    dispatch(fetchFunnelData(apiFilters) as any);
    dispatch(fetchRejectionReasonCount(apiFilters) as any);
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const handleSidebarPress = () => {
    setSidebarVisible(true);
  };

  const handleCloseSidebar = () => {
    setSidebarVisible(false);
  };

  return (
    <View style={styles.container}>
      <DashboardHeader onSidebarPress={handleSidebarPress} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
      >
        <ReferEarnBanner />
        <FilterSection />
        <SnapshotSection 
          snapshot={snapshot} 
          isLoading={snapshotLoading}
        />
        <TrendsSection 
          trends={trends} 
          isLoading={trendsLoading}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
        <MatrixSection 
          matrix={matrix} 
          isLoading={matrixLoading}
        />
        <FunnelSection 
          stages={funnelStages} 
          isLoading={funnelLoading}
        />
        <RejectionReasonsSection 
          data={rejectionReasonCount} 
          isLoading={rejectionLoading}
        />
      </ScrollView>

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

      <Sidebar 
        visible={sidebarVisible} 
        onClose={handleCloseSidebar} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom navigation
  },
});

export default DashboardScreen;