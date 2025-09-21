import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { TrendMonth } from '../../../redux/slices/dashboardSlice';
import { TrendingUp, Users, Target, DollarSign } from 'lucide-react-native';

interface TrendsSectionProps {
  trends: TrendMonth[];
  isLoading: boolean;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const TrendsSection: React.FC<TrendsSectionProps> = ({ 
  trends, 
  isLoading, 
  selectedPeriod, 
  onPeriodChange 
}) => {

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <TrendingUp size={16} color="#4F46E5" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Performance Trends</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading trends...</Text>
        </View>
      </View>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <TrendingUp size={16} color="#4F46E5" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Performance Trends</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No trends data available</Text>
        </View>
      </View>
    );
  }

  // Filter trends based on selected period - show current + previous months
  const getFilteredTrends = () => {
    // Return all trends from API since API already filters based on trendMonths parameter
    return trends;
  };

  const filteredTrends = getFilteredTrends();

  // Format month for display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`;
  };

  // Format currency in lakhs
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Performance Trends</Text>
        
        <View style={styles.periodSelector}>
          {(['3', '6', '12']).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => onPeriodChange(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period}M
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Metrics Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Users size={12} color="#F59E0B" strokeWidth={2} />
          <Text style={styles.legendText}>Active Leads</Text>
        </View>
        <View style={styles.legendItem}>
          <Target size={12} color="#8B5CF6" strokeWidth={2} />
          <Text style={styles.legendText}>Total Disbursed</Text>
        </View>
        <View style={styles.legendItem}>
          <DollarSign size={12} color="#10B981" strokeWidth={2} />
          <Text style={styles.legendText}>Disbursal Amount</Text>
        </View>
      </View>

      {/* Trends Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.trendsScroll}
      >
        {filteredTrends.map((trend, index) => (
          <View key={index} style={styles.trendCard}>
            <Text style={styles.monthLabel}>{formatMonth(trend.month)}</Text>
            
            <View style={styles.metricsContainer}>
              <View style={styles.metricRow}>
                <View style={[styles.metricDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.metricValue}>{trend.activeLead}</Text>
              </View>
              
              <View style={styles.metricRow}>
                <View style={[styles.metricDot, { backgroundColor: '#8B5CF6' }]} />
                <Text style={styles.metricValue}>{trend.totalDisbursed}</Text>
              </View>
              
              <View style={styles.metricRow}>
                <View style={[styles.metricDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.metricValue}>{formatCurrency(trend.totalDisbursedsumLoanAmounts)}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Active Leads</Text>
          <Text style={styles.summaryValue}>
            {filteredTrends.reduce((sum, trend) => sum + trend.activeLead, 0)}
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Disbursed</Text>
          <Text style={styles.summaryValue}>
            {filteredTrends.reduce((sum, trend) => sum + trend.totalDisbursed, 0)}
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(filteredTrends.reduce((sum, trend) => sum + trend.totalDisbursedsumLoanAmounts, 0))}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 36,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#4F46E5',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
  },
  trendsScroll: {
    paddingHorizontal: 4,
    gap: 12,
  },
  trendCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  monthLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 12,
  },
  metricsContainer: {
    gap: 8,
    width: '100%',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
});

export default TrendsSection;