import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from 'lucide-react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const cardWidth = (width - 52) / 2; // Account for padding and gap

export interface TrendData {
  value: string; // e.g. "+12.5%" or "-5.3%"
  color: string; // hex color
}

export interface SnapshotCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: TrendData;
  icon?: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  iconColor: string;
  iconBackground: string;
  cardType?: 'commission' | 'disbursal' | 'leads' | 'approval';
  onPress?: () => void;
}

// Decorative SVG patterns for different card types
const DecorativePattern: React.FC<{ cardType?: SnapshotCardProps['cardType'] }> = ({ cardType = 'commission' }) => {
  // Unique suffix to avoid duplicate <Defs> IDs across multiple instances
  const uid = useMemo(() => Math.random().toString(36).slice(2, 9), []);

  const ids = {
    coin1: `coinGradient1-${uid}`,
    coin2: `coinGradient2-${uid}`,
    target: `targetGradient-${uid}`,
    people: `peopleGradient-${uid}`,
    growth: `growthGradient-${uid}`,
  };

  const patterns = {
    // Commission Earned - Money/Coins theme
    commission: (
      <Svg width="90" height="85" style={styles.decorativePattern}>
        <Defs>
          <LinearGradient id={ids.coin1} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#10B981" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#059669" stopOpacity="0.06" />
          </LinearGradient>
          <LinearGradient id={ids.coin2} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#34D399" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#10B981" stopOpacity="0.04" />
          </LinearGradient>
        </Defs>

        {/* Large coin */}
        <Circle cx="65" cy="25" r="18" fill={`url(#${ids.coin1})`} stroke="#10B981" strokeWidth={0.5} opacity={0.8} />
        <Circle cx="65" cy="25" r="12" fill="none" stroke="#10B981" strokeWidth={0.8} opacity={0.3} />

        {/* Medium coin */}
        <Circle cx="45" cy="50" r="14" fill={`url(#${ids.coin2})`} stroke="#34D399" strokeWidth={0.4} opacity={0.6} />
        <Circle cx="45" cy="50" r="9" fill="none" stroke="#34D399" strokeWidth={0.6} opacity={0.25} />

        {/* Small coin */}
        <Circle cx="70" cy="60" r="10" fill={`url(#${ids.coin1})`} stroke="#10B981" strokeWidth={0.3} opacity={0.5} />
        <Circle cx="70" cy="60" r="6" fill="none" stroke="#10B981" strokeWidth={0.4} opacity={0.2} />

        {/* Extra dots */}
        <Circle cx="30" cy="35" r="3" fill="#10B981" opacity={0.15} />
        <Circle cx="75" cy="45" r="2" fill="#34D399" opacity={0.1} />
      </Svg>
    ),

    // Total Disbursal - Target/Arrow theme
    disbursal: (
      <Svg width="90" height="85" style={styles.decorativePattern}>
        <Defs>
          <LinearGradient id={ids.target} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#4F46E5" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#3730A3" stopOpacity="0.06" />
          </LinearGradient>
        </Defs>

        {/* Target circles */}
        <Circle cx="60" cy="30" r="20" fill="none" stroke="#4F46E5" strokeWidth={1} opacity={0.15} />
        <Circle cx="60" cy="30" r="15" fill="none" stroke="#4F46E5" strokeWidth={0.8} opacity={0.2} />
        <Circle cx="60" cy="30" r="10" fill="none" stroke="#6366F1" strokeWidth={0.6} opacity={0.25} />
        <Circle cx="60" cy="30" r="5" fill="#4F46E5" opacity={0.3} />

        {/* Arrow pointing to target */}
        <Path d="M25 50 L50 35 L45 40 L55 30 L50 35 L45 40 Z" fill="#4F46E5" opacity={0.2} />
        <Path d="M20 55 L25 50 L30 55 Z" fill="#4F46E5" opacity={0.15} />

        {/* Scattered dots */}
        <Circle cx="35" cy="60" r="3" fill="#6366F1" opacity={0.1} />
        <Circle cx="75" cy="55" r="4" fill="#4F46E5" opacity={0.08} />
        <Circle cx="25" cy="25" r="2" fill="#6366F1" opacity={0.12} />
      </Svg>
    ),

    // Leads Added - People/Users theme
    leads: (
      <Svg width="90" height="85" style={styles.decorativePattern}>
        <Defs>
          <LinearGradient id={ids.people} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#D97706" stopOpacity="0.06" />
          </LinearGradient>
        </Defs>

        {/* Person 1 */}
        <Circle cx="50" cy="25" r="8" fill={`url(#${ids.people})`} />
        <Path d="M42 45 Q50 35 58 45 Q58 55 50 55 Q42 55 42 45" fill={`url(#${ids.people})`} />

        {/* Person 2 */}
        <Circle cx="65" cy="30" r="6" fill="#F59E0B" opacity={0.15} />
        <Path d="M59 48 Q65 40 71 48 Q71 56 65 56 Q59 56 59 48" fill="#F59E0B" opacity={0.15} />

        {/* Person 3 */}
        <Circle cx="35" cy="35" r="5" fill="#FBBF24" opacity={0.12} />
        <Path d="M30 50 Q35 44 40 50 Q40 56 35 56 Q30 56 30 50" fill="#FBBF24" opacity={0.12} />

        {/* Connections */}
        <Path d="M50 40 Q57 42 65 45" stroke="#F59E0B" strokeWidth={0.8} fill="none" opacity={0.1} />
        <Path d="M45 42 Q40 45 35 48" stroke="#F59E0B" strokeWidth={0.8} fill="none" opacity={0.1} />

        {/* Plus signs */}
        <Path d="M70 20 L70 26 M73 23 L67 23" stroke="#F59E0B" strokeWidth={1} opacity={0.15} />
        <Path d="M25 55 L25 59 M27 57 L23 57" stroke="#FBBF24" strokeWidth={0.8} opacity={0.1} />
      </Svg>
    ),

    // Approval Amount - Growth/Chart theme
    approval: (
      <Svg width="90" height="85" style={styles.decorativePattern}>
        <Defs>
          <LinearGradient id={ids.growth} x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#7C3AED" stopOpacity="0.06" />
          </LinearGradient>
        </Defs>

        {/* Bars */}
        <Path d="M30 60 L30 50 L35 50 L35 60 Z" fill={`url(#${ids.growth})`} />
        <Path d="M40 60 L40 45 L45 45 L45 60 Z" fill="#8B5CF6" opacity={0.15} />
        <Path d="M50 60 L50 35 L55 35 L55 60 Z" fill={`url(#${ids.growth})`} />
        <Path d="M60 60 L60 28 L65 28 L65 60 Z" fill="#8B5CF6" opacity={0.18} />

        {/* Trend line & arrow */}
        <Path d="M30 55 Q40 47 50 40 Q60 32 70 25" stroke="#8B5CF6" strokeWidth={1.5} fill="none" opacity={0.2} />
        <Path d="M65 25 L70 20 L75 25 M70 20 L70 35" stroke="#8B5CF6" strokeWidth={1.2} fill="none" opacity={0.25} />

        {/* Checks */}
        <Path d="M25 30 L28 33 L35 26" stroke="#A855F7" strokeWidth={1} fill="none" opacity={0.15} />
        <Path d="M70 45 L72 47 L76 43" stroke="#8B5CF6" strokeWidth={0.8} fill="none" opacity={0.12} />

        {/* Background bits */}
        <Circle cx="75" cy="60" r="6" fill="#A855F7" opacity={0.08} />
        <Circle cx="25" cy="40" r="4" fill="#8B5CF6" opacity={0.1} />
      </Svg>
    ),
  };

  return patterns[cardType] || patterns.commission;
};

const SnapshotCard: React.FC<SnapshotCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor,
  iconBackground,
  cardType = 'commission',
  onPress,
}) => {
  const CardComponent: any = onPress ? TouchableOpacity : View;
  const isPositiveTrend = trend ? !trend.value.trim().startsWith('-') : undefined;

  return (
    <CardComponent
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Decorative background pattern */}
      <View style={styles.decorativeContainer}>
        <DecorativePattern cardType={cardType} />
      </View>

      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: iconBackground }]}>
          {Icon ? (
            <Icon size={16} color={iconColor} strokeWidth={2.5} />
          ) : (
            <View /> // fallback to avoid invalid element type
          )}
        </View>

        {!!trend && (
          <View style={[styles.trendContainer, { backgroundColor: `${trend.color}15` }]}>
            {isPositiveTrend ? (
              <TrendingUpIcon size={10} color={trend.color} strokeWidth={2.5} />
            ) : (
              <TrendingDownIcon size={10} color={trend.color} strokeWidth={2.5} />
            )}
            <Text style={[styles.trendText, { color: trend.color }]}>{trend.value}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardValue} numberOfLines={1}>{value}</Text>
        <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>{subtitle}</Text>
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    minHeight: 160,
    maxHeight: 160,
    overflow: 'hidden',
    position: 'relative',
  },
  decorativeContainer: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    zIndex: 0,
  },
  decorativePattern: {
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    height: 32,
    zIndex: 2,
    position: 'relative',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    // If RN version doesn't support `gap`, use marginLeft on the text:
    // gap: 3,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginLeft: 3, // works everywhere
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-start',
    zIndex: 2,
    position: 'relative',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 14,
    flex: 1,
  },
});

export default SnapshotCard;
