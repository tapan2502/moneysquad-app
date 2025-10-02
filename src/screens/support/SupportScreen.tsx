"use client"

import React, { useEffect, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useDispatch, useSelector } from "react-redux"
import { LinearGradient } from "expo-linear-gradient"
import { Snackbar } from "react-native-paper"
import { RootState } from "../../redux/store"
import { fetchSupportData, clearError } from "../../redux/slices/resourceAndSupportSlice"
import {
  CircleHelp as HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  User,
  CircleAlert as AlertCircle,
  ExternalLink,
} from "lucide-react-native"

const SupportScreen: React.FC = () => {
  const dispatch = useDispatch()
  const { supportData, loading, error } = useSelector((s: RootState) => s.resourceAndSupport)

  useEffect(() => {
    dispatch(fetchSupportData() as any)
  }, [dispatch])

  const handleRefresh = () => dispatch(fetchSupportData() as any)
  const handleDismissError = () => dispatch(clearError())

  // --- Safe deep-link openers with fallbacks ---
  const openURLSafe = async (url: string) => {
    try {
      const can = await Linking.canOpenURL(url)
      if (can) await Linking.openURL(url)
    } catch {
      // no-op
    }
  }

  const handleContactPress = (type: "email" | "phone" | "whatsapp", contact?: string) => {
    if (!contact) return
    if (type === "email") return openURLSafe(`mailto:${contact}`)
    if (type === "phone") return openURLSafe(`tel:${contact}`)
    if (type === "whatsapp") {
      const number = contact.replace(/\s+/g, "")
      // try native scheme, then https
      openURLSafe(`whatsapp://send?phone=${number}`)
      setTimeout(() => openURLSafe(`https://wa.me/${number}`), 200)
    }
  }

  const hasLeadEmails = useMemo(() => {
    const obj = supportData?.leadEmails || {}
    return Object.keys(obj).length > 0
  }, [supportData])

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* Premium Hero Header */}
        <LinearGradient colors={["#4F46E5", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={styles.heroIconWrap}>
              <HelpCircle size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Support</Text>
              <Text style={styles.heroSubtitle}>We’re here to help</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={!!loading} onRefresh={handleRefresh} colors={["#4F46E5"]} tintColor="#4F46E5" />
          }
        >
          {/* Contact Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Support</Text>

            <View style={styles.grid}>
              {/* Email */}
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => handleContactPress("email", supportData?.email?.contact)}
                disabled={!supportData?.email?.contact}
              >
                <View style={[styles.cardIcon, { backgroundColor: "#EEF2FF" }]}>
                  <Mail size={18} color="#4F46E5" />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>Email Support</Text>
                  <Text style={[styles.cardValue, !supportData?.email?.contact && styles.dim]}>
                    {supportData?.email?.contact || "Not available"}
                  </Text>
                  <View style={styles.inlineRow}>
                    <Clock size={12} color="#64748B" />
                    <Text style={styles.metaText}>{supportData?.email?.timing || "Mon–Fri, 10am–6pm"}</Text>
                  </View>
                </View>
                <ExternalLink size={16} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Phone */}
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => handleContactPress("phone", supportData?.phone?.contact)}
                disabled={!supportData?.phone?.contact}
              >
                <View style={[styles.cardIcon, { backgroundColor: "#ECFDF5" }]}>
                  <Phone size={18} color="#10B981" />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>Phone Support</Text>
                  <Text style={[styles.cardValue, !supportData?.phone?.contact && styles.dim]}>
                    {supportData?.phone?.contact || "Not available"}
                  </Text>
                  <View style={styles.inlineRow}>
                    <Clock size={12} color="#64748B" />
                    <Text style={styles.metaText}>{supportData?.phone?.timing || "Mon–Sat, 10am–7pm"}</Text>
                  </View>
                </View>
                <ExternalLink size={16} color="#9CA3AF" />
              </TouchableOpacity>

              {/* WhatsApp */}
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => handleContactPress("whatsapp", supportData?.whatsapp?.contact)}
                disabled={!supportData?.whatsapp?.contact}
              >
                <View style={[styles.cardIcon, { backgroundColor: "#F0FDF4" }]}>
                  <MessageCircle size={18} color="#22C55E" />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>WhatsApp</Text>
                  <Text style={[styles.cardValue, !supportData?.whatsapp?.contact && styles.dim]}>
                    {supportData?.whatsapp?.contact || "Not available"}
                  </Text>
                  <View style={styles.inlineRow}>
                    <Clock size={12} color="#64748B" />
                    <Text style={styles.metaText}>{supportData?.whatsapp?.timing || "Usually replies fast"}</Text>
                  </View>
                </View>
                <ExternalLink size={16} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Office */}
              <View style={styles.card}>
                <View style={[styles.cardIcon, { backgroundColor: "#FEF3C7" }]}>
                  <MapPin size={18} color="#F59E0B" />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>Office Location</Text>
                  <Text style={[styles.cardValue, !supportData?.office?.contact && styles.dim]}>
                    {supportData?.office?.contact || "Not available"}
                  </Text>
                  <View style={styles.inlineRow}>
                    <Clock size={12} color="#64748B" />
                    <Text style={styles.metaText}>{supportData?.office?.timing || "Mon–Fri, 10am–6pm"}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Lead Emails */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lead Email Addresses</Text>

            <View style={styles.grid}>
              {hasLeadEmails ? (
                Object.entries(supportData!.leadEmails!).map(([type, emailData]: any) => (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.9}
                    style={styles.miniCard}
                    onPress={() => handleContactPress("email", emailData.to)}
                  >
                    <View style={styles.miniHeader}>
                      <Text style={styles.miniChip}>{type.toUpperCase()}</Text>
                      <ExternalLink size={14} color="#9CA3AF" />
                    </View>
                    <Text style={styles.miniLabel}>To</Text>
                    <Text style={styles.miniValue}>{emailData.to}</Text>
                    <Text style={[styles.miniLabel, { marginTop: 8 }]}>CC</Text>
                    <Text style={styles.miniValue}>{emailData.cc || "—"}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyTitle}>No lead emails configured</Text>
                  <Text style={styles.emptySub}>Ask your admin to add the relevant addresses.</Text>
                </View>
              )}
            </View>
          </View>

          {/* Key Contacts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Contacts</Text>

            <View style={styles.grid}>
              {/* Grievance */}
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: "#FEF2F2" }]}>
                    <AlertCircle size={18} color="#EF4444" />
                  </View>
                  <Text style={styles.infoTitle}>Grievance Officer</Text>
                </View>

                <View style={styles.infoBody}>
                  <View style={styles.inlineRow}>
                    <User size={14} color="#64748B" />
                    <Text style={styles.infoText}>{supportData?.grievance?.name || "—"}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.inlineRow}
                    onPress={() => handleContactPress("phone", supportData?.grievance?.phone)}
                    disabled={!supportData?.grievance?.phone}
                  >
                    <Phone size={14} color="#64748B" />
                    <Text style={[styles.infoText, !supportData?.grievance?.phone && styles.dim]}>
                      {supportData?.grievance?.phone || "—"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.inlineRow}
                    onPress={() => handleContactPress("email", supportData?.grievance?.email)}
                    disabled={!supportData?.grievance?.email}
                  >
                    <Mail size={14} color="#64748B" />
                    <Text style={[styles.infoText, !supportData?.grievance?.email && styles.dim]}>
                      {supportData?.grievance?.email || "—"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Payout */}
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: "#ECFDF5" }]}>
                    <User size={18} color="#10B981" />
                  </View>
                  <Text style={styles.infoTitle}>Payout Officer</Text>
                </View>

                <View style={styles.infoBody}>
                  <View style={styles.inlineRow}>
                    <User size={14} color="#64748B" />
                    <Text style={styles.infoText}>{supportData?.payout?.name || "—"}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.inlineRow}
                    onPress={() => handleContactPress("phone", supportData?.payout?.phone)}
                    disabled={!supportData?.payout?.phone}
                  >
                    <Phone size={14} color="#64748B" />
                    <Text style={[styles.infoText, !supportData?.payout?.phone && styles.dim]}>
                      {supportData?.payout?.phone || "—"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.inlineRow}
                    onPress={() => handleContactPress("email", supportData?.payout?.email)}
                    disabled={!supportData?.payout?.email}
                  >
                    <Mail size={14} color="#64748B" />
                    <Text style={[styles.infoText, !supportData?.payout?.email && styles.dim]}>
                      {supportData?.payout?.email || "—"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Error Snackbar */}
        <Snackbar
          visible={!!error}
          onDismiss={handleDismissError}
          action={{ label: "Dismiss", onPress: handleDismissError }}
        >
          {error}
        </Snackbar>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1020" },
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  // Hero
  hero: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: { fontSize: 22, fontWeight: "900", color: "#fff", marginBottom: 2, letterSpacing: -0.2 },
  heroSubtitle: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.9)" },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },

  // Sections
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 12 },

  // Generic Grid
  grid: { gap: 12 },

  // Primary card
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "800", color: "#0F172A", marginBottom: 4 },
  cardValue: { fontSize: 14, fontWeight: "700", color: "#4F46E5", marginBottom: 6 },

  // Inline meta
  inlineRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 12, color: "#64748B", fontWeight: "600" },

  // Mini cards (lead emails)
  miniCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  miniHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  miniChip: {
    fontSize: 11,
    fontWeight: "900",
    color: "#4F46E5",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  miniLabel: { fontSize: 11, color: "#64748B", fontWeight: "700" },
  miniValue: { fontSize: 13.5, color: "#0F172A", fontWeight: "800" },

  // Info cards (key contacts)
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  infoHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  infoTitle: { fontSize: 15, fontWeight: "900", color: "#0F172A" },
  infoBody: { gap: 8 },
  infoText: { fontSize: 13.5, color: "#374151", fontWeight: "700", flex: 1 },

  // Helpers
  dim: { color: "#94A3B8" },
})

export default SupportScreen
