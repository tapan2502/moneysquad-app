import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ReferEarnBanner: React.FC = () => {
  const translateX = useRef(new Animated.Value(width)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: -width * 0.5,
            duration: 15000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: width,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.banner, { opacity }]}>
        <View style={styles.gradientOverlay} />
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Sparkles size={20} color="#FCD34D" strokeWidth={2.5} />
          </View>
          <Animated.View style={[styles.textContainer, { transform: [{ translateX }] }]}>
            <Text style={styles.text}>
              <Text style={styles.highlight}>Refer & Earn</Text> - Coming Soon!
              <Text style={styles.separator}>  •  </Text>
              Exciting rewards await
              <Text style={styles.separator}>  •  </Text>
              Stay tuned for updates
              <Text style={styles.separator}>  •  </Text>
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  banner: {
    position: 'relative',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    overflow: 'hidden',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    shadowColor: '#FCD34D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F5F9',
    letterSpacing: 0.3,
  },
  highlight: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FCD34D',
    letterSpacing: 0.5,
  },
  separator: {
    color: '#64748B',
    fontWeight: '400',
  },
});

export default ReferEarnBanner;
