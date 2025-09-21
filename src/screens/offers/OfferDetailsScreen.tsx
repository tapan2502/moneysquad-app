"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, StatusBar } from "react-native"
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
} from "lucide-react-native"
import * as Clipboard from "expo-clipboard"
import { Snackbar } from "react-native-paper"
import type { BankOffer } from "../../redux/slices/offersSlice"

const { width, height } = Dimensions.get("window")

const OfferDetailsScreen: React.FC = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { offer } = route.params as { offer: BankOffer }

  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getDaysUntilExpiry = (validityDate: string) => {
    const today = new Date()
    const expiry = new Date(validityDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleCopyOffer = async () => {
    const offerDetails = `
🏦 Bank: ${offer.bankName}
📋 Offer: ${offer.offerHeadline}
💰 Interest Rate: ${offer.interestRate}%
💳 Processing Fee: ${offer.processingFee}${offer.processingFeeType === "percentage" ? "%" : ""}
📅 Valid Until: ${formatDate(offer.offerValidity)}
🏷️ Loan Type: ${offer.loanType.replace(/_/g, " ")}
${offer.keyFeatures.length > 0 ? `✨ Features: ${offer.keyFeatures.join(", ")}` : ""}
    `.trim()

    await Clipboard.setStringAsync(offerDetails)
    setSnackbarMessage("Offer details copied to clipboard!")
    setSnackbarVisible(true)
  }

  const daysLeft = getDaysUntilExpiry(offer.offerValidity)
  const isExpired = daysLeft < 0

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Hero section with banner image */}
      <View style={styles.heroSection}>
        <Image source={{ uri: offer.bankImage }} style={styles.heroImage} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.8)"]}
          style={styles.heroOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>

            {offer.isFeatured && (
              <View style={styles.featuredBadge}>
                <Star size={14} color="#FFD700" fill="#FFD700" strokeWidth={0} />
                <Text style={styles.featuredText}>FEATURED</Text>
              </View>
            )}
          </View>

          {/* Loan type */}
          <View style={styles.loanTypeBadge}>
            <Text style={styles.loanTypeText}>{offer.loanType.replace(/_/g, " ")}</Text>
          </View>

          {/* Main rate display */}
          <View style={styles.mainRateDisplay}>
            <Text style={styles.rateText}>Rates Starting @</Text>
            <Text style={styles.bigRate}>{offer.interestRate}%</Text>
            <Text style={styles.onwardsText}>onwards</Text>
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <Clock size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.timerText}>{isExpired ? "Expired" : `${daysLeft}d left`}</Text>
            <Text style={styles.expiryText}>Expires {formatDate(offer.offerValidity)}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Content section */}
      <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false}>
        {/* Bank info */}
        <View style={styles.bankInfo}>
          <View style={styles.bankHeader}>
            <Text style={styles.bankName}>{offer.bankName}</Text>
            <Star size={18} color="#FFD700" fill="#FFD700" strokeWidth={0} />
          </View>
          <Text style={styles.offerHeadline}>{offer.offerHeadline}</Text>
        </View>

        {/* Key metrics */}
        <View style={styles.metricsSection}>
          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Percent size={20} color="#00B9AE" strokeWidth={2} />
            </View>
            <Text style={styles.metricLabel}>INTEREST RATE</Text>
            <Text style={styles.metricValue}>{offer.interestRate}%</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <DollarSign size={20} color="#4F46E5" strokeWidth={2} />
            </View>
            <Text style={styles.metricLabel}>PROCESSING FEE</Text>
            <Text style={styles.metricValue}>
              {offer.processingFee}
              {offer.processingFeeType === "percentage" ? "%" : ""}
            </Text>
          </View>
        </View>

        {/* Key features */}
        {offer.keyFeatures.length > 0 && (
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            {offer.keyFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <CheckCircle size={16} color="#00B9AE" strokeWidth={2} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Eligibility (if available) */}
        {offer.eligibility && (
          <View style={styles.eligibilitySection}>
            <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
            <View style={styles.eligibilityGrid}>
              <View style={styles.eligibilityItem}>
                <User size={18} color="#00B9AE" strokeWidth={2} />
                <Text style={styles.eligibilityLabel}>Age</Text>
                <Text style={styles.eligibilityValue}>
                  {offer.eligibility.minAge} - {offer.eligibility.maxAge} years
                </Text>
              </View>

              <View style={styles.eligibilityItem}>
                <CreditCard size={18} color="#00B9AE" strokeWidth={2} />
                <Text style={styles.eligibilityLabel}>Min Income</Text>
                <Text style={styles.eligibilityValue}>₹{offer.eligibility.minIncome.toLocaleString()}</Text>
              </View>

              <View style={styles.eligibilityItem}>
                <Briefcase size={18} color="#00B9AE" strokeWidth={2} />
                <Text style={styles.eligibilityLabel}>Employment</Text>
                <Text style={styles.eligibilityValue}>{offer.eligibility.employmentType}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Copy button */}
        <TouchableOpacity style={styles.copyButton} onPress={handleCopyOffer}>
          <Copy size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.copyButtonText}>Copy Offer Details</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  heroSection: {
    height: height * 0.45,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400E",
  },
  loanTypeBadge: {
    backgroundColor: "rgba(0, 185, 174, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  loanTypeText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  mainRateDisplay: {
    alignItems: "center",
    marginVertical: 20,
  },
  rateText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 8,
  },
  bigRate: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  onwardsText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
    marginTop: 4,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timerText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  expiryText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  contentSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 24,
  },
  bankInfo: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  bankHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  bankName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  offerHeadline: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "600",
  },
  metricsSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  metricIcon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(0, 185, 174, 0.1)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  metricValue: {
    fontSize: 20,
    color: "#0F172A",
    fontWeight: "800",
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  eligibilitySection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  eligibilityGrid: {
    gap: 16,
  },
  eligibilityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  eligibilityLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
    flex: 1,
  },
  eligibilityValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00B9AE",
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  copyButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  snackbar: {
    backgroundColor: "#00B9AE",
  },
})

export default OfferDetailsScreen
