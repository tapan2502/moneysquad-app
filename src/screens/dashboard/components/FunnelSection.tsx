import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { FunnelStage } from '../../../redux/slices/dashboardSlice';

interface FunnelSectionProps {
  stages: FunnelStage[];
  isLoading: boolean;
}

const FunnelSection: React.FC<FunnelSectionProps> = ({ stages, isLoading }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (!isLoading && stages.length > 0) {
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
  }, [isLoading, stages, fadeAnim, slideAnim]);

  if (isLoading || stages.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Conversion Funnel</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading funnel data...</Text>
        </View>
      </View>
    );
  }

  const getStageColor = (index: number) => {
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];
    return colors[index % colors.length];
  };

  const getStageWidth = (conversionPct: number) => {
    return Math.max(conversionPct, 10); // Minimum 10% width for visibility
  };

  const FunnelStage = ({ stage, index, isLast }: { stage: FunnelStage; index: number; isLast: boolean }) => {
    const stageAnim = useRef(new Animated.Value(0)).current;
    const widthAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const delay = index * 200;
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(stageAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(widthAnim, {
            toValue: getStageWidth(stage.conversionPct),
            duration: 800,
            useNativeDriver: false,
          }),
        ]).start();
      }, delay);
    }, [stageAnim, widthAnim, index, stage.conversionPct]);

    const stageColor = getStageColor(index);
    const displayCount = stage.currentCount > 0 ? stage.currentCount : stage.count;

    return (
      <Animated.View 
        style={[
          styles.stageContainer,
          { opacity: stageAnim, transform: [{ translateX: slideAnim }] }
        ]}
      >
        <View style={styles.stageHeader}>
          <Text style={styles.stageName}>{stage.name}</Text>
          <View style={styles.stageStats}>
            <Text style={styles.stageCount}>{displayCount}</Text>
            <Text style={styles.conversionPct}>{stage.conversionPct.toFixed(1)}%</Text>
          </View>
        </View>
        
        <View style={styles.stageBarContainer}>
          <Animated.View 
            style={[
              styles.stageBar,
              { 
                backgroundColor: stageColor,
                width: widthAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              }
            ]}
          />
          <View style={[styles.stageBarBg, { backgroundColor: `${stageColor}20` }]} />
        </View>

        {!isLast && (
          <View style={styles.arrowContainer}>
            <ChevronRight size={16} color="#64748B" strokeWidth={2} />
          </View>
        )}
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
        <Text style={styles.sectionTitle}>Conversion Funnel</Text>
        <Text style={styles.subtitle}>Lead progression through stages</Text>
      </View>
      
      <View style={styles.funnelContainer}>
        {stages.map((stage, index) => (
          <FunnelStage 
            key={stage.name} 
            stage={stage} 
            index={index} 
            isLast={index === stages.length - 1}
          />
        ))}
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Leads</Text>
          <Text style={styles.summaryValue}>
            {stages.reduce((sum, stage) => sum + stage.count, 0)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Conversion Rate</Text>
          <Text style={styles.summaryValue}>
            {stages.length > 0 ? stages[stages.length - 1].conversionPct.toFixed(1) : 0}%
          </Text>
        </View>
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
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
  funnelContainer: {
    gap: 16,
  },
  stageContainer: {
    position: 'relative',
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  stageStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stageCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  conversionPct: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stageBarContainer: {
    height: 8,
    position: 'relative',
    borderRadius: 4,
    overflow: 'hidden',
  },
  stageBar: {
    height: '100%',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  stageBarBg: {
    height: '100%',
    width: '100%',
    borderRadius: 4,
  },
  arrowContainer: {
    position: 'absolute',
    right: -8,
    top: '50%',
    transform: [{ translateY: -8 }],
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
});

export default FunnelSection;
