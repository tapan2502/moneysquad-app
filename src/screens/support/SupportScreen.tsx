// screens/support/SupportScreen.tsx
"use client"

import React, { useEffect, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useDispatch, useSelector } from "react-redux"
import { Snackbar } from "react-native-paper"
import { RootState } from "../../redux/store"
import { fetchSupportData, clearError } from "../../redux/slices/resourceAndSupportSlice"
import { handleContactPress } from "../../utils/linking"
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

  const hasLeadEmails = useMemo(() => {
    const obj = supportData?.leadEmails || {}
    return Object.keys(obj).length > 0
  }, [supportData])

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Minimal, premium white header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <HelpCircle size={18} color="#4F46E5" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Support</Text>
            <Text style={styles.headerSub}>We’re here to help</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
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
              <View style={[styles.cardIcon, { backgroundColor: "#EEF2FF", borderColor: "#E0E7FF" }]}>
                <Mail size={16} color="#4F46E5" />
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
              <View style={[styles.cardIcon, { backgroundColor: "#ECFDF5", borderColor: "#D1FAE5" }]}>
                <Phone size={16} color="#10B981" />
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
              <View style={[styles.cardIcon, { backgroundColor: "#F0FDF4", borderColor: "#DCFCE7" }]}>
                <MessageCircle size={16} color="#22C55E" />
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
              <View style={[styles.cardIcon, { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }]}>
                <MapPin size={16} color="#F59E0B" />
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
                  <Text style={styles.miniValue} numberOfLines={1}>
                    {emailData.to}
                  </Text>
                  <Text style={[styles.miniLabel, { marginTop: 8 }]}>CC</Text>
                  <Text style={styles.miniValue} numberOfLines={1}>
                    {emailData.cc || "—"}
                  </Text>
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
                <View style={[styles.cardIcon, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
                  <AlertCircle size={16} color="#EF4444" />
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
                <View style={[styles.cardIcon, { backgroundColor: "#ECFDF5", borderColor: "#D1FAE5" }]}>
                  <User size={16} color="#10B981" />
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
        style={{ backgroundColor: "#0F172A" }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  // Header (white, premium)
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 6 : 8,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#0F172A", letterSpacing: -0.2 },
  headerSub: { fontSize: 12.5, color: "#64748B", fontWeight: "700" },

  // Scroll/content
  scroll: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 16, paddingBottom: 90 },

  // Sections
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 16.5, fontWeight: "900", color: "#0F172A", marginBottom: 12 },

  // Grid
  grid: { gap: 10 },

  // Primary card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECF3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: "900", color: "#0F172A", marginBottom: 2, letterSpacing: -0.1 },
  cardValue: { fontSize: 13.5, fontWeight: "800", color: "#4F46E5", marginBottom: 4 },

  // Inline meta
  inlineRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 11.5, color: "#64748B", fontWeight: "700" },

  // Mini cards (lead emails)
  miniCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E8ECF3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  miniHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  miniChip: {
    fontSize: 10.5,
    fontWeight: "900",
    color: "#4F46E5",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  miniLabel: { fontSize: 10.5, color: "#64748B", fontWeight: "800" },
  miniValue: { fontSize: 13, color: "#0F172A", fontWeight: "800" },

  // Info cards (key contacts)
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E8ECF3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  infoHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  infoTitle: { fontSize: 14, fontWeight: "900", color: "#0F172A" },
  infoBody: { gap: 8 },
  infoText: { fontSize: 13, color: "#374151", fontWeight: "700", flex: 1 },

  // Helpers
  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E8ECF3",
    alignItems: "center",
  },
  emptyTitle: { fontSize: 13.5, fontWeight: "900", color: "#111827" },
  emptySub: { fontSize: 12, fontWeight: "700", color: "#6B7280", marginTop: 4, textAlign: "center" },

  dim: { color: "#94A3B8" },
})

export default SupportScreen
