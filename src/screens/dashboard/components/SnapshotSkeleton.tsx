import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 64) / 2;

const SnapshotSkeleton: React.FC = () => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };

    shimmer();
  }, [shimmerAnimation]);

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const SkeletonCard = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <Animated.View 
          style={[styles.skeletonIcon, { opacity: shimmerOpacity }]} 
        />
        <Animated.View 
          style={[styles.skeletonTrend, { opacity: shimmerOpacity }]} 
        />
      </View>
      
      <View style={styles.skeletonContent}>
        <Animated.View 
          style={[styles.skeletonValue, { opacity: shimmerOpacity }]} 
        />
        <Animated.View 
          style={[styles.skeletonTitle, { opacity: shimmerOpacity }]} 
        />
        <Animated.View 
          style={[styles.skeletonSubtitle, { opacity: shimmerOpacity }]} 
        />
        <Animated.View 
          style={[styles.skeletonSubtitle2, { opacity: shimmerOpacity }]} 
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[styles.sectionTitleSkeleton, { opacity: shimmerOpacity }]} 
      />
      
      <View style={styles.cardsGrid}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionTitleSkeleton: {
    height: 20,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 16,
    width: '60%',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skeletonCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
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
    minHeight: 180,
    maxHeight: 180,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    height: 32,
  },
  skeletonIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  skeletonTrend: {
    width: 50,
    height: 20,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
  },
  skeletonContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  skeletonValue: {
    height: 24,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    width: '80%',
    marginBottom: 6,
  },
  skeletonTitle: {
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    width: '90%',
    marginBottom: 2,
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    width: '90%',
    marginBottom: 2,
  },
  skeletonSubtitle2: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    width: '75%',
  },
});

export default SnapshotSkeleton;