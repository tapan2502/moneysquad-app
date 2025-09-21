"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
  Dimensions,
} from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { useNavigation } from "@react-navigation/native"
import type { RootState } from "../../redux/store"
import { fetchAllOffers, type BankOffer } from "../../redux/slices/offersSlice"
import {
  Search,
  Gift,
  Star,
  Clock,
  CircleCheck as CheckCircle,
  TriangleAlert as AlertTriangle,
  Copy,
  Eye,
} from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"
import * as Clipboard from "expo-clipboard"
import { Snackbar } from "react-native-paper"

const { width } = Dimensions.get("window")

const OffersScreen: React.FC = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation<any>()
  const { offers, loading, error } = useSelector((state: RootState) => state.offers)

  const [searchQuery, setSearchQuery] = useState("")
  const [filteredOffers, setFilteredOffers] = useState<BankOffer[]>([])
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")

  useEffect(() => {
    dispatch(fetchAllOffers() as any)
  }, [dispatch])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOffers(offers)
    } else {
      const filtered = offers.filter(
        (offer) =>
          offer.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          offer.offerHeadline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          offer.loanType.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredOffers(filtered)
    }
  }, [offers, searchQuery])

  const handleRefresh = () => {
    dispatch(fetchAllOffers() as any)
  }

  const handleCopyOffer = async (offer: BankOffer) => {
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

  const handleViewOffer = (offer: BankOffer) => {
    navigation.navigate("OfferDetails", { offer })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const isOfferExpired = (validityDate: string) => {
    return new Date(validityDate) < new Date()
  }

  const getDaysUntilExpiry = (validityDate: string) => {
    const today = new Date()
    const expiry = new Date(validityDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getExpiryStatus = (validityDate: string) => {
    const expired = isOfferExpired(validityDate)
    const daysLeft = getDaysUntilExpiry(validityDate)

    if (expired) {
      return { text: "Expired", color: "#EF4444", icon: AlertTriangle }
    } else if (daysLeft <= 7) {
      return { text: `${daysLeft} days left`, color: "#F59E0B", icon: Clock }
    } else {
      return { text: `${daysLeft} days left`, color: "#10B981", icon: CheckCircle }
    }
  }

  const renderOfferItem = ({ item }: { item: BankOffer }) => {
    const expiryStatus = getExpiryStatus(item.offerValidity)
    const ExpiryIcon = expiryStatus.icon
    const expired = isOfferExpired(item.offerValidity)

    return (
      <TouchableOpacity
        style={[styles.offerCard, expired && styles.expiredCard]}
        onPress={() => handleViewOffer(item)}
        activeOpacity={0.95}
      >
        <View style={styles.cardContainer}>
          {/* Large banner image section */}
          <View style={styles.bannerSection}>
            <Image source={{ uri: item.bankImage }} style={styles.bannerImage} resizeMode="cover" />
            <LinearGradient
              colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
              style={styles.bannerOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              {/* Featured badge */}
              {item.isFeatured && !expired && (
                <View style={styles.featuredBadge}>
                  <Star size={12} color="#FFD700" fill="#FFD700" strokeWidth={0} />
                  <Text style={styles.featuredText}>FEATURED</Text>
                </View>
              )}

              {/* Loan type badge */}
              <View style={styles.loanTypeBadge}>
                <Text style={styles.loanTypeText}>{item.loanType.replace(/_/g, " ")}</Text>
              </View>

              {/* Large interest rate display */}
              <View style={styles.rateDisplay}>
                <Text style={styles.rateNumber}>{item.interestRate}%</Text>
                <Text style={styles.rateLabel}>onwards</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Details section */}
          <View style={styles.detailsSection}>
            {/* Countdown timer */}
            <View style={styles.timerSection}>
              <Clock size={16} color="#00B9AE" strokeWidth={2} />
              <Text style={styles.timerText}>{expiryStatus.text}</Text>
              <Text style={styles.expiryDate}>Expires {formatDate(item.offerValidity)}</Text>
            </View>

            {/* Bank name and offer headline */}
            <View style={styles.bankSection}>
              <View style={styles.bankNameContainer}>
                <Text style={styles.bankName}>{item.bankName}</Text>
                <Star size={16} color="#FFD700" fill="#FFD700" strokeWidth={0} />
              </View>
              <Text style={styles.offerHeadline} numberOfLines={1}>
                {item.offerHeadline}
              </Text>
            </View>

            {/* Key metrics */}
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>INTEREST RATE</Text>
                <Text style={styles.metricValue}>{item.interestRate}%</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>PROCESSING FEE</Text>
                <Text style={styles.metricValue}>
                  {item.processingFee}
                  {item.processingFeeType === "percentage" ? "%" : ""}
                </Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.copyBtn} onPress={() => handleCopyOffer(item)}>
                <Copy size={16} color="#00B9AE" strokeWidth={2} />
                <Text style={styles.copyText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.viewBtn} onPress={() => handleViewOffer(item)}>
                <Eye size={16} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.viewText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Premium Offers</Text>
          <Text style={styles.headerSubtitle}>
            {filteredOffers.length} exclusive offer{filteredOffers.length !== 1 ? "s" : ""} available
          </Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#00B9AE" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by bank, offer, or loan type..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </View>

      {/* Offers list */}
      <FlatList
        data={filteredOffers}
        renderItem={renderOfferItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} colors={["#00B9AE"]} tintColor="#00B9AE" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Gift size={80} color="#E5E7EB" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No offers available</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? "Try adjusting your search criteria" : "Check back later for new exclusive offers"}
            </Text>
          </View>
        }
      />

      {/* Success/Error Snackbar */}
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
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: "rgba(0, 185, 174, 0.1)",
    shadowColor: "#00B9AE",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },
  listContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  offerCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  expiredCard: {
    opacity: 0.7,
  },
  cardContainer: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
  },
  bannerSection: {
    position: "relative",
    height: 200,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    justifyContent: "flex-end",
    padding: 20,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#92400E",
    letterSpacing: 0.5,
  },
  loanTypeBadge: {
    backgroundColor: "rgba(0, 185, 174, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  loanTypeText: {
    fontSize: 12,
    color: "#00B9AE",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  rateDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rateNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  rateLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  detailsSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  timerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#00B9AE",
  },
  expiryDate: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  bankSection: {
    flexDirection: "column",
    marginBottom: 16,
  },
  bankNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  bankName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  offerHeadline: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0, 185, 174, 0.1)",
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginRight: 8,
  },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#00B9AE",
    borderRadius: 12,
    padding: 12,
    flex: 1,
  },
  copyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#00B9AE",
  },
  viewText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#F8FAFC",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  snackbar: {
    backgroundColor: "#00B9AE",
  },
})

export default OffersScreen
