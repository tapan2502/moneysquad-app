// screens/offers/OffersScreen.tsx
"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
  Pressable,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useDispatch, useSelector } from "react-redux"
import { useNavigation } from "@react-navigation/native"
import type { RootState } from "../../redux/store"
import { fetchAllOffers, type BankOffer } from "../../redux/slices/offersSlice"
import { Search, Gift, Star, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Copy, Eye, Percent, DollarSign } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Clipboard from "expo-clipboard"
import { Snackbar } from "react-native-paper"

const OffersScreen: React.FC = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation<any>()
  const { offers, loading, error } = useSelector((state: RootState) => state.offers)

  const [searchQuery, setSearchQuery] = useState("")
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")

  useEffect(() => {
    dispatch(fetchAllOffers() as any)
  }, [dispatch])

  const filteredOffers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return offers
    return offers.filter(
      (offer) =>
        offer.bankName?.toLowerCase().includes(q) ||
        offer.offerHeadline?.toLowerCase().includes(q) ||
        offer.loanType?.toLowerCase().includes(q),
    )
  }, [offers, searchQuery])

  const handleRefresh = useCallback(() => {
    dispatch(fetchAllOffers() as any)
  }, [dispatch])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return "N/A"
    // 28 Sep 2025
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  }

  const isOfferExpired = (validityDate: string) => new Date(validityDate).getTime() < Date.now()

  const getDaysUntilExpiry = (validityDate: string) => {
    const today = new Date()
    const expiry = new Date(validityDate)
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getExpiryStatus = (validityDate: string) => {
    const expired = isOfferExpired(validityDate)
    const daysLeft = getDaysUntilExpiry(validityDate)
    if (expired) return { text: "Expired", color: "#EF4444", icon: AlertTriangle }
    if (daysLeft <= 7) return { text: `${Math.max(daysLeft, 0)} days left`, color: "#F59E0B", icon: Clock }
    return { text: `${daysLeft} days left`, color: "#10B981", icon: CheckCircle }
  }

  const handleCopyOffer = async (offer: BankOffer) => {
    const msg = [
      `🏦 Bank: ${offer.bankName}`,
      `📋 Offer: ${offer.offerHeadline}`,
      `💰 Interest Rate: ${offer.interestRate}%`,
      `💳 Processing Fee: ${offer.processingFee}${offer.processingFeeType === "percentage" ? "%" : ""}`,
      `📅 Valid Until: ${formatDate(offer.offerValidity)}`,
      `🏷️ Loan Type: ${offer.loanType?.replace(/_/g, " ")}`,
      offer.keyFeatures?.length ? `✨ Features: ${offer.keyFeatures.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    await Clipboard.setStringAsync(msg)
    setSnackbarMessage("Offer details copied to clipboard!")
    setSnackbarVisible(true)
  }

  const handleViewOffer = (offer: BankOffer) => {
    navigation.navigate("OfferDetails", { offer })
  }

  const renderOfferItem = ({ item }: { item: BankOffer }) => {
    const expiryStatus = getExpiryStatus(item.offerValidity)
    const ExpiryIcon = expiryStatus.icon
    const expired = isOfferExpired(item.offerValidity)

    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => handleViewOffer(item)}
        style={({ pressed }) => [styles.card, expired && styles.cardExpired, pressed && styles.cardPressed]}
      >
        {/* HERO IMAGE */}
        <View style={styles.heroWrap}>
          {/* Fallback color block if image missing */}
          {item.bankImage ? (
            <Image source={{ uri: item.bankImage }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: "#EEF2FF" }]} />
          )}
          {/* overlay gradient */}
          <LinearGradient
            colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.35)"]}
            style={StyleSheet.absoluteFill}
          />
          {/* top badges */}
          <View style={styles.heroTopRow}>
            {item.isFeatured && !expired && (
              <View style={styles.featuredChip}>
                <Star size={12} color="#111827" />
                <Text style={styles.featuredChipText}>Featured</Text>
              </View>
            )}
            <View style={styles.expiryChip}>
              <ExpiryIcon size={12} color={expiryStatus.color} />
              <Text style={[styles.expiryChipText, { color: "#FFFFFF" }]}>{expiryStatus.text}</Text>
            </View>
          </View>

          {/* bottom bank name + headline */}
          <View style={styles.heroBottom}>
            <Text style={styles.bankName}>{item.bankName}</Text>
            <Text style={styles.headline} numberOfLines={2}>
              {item.offerHeadline}
            </Text>
          </View>
        </View>

        {/* METRICS ROW */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}>
              <Percent size={16} color="#4F46E5" />
            </View>
            <Text style={styles.metricLabel}>Interest Rate</Text>
            <Text style={styles.metricValue}>{item.interestRate}%</Text>
            <Text style={styles.metricSub}>onwards</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: "rgba(16,185,129,0.12)" }]}>
              <DollarSign size={16} color="#10B981" />
            </View>
            <Text style={styles.metricLabel}>Processing Fee</Text>
            <Text style={styles.metricValue}>
              {item.processingFee}
              {item.processingFeeType === "percentage" ? "%" : ""}
            </Text>
            <Text style={styles.metricSub}>only</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: "rgba(245,158,11,0.12)" }]}>
              <Clock size={16} color="#F59E0B" />
            </View>
            <Text style={styles.metricLabel}>Valid Until</Text>
            <Text style={styles.metricValue}>{formatDate(item.offerValidity)}</Text>
            <Text style={styles.metricSub}>Hurry</Text>
          </View>
        </View>

        {/* TAGS / LOAN TYPE */}
        {item.loanType ? (
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.loanType.replace(/_/g, " ")}</Text>
            </View>
          </View>
        ) : null}

        {/* FEATURES */}
        {item.keyFeatures?.length ? (
          <View style={styles.featuresRow}>
            <Text style={styles.featuresTitle}>Key Features</Text>
            <Text style={styles.featuresText} numberOfLines={2}>
              {item.keyFeatures.slice(0, 3).join(" • ")}
              {item.keyFeatures.length > 3 ? " • ..." : ""}
            </Text>
          </View>
        ) : null}

        {/* ACTIONS */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.copyBtn} onPress={() => handleCopyOffer(item)}>
            <Copy size={14} color="#4F46E5" />
            <Text style={styles.copyText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => handleViewOffer(item)}>
            <Eye size={14} color="#FFFFFF" />
            <Text style={styles.primaryText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* HEADER */}
      <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.header}>
        <View accessible accessibilityRole="header">
          <Text style={styles.title}>Premium Bank Offers</Text>
          <Text style={styles.subtitle}>
            {filteredOffers.length} exclusive offer{filteredOffers.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Search size={18} color="#4F46E5" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by bank, offer, or loan type..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </LinearGradient>

      {/* LIST */}
      <FlatList
        data={filteredOffers}
        keyExtractor={(item) => item._id}
        renderItem={renderOfferItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} colors={["#4F46E5"]} tintColor="#4F46E5" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Gift size={72} color="#E5E7EB" />
            </View>
            <Text style={styles.emptyTitle}>No offers available</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? "Try adjusting your search" : "Check back later for new exclusive offers"}
            </Text>
          </View>
        }
      />

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible || !!error}
        onDismiss={() => {
          setSnackbarVisible(false)
        }}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage || error || "Something went wrong"}
      </Snackbar>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.92)", fontWeight: "600" },

  searchWrap: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(79,70,229,0.12)",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "600",
  },

  listContent: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardExpired: { opacity: 0.75 },
  cardPressed: { transform: [{ scale: 0.997 }] },

  heroWrap: { width: "100%", height: 160, backgroundColor: "#EEF2FF" },
  heroImage: { width: "100%", height: "100%" },

  heroTopRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredChip: {
    backgroundColor: "#FDE68A",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  featuredChipText: { fontSize: 12, fontWeight: "800", color: "#111827" },
  expiryChip: {
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  expiryChipText: { fontSize: 12, fontWeight: "800" },

  heroBottom: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
  },
  bankName: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", letterSpacing: -0.2 },
  headline: { color: "rgba(255,255,255,0.92)", fontSize: 13, fontWeight: "700", marginTop: 2 },

  metricsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
  },
  metricIconWrap: {
    width: 30,
    height: 30,
    backgroundColor: "rgba(79,70,229,0.12)",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  metricLabel: { fontSize: 10, color: "#64748B", fontWeight: "700" },
  metricValue: { fontSize: 16, fontWeight: "900", color: "#0F172A", marginTop: 2 },
  metricSub: { fontSize: 10, color: "#94A3B8", fontWeight: "600", marginTop: 2 },

  tagsRow: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 6 },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(79,70,229,0.1)",
    borderWidth: 1,
    borderColor: "rgba(79,70,229,0.2)",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tagText: { color: "#4F46E5", fontWeight: "800", fontSize: 11, letterSpacing: 0.3 },

  featuresRow: { paddingHorizontal: 12, paddingBottom: 10 },
  featuresTitle: { fontSize: 12, fontWeight: "800", color: "#4F46E5", marginBottom: 2 },
  featuresText: { fontSize: 13, color: "#475569", fontWeight: "600", lineHeight: 18 },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  copyBtn: {
    flex: 1,
    backgroundColor: "rgba(79,70,229,0.08)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(79,70,229,0.2)",
    flexDirection: "row",
    gap: 6,
  },
  copyText: { color: "#4F46E5", fontWeight: "800", fontSize: 13 },
  primaryBtn: {
    flex: 2,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  primaryText: { color: "#FFFFFF", fontWeight: "900", fontSize: 13 },

  empty: { alignItems: "center", paddingVertical: 64, paddingHorizontal: 16 },
  emptyIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  emptySub: { fontSize: 13, color: "#6B7280", textAlign: "center", marginTop: 6 },

  snackbar: { backgroundColor: "#4F46E5" },
})

export default OffersScreen
