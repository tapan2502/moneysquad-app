"use client"

import type React from "react"
import { useState, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Pressable,
  Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRoute, useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import {
  ArrowLeft,
  Star,
  Clock,
  Percent,
  DollarSign,
  Copy,
  CheckCircle,
  User,
  CreditCard,
  Briefcase,
  Calendar,
  Shield,
  TrendingUp,
  ImageOff,
  Maximize2,
  X,
} from "lucide-react-native"
import * as Clipboard from "expo-clipboard"
import { Snackbar } from "react-native-paper"
import type { BankOffer } from "../../redux/slices/offersSlice"

const { height } = Dimensions.get("window")

const OfferDetailsScreen: React.FC = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { offer } = route.params as { offer: BankOffer }

  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [isImageModalVisible, setIsImageModalVisible] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "—"
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  }

  const daysLeftInfo = useMemo(() => {
    const expiry = new Date(offer.offerValidity)
    const today = new Date()
    if (isNaN(expiry.getTime())) return { isExpired: false, label: "—" }
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return { isExpired: diff < 0, label: diff < 0 ? "Expired" : `${diff}d left` }
  }, [offer.offerValidity])

  const handleCopyOffer = async () => {
    const parts: string[] = [
      `🏦 Bank: ${offer.bankName}`,
      `📋 Offer: ${offer.offerHeadline}`,
      `💰 Interest Rate: ${offer.interestRate}% onwards`,
      `💳 Processing Fee: ${offer.processingFee}${offer.processingFeeType === "percentage" ? "%" : ""}`,
      `📅 Valid Until: ${formatDate(offer.offerValidity)}`,
      `🏷️ Loan Type: ${offer.loanType.replace(/_/g, " ")}`,
    ]
    if (offer.keyFeatures?.length) {
      parts.push("✨ Key Features:", ...offer.keyFeatures.map((f) => `• ${f}`))
    }
    if (offer.eligibility) {
      parts.push(
        "📋 Eligibility:",
        `• Age: ${offer.eligibility.minAge}-${offer.eligibility.maxAge} years`,
        `• Min Income: ₹${Number(offer.eligibility.minIncome || 0).toLocaleString()}`,
        `• Employment: ${offer.eligibility.employmentType}`,
        `• Credit Score: Up to ${offer.eligibility.maxCreditScore}`,
      )
    }
    await Clipboard.setStringAsync(parts.join("\n"))
    setSnackbarMessage("Complete offer details copied!")
    setSnackbarVisible(true)
  }

  const hasImage = !!offer.bankImage
  const features = Array.isArray(offer.keyFeatures) ? offer.keyFeatures : []
  const handleOpenImageModal = () => setIsImageModalVisible(true)
  const handleCloseImageModal = () => setIsImageModalVisible(false)

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* HERO */}
      <View style={styles.heroSection}>
        {hasImage ? (
          <Pressable style={styles.heroImageTouchable} onPress={handleOpenImageModal} accessibilityRole="button">
            <Image source={{ uri: offer.bankImage }} style={styles.heroImage} resizeMode="cover" />
          </Pressable>
        ) : (
          <View style={[styles.heroImage, styles.heroFallback]}>
            <ImageOff size={28} color="#E5E7EB" />
            <Text style={styles.heroFallbackText}>No image</Text>
          </View>
        )}

        <LinearGradient
          colors={["rgba(0,0,0,0.35)", "rgba(79,70,229,0.9)"]}
          style={styles.heroOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="box-none"
        >
          {/* Header Row */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button">
              <ArrowLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerActions}>
              {hasImage && (
                <TouchableOpacity
                  style={styles.expandImageButton}
                  onPress={handleOpenImageModal}
                  accessibilityRole="button"
                  accessibilityLabel="View bank image"
                >
                  <Maximize2 size={18} color="#FFFFFF" />
                </TouchableOpacity>
              )}

              {offer.isFeatured && (
                <View style={styles.featuredBadge}>
                  <Star size={12} color="#CA8A04" fill="#FACC15" strokeWidth={0} />
                  <Text style={styles.featuredText}>FEATURED</Text>
                </View>
              )}
            </View>
          </View>

          {/* Bank + Headline */}
          <View style={styles.bankSection}>
            <Text style={styles.bankName} numberOfLines={1}>
              {offer.bankName}
            </Text>
            <Text style={styles.offerHeadline} numberOfLines={2}>
              {offer.offerHeadline}
            </Text>
          </View>

          {/* Loan Type */}
          <View style={styles.loanTypeBadge}>
            <Text style={styles.loanTypeText}>{offer.loanType.replace(/_/g, " ")}</Text>
          </View>

          {/* Rates */}
          <View style={styles.mainRateDisplay}>
            <Text style={styles.rateText}>Starting from</Text>
            <Text style={styles.bigRate}>{Number(offer.interestRate).toFixed(2)}%</Text>
            <Text style={styles.onwardsText}>per annum</Text>
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <Clock size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.timerText}>{daysLeftInfo.label}</Text>
            <Text style={styles.expiryText}>Expires {formatDate(offer.offerValidity)}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* CONTENT */}
      <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false}>
        {/* Quick Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Offer Details</Text>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: "rgba(79, 70, 229, 0.1)" }]}>
                <Percent size={20} color="#4F46E5" />
              </View>
              <Text style={styles.metricLabel}>INTEREST RATE</Text>
              <Text style={styles.metricValue}>{Number(offer.interestRate).toFixed(2)}%</Text>
              <Text style={styles.metricSubtext}>per annum</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
                <DollarSign size={20} color="#10B981" />
              </View>
              <Text style={styles.metricLabel}>PROCESSING FEE</Text>
              <Text style={styles.metricValue}>
                {offer.processingFee}
                {offer.processingFeeType === "percentage" ? "%" : ""}
              </Text>
              <Text style={styles.metricSubtext}>
                {offer.processingFeeType === "percentage" ? "of loan amount" : "flat fee"}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: "rgba(245, 158, 11, 0.1)" }]}>
                <Calendar size={20} color="#F59E0B" />
              </View>
              <Text style={styles.metricLabel}>VALID UNTIL</Text>
              <Text style={styles.metricValue}>{formatDate(offer.offerValidity).split(" ")[0]}</Text>
              <Text style={styles.metricSubtext}>{formatDate(offer.offerValidity).split(" ").slice(1).join(" ")}</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: "rgba(139, 92, 246, 0.1)" }]}>
                <TrendingUp size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.metricLabel}>LOAN TYPE</Text>
              <Text style={styles.metricValue}>{offer.loanType.split("_")[0]}</Text>
              <Text style={styles.metricSubtext}>{offer.loanType.split("_").slice(1).join(" ") || "—"}</Text>
            </View>
          </View>
        </View>

        {/* Key Features */}
        {features.length > 0 && (
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Key Features & Benefits</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <View key={`${feature}-${index}`} style={styles.featureCard}>
                  <CheckCircle size={16} color="#10B981" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Eligibility */}
        {!!offer.eligibility && (
          <View style={styles.eligibilitySection}>
            <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
            <View style={styles.eligibilityGrid}>
              <View style={styles.eligibilityCard}>
                <View style={styles.eligibilityIcon}>
                  <User size={18} color="#4F46E5" />
                </View>
                <Text style={styles.eligibilityLabel}>Age Range</Text>
                <Text style={styles.eligibilityValue}>
                  {offer.eligibility.minAge} - {offer.eligibility.maxAge} years
                </Text>
              </View>

              <View style={styles.eligibilityCard}>
                <View style={styles.eligibilityIcon}>
                  <DollarSign size={18} color="#10B981" />
                </View>
                <Text style={styles.eligibilityLabel}>Minimum Income</Text>
                <Text style={styles.eligibilityValue}>₹{Number(offer.eligibility.minIncome).toLocaleString()}</Text>
              </View>

              <View style={styles.eligibilityCard}>
                <View style={styles.eligibilityIcon}>
                  <Briefcase size={18} color="#F59E0B" />
                </View>
                <Text style={styles.eligibilityLabel}>Employment Type</Text>
                <Text style={styles.eligibilityValue}>{offer.eligibility.employmentType}</Text>
              </View>

              <View style={styles.eligibilityCard}>
                <View style={styles.eligibilityIcon}>
                  <CreditCard size={18} color="#EF4444" />
                </View>
                <Text style={styles.eligibilityLabel}>Credit Score</Text>
                <Text style={styles.eligibilityValue}>Up to {offer.eligibility.maxCreditScore}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Important Info */}
        <View style={styles.importantInfoSection}>
          <View style={styles.infoHeader}>
            <Shield size={20} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Important Information</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              • Interest rates are subject to the bank’s assessment and can vary by profile.
            </Text>
            <Text style={styles.infoText}>• Processing fees may include GST and other applicable charges.</Text>
            <Text style={styles.infoText}>• Final loan approval is at the sole discretion of the bank.</Text>
            <Text style={styles.infoText}>• Terms & conditions apply as per the lender’s policy.</Text>
          </View>
        </View>

        {/* Copy Button */}
        <TouchableOpacity style={styles.copyButton} onPress={handleCopyOffer}>
          <LinearGradient
            colors={["#4F46E5", "#7C3AED"]}
            style={styles.copyButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Copy size={18} color="#FFFFFF" />
            <Text style={styles.copyButtonText}>Copy Complete Offer Details</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 28 }} />
      </ScrollView>

      {hasImage && (
        <Modal
          visible={isImageModalVisible}
          onRequestClose={handleCloseImageModal}
          animationType="fade"
          transparent
        >
          <View style={styles.imageModalBackdrop}>
            <Pressable style={styles.modalBackdropTouchable} onPress={handleCloseImageModal} />
            <View style={styles.imageModalContent}>
              <TouchableOpacity
                style={styles.imageModalCloseButton}
                onPress={handleCloseImageModal}
                accessibilityRole="button"
                accessibilityLabel="Close image preview"
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Image source={{ uri: offer.bankImage }} style={styles.imageModal} resizeMode="contain" />
            </View>
          </View>
        </Modal>
      )}

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1020" },

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  heroSection: {
    height: height * 0.45,
    position: "relative",
    backgroundColor: "#111827",
  },
  heroImageTouchable: {
    width: "100%",
    height: "100%",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F2937",
  },
  heroFallbackText: { marginTop: 8, color: "#E5E7EB", fontWeight: "700" },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 12, // safe area already added by SafeAreaView
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  expandImageButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDE68A",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#92400E",
  },

  bankSection: { marginVertical: 10 },
  bankName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  offerHeadline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  loanTypeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  loanTypeText: { fontSize: 13, color: "#FFFFFF", fontWeight: "800" },

  mainRateDisplay: { alignItems: "center", marginVertical: 16 },
  rateText: { fontSize: 14, color: "#FFFFFF", fontWeight: "700", marginBottom: 6 },
  bigRate: {
    fontSize: 46,
    color: "#FFFFFF",
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: -0.5,
  },
  onwardsText: { fontSize: 14, color: "#FFFFFF", fontWeight: "700", marginTop: 4 },

  timerContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  timerText: { fontSize: 14, color: "#FFFFFF", fontWeight: "800" },
  expiryText: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "600" },

  contentSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -18,
    paddingTop: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 14,
  },
  metricsSection: { paddingHorizontal: 16, marginBottom: 24 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 10.5,
    color: "#64748B",
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 0.6,
  },
  metricValue: { fontSize: 18, color: "#0F172A", fontWeight: "900", marginBottom: 2 },
  metricSubtext: { fontSize: 10, color: "#94A3B8", fontWeight: "600", textAlign: "center" },

  featuresSection: { paddingHorizontal: 16, marginBottom: 24 },
  featuresGrid: { gap: 10 },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  featureText: { fontSize: 13.5, color: "#374151", fontWeight: "600", flex: 1, lineHeight: 19 },

  eligibilitySection: { paddingHorizontal: 16, marginBottom: 24 },
  eligibilityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  eligibilityCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  eligibilityIcon: {
    width: 34,
    height: 34,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  eligibilityLabel: { fontSize: 12, color: "#64748B", fontWeight: "800", marginBottom: 6, textAlign: "center" },
  eligibilityValue: { fontSize: 13.5, color: "#0F172A", fontWeight: "800", textAlign: "center" },

  importantInfoSection: { paddingHorizontal: 16, marginBottom: 24 },
  infoHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  infoCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  infoText: { fontSize: 12.5, color: "#92400E", fontWeight: "600", lineHeight: 18, marginBottom: 6 },

  copyButton: {
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  copyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  copyButtonText: { fontSize: 15, color: "#FFFFFF", fontWeight: "900" },

  snackbar: { backgroundColor: "#4F46E5" },
  imageModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(7, 11, 24, 0.94)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBackdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  imageModalContent: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#0B1020",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  imageModal: {
    width: "100%",
    height: height * 0.5,
    borderRadius: 12,
  },
  imageModalCloseButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
})

export default OfferDetailsScreen
