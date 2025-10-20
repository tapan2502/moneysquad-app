// app/components/DashboardHeader.tsx
import React, { useEffect, useRef } from "react"
import { View, TouchableOpacity, StyleSheet, StatusBar, Image, Text, Animated, Easing } from "react-native"
import { Menu, Search, Sparkles } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"

interface DashboardHeaderProps {
  onSidebarPress: () => void
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onSidebarPress }) => {
  const animatedValue = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current
  const opacityAnim = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [
      "#F8F9FA",
      "#FFF7ED",
      "#FEF3C7",
      "#FFF7ED",
      "#F8F9FA",
    ],
  })

  const handleSearchPress = () => {
    console.log("Search pressed")
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <Animated.View
        style={[
          styles.animatedOverlay,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(251, 191, 36, 0.15)", "rgba(0, 185, 174, 0.15)", "rgba(251, 191, 36, 0.15)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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
          <Animated.View style={[styles.referTextContainer, { opacity: opacityAnim }]}>
            <Sparkles size={12} color="#F59E0B" strokeWidth={2.5} />
            <Text style={styles.referText}>Refer & Earn</Text>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </Animated.View>
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
  animatedOverlay: {
    ...StyleSheet.absoluteFillObject,
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
    gap: 4,
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
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  referText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#F59E0B",
    letterSpacing: 0.3,
  },
  comingSoonText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#92400E",
    letterSpacing: 0.2,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
})

export default DashboardHeader
