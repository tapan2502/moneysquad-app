// src/screens/resource/ProductInfoScreen.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native"
import * as Clipboard from 'expo-clipboard'
import { SafeAreaView } from "react-native-safe-area-context"
import { useDispatch, useSelector } from "react-redux"
import { LinearGradient } from "expo-linear-gradient"
import { Snackbar } from "react-native-paper"
import { RootState } from "../../redux/store"
import { fetchProductInfo, clearError } from "../../redux/slices/resourceAndSupportSlice"
import {
  BookOpen,
  FileText,
  CreditCard,
  Percent,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Copy,
} from "lucide-react-native"

type TabKey = "guides" | "eligibility" | "documents"

const ProductInfoScreen: React.FC = () => {
  const dispatch = useDispatch()
  const { productInfo, productInfoLoading, error } = useSelector((s: RootState) => s.resourceAndSupport)

  const [activeTab, setActiveTab] = useState<TabKey>("guides")

  useEffect(() => {
    dispatch(fetchProductInfo() as any)
  }, [dispatch])

  const handleRefresh = () => dispatch(fetchProductInfo() as any)
  const handleDismissError = () => dispatch(clearError())

  const handleCopy = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text)
      Alert.alert('Copied!', `${label} copied to clipboard`)
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard')
    }
  }

  // ---------- Styling helpers for loan types ----------
  const typeColor: Record<string, string> = {
    "PL - Term Loan": "#2563EB",
    "PL - Overdraft": "#7C3AED",
    "BL - Term Loan": "#059669",
    "BL - Overdraft": "#D97706",
    "SEP - Term Loan": "#6D28D9",
    "SEP - Overdraft": "#DC2626",
  }
  const getLoanTypeColor = (t: string) => typeColor[t] || "#475569"
  const getTypeBg = (t: string) => `${getLoanTypeColor(t)}12` // softer glassy bg

  // ---------- Derived, null-safe pieces ----------
  const guides = useMemo(() => productInfo?.guides ?? [], [productInfo])
  const eligCriteria = useMemo(() => productInfo?.policies?.eligibilityCriteria ?? {}, [productInfo])
  const eligCalc = useMemo(() => productInfo?.policies?.eligibilityCalculation ?? {}, [productInfo])
  const documents = useMemo(() => productInfo?.documents ?? {}, [productInfo])

  const isEmpty =
    !productInfo ||
    (guides.length === 0 && Object.keys(eligCriteria).length === 0 && Object.keys(documents).length === 0)

  // ---------- Tabs ----------
  const Tab = ({ id, label, icon: Icon }: { id: TabKey; label: string; icon: any }) => {
    const active = activeTab === id
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setActiveTab(id)}
        style={[styles.segBtn, active && styles.segBtnActive]}
      >
        <Icon size={14} color={active ? "#FFFFFF" : "#334155"} strokeWidth={2} />
        <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
      </TouchableOpacity>
    )
  }

  // ---------- Renderers ----------
  const renderGuides = () => (
    <ScrollView
      style={styles.tabScroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={!!productInfoLoading} onRefresh={handleRefresh} colors={["#4F46E5"]} />}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <Text style={styles.title}>Loan Product Guides</Text>
      <Text style={styles.subtitle}>Rates, fees, and key terms—curated per product</Text>

      {guides.length === 0 ? (
        <EmptyState label="No guides available right now" />
      ) : (
        <View style={styles.grid}>
          {guides.map((g: any, idx: number) => (
            <View key={g._id || idx} style={styles.card}>
              <View style={[styles.cardHeader, { backgroundColor: getTypeBg(g.type) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <View style={[styles.cardIconWrap, { backgroundColor: getTypeBg(g.type), borderColor: `${getLoanTypeColor(g.type)}22` }]}>
                    <CreditCard size={16} color={getLoanTypeColor(g.type)} />
                  </View>
                  <Text style={[styles.cardHeaderText, { color: getLoanTypeColor(g.type) }]} numberOfLines={1}>
                    {g.type}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCopy(
                    `${g.type}\nInterest Rate: ${g.interestRate || '—'}\nProcessing Fee: ${g.processingFees || '—'}\nLoan Amount: ${g.loanAmount || '—'}\nTenure: ${g.tenure || '—'}`,
                    g.type
                  )}
                  style={styles.copyBtn}
                  activeOpacity={0.7}
                >
                  <Copy size={16} color={getLoanTypeColor(g.type)} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardBodyPad}>
                <View style={styles.metricsRow}>
                  <MetricBox label="Interest Rate" value={g.interestRate || "—"} Icon={Percent} />
                  <MetricBox label="Processing Fee" value={g.processingFees || "—"} Icon={DollarSign} />
                </View>

                <View style={styles.metricsRow}>
                  <MetricBox label="Loan Amount" value={g.loanAmount || "—"} Icon={DollarSign} />
                  <MetricBox label="Tenure" value={g.tenure || "—"} Icon={Calendar} />
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )

  const renderEligibility = () => (
    <ScrollView
      style={styles.tabScroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={!!productInfoLoading} onRefresh={handleRefresh} colors={["#4F46E5"]} />}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <Text style={styles.title}>Eligibility Criteria</Text>
      <Text style={styles.subtitle}>Requirements and how we evaluate your application</Text>

      {/* Criteria blocks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Criteria Requirements</Text>
        {Object.keys(eligCriteria).length === 0 ? (
          <EmptyState label="No criteria configured" />
        ) : (
          Object.entries(eligCriteria).map(([type, list]: any) => (
            <View key={type} style={styles.card}>
              <View style={[styles.cardHeader, { backgroundColor: getTypeBg(type) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <View style={[styles.cardIconWrap, { backgroundColor: getTypeBg(type), borderColor: `${getLoanTypeColor(type)}22` }]}>
                    <CheckCircle size={16} color={getLoanTypeColor(type)} />
                  </View>
                  <Text style={[styles.cardHeaderText, { color: getLoanTypeColor(type) }]} numberOfLines={1}>
                    {type}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCopy(
                    `${type}\n${list.join('\n')}`,
                    'Eligibility Criteria'
                  )}
                  style={styles.copyBtn}
                  activeOpacity={0.7}
                >
                  <Copy size={16} color={getLoanTypeColor(type)} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardBodyPad}>
                {list.map((criterion: string, i: number) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={styles.dot} />
                    <Text style={styles.bulletText}>{criterion}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Calculation blocks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calculation Methods</Text>
        {Object.keys(eligCalc).length === 0 ? (
          <EmptyState label="No calculation methods configured" />
        ) : (
          Object.entries(eligCalc).map(([type, items]: any) => (
            <View key={type} style={styles.card}>
              <View style={[styles.cardHeader, { backgroundColor: getTypeBg(type) }]}>
                <Text style={[styles.cardHeaderText, { color: getLoanTypeColor(type), flex: 1 }]} numberOfLines={1}>
                  {type}
                </Text>
                <TouchableOpacity
                  onPress={() => handleCopy(
                    `${type}\n${items.join('\n')}`,
                    'Calculation Method'
                  )}
                  style={styles.copyBtn}
                  activeOpacity={0.7}
                >
                  <Copy size={16} color={getLoanTypeColor(type)} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardBodyPad}>
                {items.map((line: string, i: number) => (
                  <View key={i} style={styles.calcItem}>
                    <Text style={styles.calcText}>{line}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )

  const renderDocuments = () => (
    <ScrollView
      style={styles.tabScroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={!!productInfoLoading} onRefresh={handleRefresh} colors={["#4F46E5"]} />}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <Text style={styles.title}>Required Documents</Text>
      <Text style={styles.subtitle}>Documents by product category and profile</Text>

      {Object.keys(documents).length === 0 ? (
        <EmptyState label="No documents listed yet" />
      ) : (
        Object.entries(documents).map(([category, docData]: any) => {
          const getAllDocs = () => {
            let text = `${category}\n\n`;
            Object.entries(docData?.subcategories ?? {}).forEach(([sub, docs]: any) => {
              text += `${sub}:\n${docs.join('\n')}\n\n`;
            });
            return text;
          };

          return (
          <View key={category} style={styles.docCategory}>
            <View style={styles.docHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={styles.docIcon}>
                  <FileText size={16} color="#4F46E5" />
                </View>
                <Text style={styles.docTitle} numberOfLines={1}>{category}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleCopy(getAllDocs(), category)}
                style={styles.copyBtn}
                activeOpacity={0.7}
              >
                <Copy size={16} color="#4F46E5" />
              </TouchableOpacity>
            </View>

            {Object.entries(docData?.subcategories ?? {}).map(([sub, docs]: any) => (
              <View key={sub} style={styles.subCard}>
                <Text style={styles.subTitle} numberOfLines={1}>{sub}</Text>
                <View style={{ gap: 8 }}>
                  {docs.map((d: string, i: number) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={[styles.dot, { backgroundColor: "#10B981" }]} />
                      <Text style={styles.bulletText}>{d}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )})
      )}
    </ScrollView>
  )

  // ---------- Loading Gate ----------
  if (productInfoLoading && !productInfo) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#0B1020" }}>
        <LinearGradient colors={["#0B1220", "#111827"]} style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={styles.heroIcon}>
              <BookOpen size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Product Info</Text>
              <Text style={styles.heroSub}>Loan guides and requirements</Text>
            </View>
          </View>
        </LinearGradient>
        <View style={[styles.center, { backgroundColor: "#F8FAFC" }]}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={{ marginTop: 12, color: "#6B7280", fontWeight: "600" }}>Loading product information…</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.container}>
        {/* Premium hero header */}
        <LinearGradient
          colors={["#0B1220", "#111827"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroRow}>
            <View style={styles.heroIcon}>
              <BookOpen size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Product Info</Text>
              <Text style={styles.heroSub}>Loan guides and requirements</Text>
            </View>
          </View>

          {/* Glassy Segmented Tabs */}
          <View style={styles.segment}>
            <Tab id="guides" label="Guides" icon={CreditCard} />
            <Tab id="eligibility" label="Eligibility" icon={CheckCircle} />
            <Tab id="documents" label="Documents" icon={FileText} />
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.body}>
          {isEmpty ? (
            <View style={[styles.center, { padding: 24 }]}>
              <AlertCircle size={28} color="#9CA3AF" />
              <Text style={{ marginTop: 10, fontWeight: "800", color: "#374151" }}>No data available</Text>
              <Text style={{ marginTop: 4, color: "#6B7280", textAlign: "center" }}>
                Pull to refresh or check back later.
              </Text>
            </View>
          ) : activeTab === "guides" ? (
            renderGuides()
          ) : activeTab === "eligibility" ? (
            renderEligibility()
          ) : (
            renderDocuments()
          )}
        </View>

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

/* ---------- Small Presentational Bits ---------- */

const MetricBox = ({
  label,
  value,
  Icon,
}: {
  label: string
  value: string
  Icon: React.ComponentType<any>
}) => (
  <View style={styles.metric}>
    <View style={styles.metricIcon}>
      <Icon size={15} color="#4F46E5" strokeWidth={2} />
    </View>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
)

const EmptyState = ({ label }: { label: string }) => (
  <View style={styles.emptyWrap}>
    <AlertCircle size={20} color="#9CA3AF" />
    <Text style={styles.emptyText}>{label}</Text>
  </View>
)

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1020" }, // dark scrim under the curved hero
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  // Hero
  hero: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 10 : 6,
    paddingBottom: 14,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: -0.2 },
  heroSub: { color: "rgba(255,255,255,0.92)", fontSize: 12.5, fontWeight: "700", marginTop: 2 },

  // Segment (glassy)
  segment: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
    padding: 4,
    flexDirection: "row",
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
  segBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "transparent",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  segBtnActive: {
    backgroundColor: "#4F46E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  segText: { color: "#E5E7EB", fontSize: 12.5, fontWeight: "900", letterSpacing: 0.2 },
  segTextActive: { color: "#FFFFFF" },

  // Body
  body: { flex: 1 },

  // Shared
  tabScroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 18, fontWeight: "900", color: "#0F172A", letterSpacing: -0.2 },
  subtitle: { fontSize: 12.5, color: "#64748B", marginTop: 4, marginBottom: 12, fontWeight: "700" },

  grid: { gap: 12 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8ECF3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cardHeaderText: { fontSize: 13.5, fontWeight: "900", letterSpacing: 0.2 },
  cardBodyPad: { padding: 12 },

  metricsRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  metric: {
    flex: 1,
    backgroundColor: "#FBFCFF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  metricIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  metricLabel: { fontSize: 10.5, color: "#64748B", fontWeight: "900", letterSpacing: 0.2 },
  metricValue: { fontSize: 15, color: "#0F172A", fontWeight: "900", marginTop: 2 },

  section: { marginTop: 8, gap: 10 },
  sectionTitle: { fontSize: 15.5, fontWeight: "900", color: "#0F172A" },

  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4F46E5", marginTop: 6 },
  bulletText: { flex: 1, color: "#1F2937", fontSize: 13.5, fontWeight: "700", lineHeight: 19 },

  calcItem: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    marginBottom: 8,
  },
  calcText: { color: "#111827", fontSize: 13, fontWeight: "700", lineHeight: 18 },

  // Documents
  docCategory: { marginTop: 6, marginBottom: 12 },
  docHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  docIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  docTitle: { fontSize: 15, fontWeight: "900", color: "#0F172A" },
  subCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E8ECF3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 10,
  },
  subTitle: { fontSize: 13, fontWeight: "900", color: "#4F46E5", marginBottom: 8 },

  // Empty
  emptyWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 22, gap: 6 },
  emptyText: { color: "#6B7280", fontWeight: "700" },

  // Centered container
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Copy button
  copyBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
})

export default ProductInfoScreen
