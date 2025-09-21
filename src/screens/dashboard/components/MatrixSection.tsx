import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { TrendingUp, TrendingDown, Clock, Target, DollarSign, ChartBar as BarChart3 } from 'lucide-react-native';

import { MatrixData } from '../../../redux/slices/dashboardSlice';

interface MatrixSectionProps {
  matrix: MatrixData | null;
  isLoading: boolean;
}

const MatrixSection: React.FC<MatrixSectionProps> = ({ matrix, isLoading }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (!isLoading && matrix) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, matrix, fadeAnim, slideAnim]);

  if (isLoading || !matrix) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading metrics...</Text>
        </View>
      </View>
    );
  }

  const formatPercentage = (value: number) => `${value}%`;
  const formatCurrency = (amount: number) => {
    if (amount === 0) return '₹0';
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const getTrendColor = (percentage: number) => {
    return (percentage ?? 0) >= 0 ? '#10B981' : '#EF4444';
  };

  const getTrendIcon = (percentage: number) => {
    return (percentage ?? 0) >= 0 ? TrendingUp : TrendingDown;
  };

  const MetricCard = ({ 
    title, 
    value, 
    previousValue, 
    deltaPercentage, 
    icon: Icon, 
    iconColor, 
    iconBg,
    index 
  }: any) => {
    const cardFadeAnim = useRef(new Animated.Value(0)).current;
    const cardSlideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
      const delay = index * 150;
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(cardFadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(cardSlideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, delay);
    }, [cardFadeAnim, cardSlideAnim, index]);

    const TrendIcon = getTrendIcon(deltaPercentage);
    const trendColor = getTrendColor(deltaPercentage);

    // Handle null/undefined deltaPercentage
    const safeDeltaPercentage = deltaPercentage ?? 0;

    return (
      <Animated.View 
        style={[
          styles.metricCard,
          {
            opacity: cardFadeAnim,
            transform: [{ translateY: cardSlideAnim }],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
            <Icon size={18} color={iconColor} strokeWidth={2.5} />
          </View>
          
          <View style={[styles.trendBadge, { backgroundColor: `${trendColor}15` }]}>
            <TrendIcon size={10} color={trendColor} strokeWidth={2.5} />
            <Text style={[styles.trendText, { color: trendColor }]}>
              {safeDeltaPercentage >= 0 ? '+' : ''}{safeDeltaPercentage.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricTitle}>{title}</Text>
          <Text style={styles.previousValue}>Previous: {previousValue}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
        <Text style={styles.subtitle}>Real-time insights and performance tracking</Text>
      </View>
      
      <View style={styles.metricsGrid}>
        <MetricCard
          title="DISBURSAL RATE"
          value={formatPercentage(matrix.disbursalRate.current_month_amount)}
          previousValue={formatPercentage(matrix.disbursalRate.previous_month_amount)}
          deltaPercentage={matrix.disbursalRate.delta_percentage}
          icon={BarChart3}
          iconColor="#6366F1"
          iconBg="#EEF2FF"
          index={0}
        />
        
        <MetricCard
          title="AVG. TAT DAYS"
          value={matrix.avgTATDays.current_month_amount.toString()}
          previousValue={matrix.avgTATDays.previous_month_amount.toString()}
          deltaPercentage={matrix.avgTATDays.delta_percentage}
          icon={Clock}
          iconColor="#10B981"
          iconBg="#ECFDF5"
          index={1}
        />
        
        <MetricCard
          title="AVG. LOAN AMOUNT"
          value={formatCurrency(matrix.avgLoanAmount.current_month_amount)}
          previousValue={formatCurrency(matrix.avgLoanAmount.previous_month_amount)}
          deltaPercentage={matrix.avgLoanAmount.delta_percentage}
          icon={DollarSign}
          iconColor="#F59E0B"
          iconBg="#FFFBEB"
          index={2}
        />
        
        <MetricCard
          title="TARGET ACHIEVED"
          value={formatPercentage(matrix.targetAchieved.current_month_amount)}
          previousValue={formatPercentage(matrix.targetAchieved.previous_month_amount)}
          deltaPercentage={matrix.targetAchieved.delta_percentage}
          icon={Target}
          iconColor="#EF4444"
          iconBg="#FEF2F2"
          index={3}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#475569',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  previousValue: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

export default MatrixSection;