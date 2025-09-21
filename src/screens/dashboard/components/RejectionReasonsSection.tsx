import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView } from 'react-native';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';

import { RejectionReasonResponse, RejectionReasonCount } from '../../../redux/slices/dashboardSlice';

interface RejectionReasonsSectionProps {
  data: RejectionReasonResponse | null;
  isLoading: boolean;
}

const RejectionReasonsSection: React.FC<RejectionReasonsSectionProps> = ({ data, isLoading }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (!isLoading && data) {
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
  }, [isLoading, data, fadeAnim, slideAnim]);

  if (isLoading || !data) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Rejection Analysis</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading rejection data...</Text>
        </View>
      </View>
    );
  }

  const getReasonColor = (index: number) => {
    const colors = [
      '#EF4444', '#F59E0B', '#8B5CF6', '#3B82F6', 
      '#10B981', '#F97316', '#EC4899', '#6366F1'
    ];
    return colors[index % colors.length];
  };

  const ReasonItem = ({ reason, index }: { reason: RejectionReasonCount; index: number }) => {
    const itemAnim = useRef(new Animated.Value(0)).current;
    const barAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const delay = index * 150;
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(itemAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(barAnim, {
            toValue: reason.percent,
            duration: 800,
            useNativeDriver: false,
          }),
        ]).start();
      }, delay);
    }, [itemAnim, barAnim, index, reason.percent]);

    const reasonColor = getReasonColor(index);

    return (
      <Animated.View 
        style={[
          styles.reasonItem,
          { 
            opacity: itemAnim,
            transform: [{ translateX: slideAnim }],
          }
        ]}
      >
        <View style={styles.reasonHeader}>
          <View style={styles.reasonInfo}>
            <View style={[styles.colorDot, { backgroundColor: reasonColor }]} />
            <Text style={styles.reasonText} numberOfLines={2}>
              {reason.reason}
            </Text>
          </View>
          <View style={styles.reasonStats}>
            <Text style={styles.reasonCount}>{reason.count}</Text>
            <Text style={styles.reasonPercent}>{reason.percent.toFixed(1)}%</Text>
          </View>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBg, { backgroundColor: `${reasonColor}20` }]} />
          <Animated.View 
            style={[
              styles.progressBar,
              { 
                backgroundColor: reasonColor,
                width: barAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              }
            ]}
          />
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
        <View style={styles.titleContainer}>
          <AlertTriangle size={18} color="#EF4444" strokeWidth={2.5} />
          <Text style={styles.sectionTitle}>Rejection Analysis</Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Rejections</Text>
          <Text style={styles.totalCount}>{data.totalCount}</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.reasonsList}
        showsVerticalScrollIndicator={false}
      >
        {data.rejectionReasonCount.map((reason, index) => (
          <ReasonItem 
            key={`${reason.reason}-${index}`} 
            reason={reason} 
            index={index}
          />
        ))}
      </ScrollView>

      <View style={styles.insightContainer}>
        <Text style={styles.insightTitle}>Key Insights</Text>
        <Text style={styles.insightText}>
          Top rejection reason: {data.rejectionReasonCount[0]?.reason} ({data.rejectionReasonCount[0]?.percent.toFixed(1)}%)
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  totalCount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#EF4444',
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
  reasonsList: {
    maxHeight: 300,
  },
  reasonItem: {
    marginBottom: 16,
  },
  reasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reasonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },
  reasonStats: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  reasonCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  reasonPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  progressBarContainer: {
    height: 6,
    position: 'relative',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarBg: {
    height: '100%',
    width: '100%',
    borderRadius: 3,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  insightContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  insightText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    lineHeight: 18,
  },
});

export default RejectionReasonsSection;