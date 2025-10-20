// app/components/DashboardHeader.tsx
import React, { useEffect, useRef } from "react"
import { View, TouchableOpacity, StyleSheet, StatusBar, Image, Text, Animated, Easing } from "react-native"
import { Menu, Search, Sparkles } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"

interface DashboardHeaderProps {
  onSidebarPress: () => void
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onSidebarPress }) => {
  // Burst controls the full BG takeover. 0 = calm, 1 = burst
  const burst = useRef(new Animated.Value(0)).current

  // Subtle pill pulse synced with burst
  const pillScale = useRef(new Animated.Value(1)).current
  const pillOpacity = useRef(new Animated.Value(1)).current

  // Ambient base background breathing (very light)
  const baseCycle = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Light ambient breathing (background base only; driver off for color interpolation safety)
    const baseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(baseCycle, { toValue: 1, duration: 4000, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(baseCycle, { toValue: 0, duration: 4000, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
      ])
    )
    baseLoop.start()

    // Auto burst every few seconds
    const id = setInterval(() => {
      runBurst()
    }, 6000)

    return () => {
      baseLoop.stop()
      clearInterval(id)
    }
  }, [])

  const runBurst = () => {
    // BG overlay
    Animated.sequence([
      Animated.timing(burst, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(250),
      Animated.timing(burst, { toValue: 0, duration: 450, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start()

    // Pill pulse (why: visual tie-in to the burst)
    Animated.parallel([
      Animated.sequence([
        Animated.timing(pillScale, { toValue: 1.06, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pillScale, { toValue: 1, duration: 300, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(pillOpacity, { toValue: 0.9, duration: 300, useNativeDriver: true }),
        Animated.timing(pillOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start()
  }

  // Very subtle base tint shift
  const baseBg = baseCycle.interpolate({
    inputRange: [0, 1],
    outputRange: ["#F8F9FA", "#FFF7ED"],
  })

  // Gradient overlay slides in a bit to feel dynamic during the burst
  const overlayOpacity = burst
  const overlayTranslate = burst.interpolate({ inputRange: [0, 1], outputRange: [0, 18] })

  const handleSearchPress = () => {
    console.log("Search pressed")
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: baseBg as any }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* FULL BG takeover during burst */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { opacity: overlayOpacity, transform: [{ translateY: overlayTranslate }] },
        ]}
      >
        <LinearGradient
          // Premium but bold; feel free to tweak
          colors={["#00B9AE", "#22D3EE", "#F59E0B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Soft vignette for depth */}
        <LinearGradient
          colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.iconButton} onPress={onSidebarPress} activeOpacity={0.7}>
          <Menu size={20} color="#374151" strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.centerContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../../assets/images/splash-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Refer + text; tap to manually burst */}
          <AnimatedTouchable
            activeOpacity={0.85}
            onPress={runBurst}
            style={[
              styles.referTextContainer,
              { transform: [{ scale: pillScale }], opacity: pillOpacity },
            ]}
          >
            <Sparkles size={12} color="#F59E0B" strokeWidth={2.5} />
            <Text style={styles.referText}>Refer & Earn</Text>
            <View style={styles.dot} />
            <Text style={styles.partnerText}>Partner</Text>
            <View style={styles.dot} />
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </AnimatedTouchable>
        </View>

        <TouchableOpacity style={styles.iconButton} onPress={handleSearchPress} activeOpacity={0.7}>
          <Search size={20} color="#374151" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

// Touchable with Animated support
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    position: "relative",
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 44,
    zIndex: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  centerContent: {
    alignItems: "center",
    gap: 6,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00B9AE",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  referTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.35)",
  },
  referText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#F59E0B",
    letterSpacing: 0.3,
  },
  partnerText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0F766E",
    letterSpacing: 0.2,
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#92400E",
    letterSpacing: 0.2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(17,24,39,0.18)",
  },
})

export default DashboardHeader
