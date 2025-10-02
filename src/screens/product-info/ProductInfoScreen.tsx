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
} from "react-native"
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

  // ---------- Styling helpers for loan types ----------
  const typeColor: Record<string, string> = {
    "PL - Term Loan": "#3B82F6",
    "PL - Overdraft": "#6366F1",
    "BL - Term Loan": "#10B981",
    "BL - Overdraft": "#F59E0B",
    "SEP - Term Loan": "#8B5CF6",
    "SEP - Overdraft": "#EF4444",
  }
  const getLoanTypeColor = (t: string) => typeColor[t] || "#6B7280"
  const getTypeBg = (t: string) => `${getLoanTypeColor(t)}15`

  // ---------- Derived, null-safe pieces ----------
  const guides = useMemo(() => productInfo?.guides ?? [], [productInfo])
  const eligCriteria = useMemo(() => productInfo?.policies?.eligibilityCriteria ?? {}, [productInfo])
  const eligCalc = useMemo(() => productInfo?.policies?.eligibilityCalculation ?? {}, [productInfo])
  const documents = useMemo(() => productInfo?.documents ?? {}, [productInfo])

  const isEmpty =
    !productInfo ||
    (guides.length === 0 && Object.keys(eligCriteria).length === 0 && Object.keys(documents).length === 0)

  // ---------- Tabs ----------
  const Tab = ({ id, label, icon: Icon }: { id: TabKey; label: string; icon: any }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setActiveTab(id)}
      style={[styles.segBtn, activeTab === id && styles.segBtnActive]}
    >
      <Icon size={14} color={activeTab === id ? "#fff" : "#4F46E5"} strokeWidth={2} />
      <Text style={[styles.segText, activeTab === id && styles.segTextActive]}>{label}</Text>
    </TouchableOpacity>
  )

  // ---------- Renderers ----------
  const renderGuides = () => (
    <ScrollView
      style={styles.tabScroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={!!productInfoLoading} onRefresh={handleRefresh} colors={["#4F46E5"]} />}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <Text style={styles.title}>Loan Product Guides</Text>
      <Text style={styles.subtitle}>Interest rates, fees, and key terms for each product</Text>

      {guides.length === 0 ? (
        <EmptyState label="No guides available right now" />
      ) : (
        <View style={styles.grid}>
          {guides.map((g: any, idx: number) => (
            <View key={g._id || idx} style={styles.card}>
              <View style={[styles.cardHeader, { backgroundColor: getTypeBg(g.type) }]}>
                <CreditCard size={18} color={getLoanTypeColor(g.type)} strokeWidth={2} />
                <Text style={[styles.cardHeaderText, { color: getLoanTypeColor(g.type) }]}>{g.type}</Text>
              </View>

              <View style={styles.cardBodyPad}>
                <View style={styles.metricsRow}>
                  <MetricBox label="INTEREST RATE" value={g.interestRate || "—"} Icon={Percent} />
                  <MetricBox label="PROCESSING FEE" value={g.processingFees || "—"} Icon={DollarSign} />
                </View>

                <View style={styles.metricsRow}>
                  <MetricBox label="LOAN AMOUNT" value={g.loanAmount || "—"} Icon={DollarSign} />
                  <MetricBox label="TENURE" value={g.tenure || "—"} Icon={Calendar} />
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
      <Text style={styles.subtitle}>Requirements and calculation methods for approval</Text>

      {/* Criteria blocks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Criteria Requirements</Text>
        {Object.keys(eligCriteria).length === 0 ? (
          <EmptyState label="No criteria configured" />
        ) : (
          Object.entries(eligCriteria).map(([type, list]: any) => (
            <View key={type} style={styles.card}>
              <View style={[styles.cardHeader, { backgroundColor: getTypeBg(type) }]}>
                <CheckCircle size={16} color={getLoanTypeColor(type)} strokeWidth={2} />
                <Text style={[styles.cardHeaderText, { color: getLoanTypeColor(type) }]}>{type}</Text>
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
                <Text style={[styles.cardHeaderText, { color: getLoanTypeColor(type) }]}>{type}</Text>
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
        Object.entries(documents).map(([category, docData]: any) => (
          <View key={category} style={styles.docCategory}>
            <View style={styles.docHeader}>
              <FileText size={18} color="#4F46E5" strokeWidth={2} />
              <Text style={styles.docTitle}>{category}</Text>
            </View>

            {Object.entries(docData?.subcategories ?? {}).map(([sub, docs]: any) => (
              <View key={sub} style={styles.subCard}>
                <Text style={styles.subTitle}>{sub}</Text>
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
        ))
      )}
    </ScrollView>
  )

  // ---------- Loading Gate ----------
  if (productInfoLoading && !productInfo) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: "#0B1020" }}>
        <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.hero}>
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
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <View style={styles.container}>
        {/* Premium hero header */}
        <LinearGradient colors={["#4F46E5", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={styles.heroIcon}>
              <BookOpen size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Product Info</Text>
              <Text style={styles.heroSub}>Loan guides and requirements</Text>
            </View>
          </View>

          {/* Segmented Tabs */}
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
                Try pulling to refresh or check back later.
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
      <Icon size={16} color="#4F46E5" strokeWidth={2} />
    </View>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
)

const EmptyState = ({ label }: { label: string }) => (
  <View style={styles.emptyWrap}>
    <AlertCircle size={22} color="#9CA3AF" />
    <Text style={styles.emptyText}>{label}</Text>
  </View>
)

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1020" },
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
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: -0.2 },
  heroSub: { color: "rgba(255,255,255,0.95)", fontSize: 12.5, fontWeight: "700", marginTop: 2 },

  // Segment
  segment: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    padding: 4,
    flexDirection: "row",
    gap: 6,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "transparent",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  segBtnActive: { backgroundColor: "#4F46E5" },
  segText: { color: "#4F46E5", fontSize: 12.5, fontWeight: "900" },
  segTextActive: { color: "#fff" },

  // Body
  body: { flex: 1 },

  // Shared
  tabScroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 18, fontWeight: "900", color: "#0F172A" },
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 4, marginBottom: 14 },

  grid: { gap: 14 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEF2F7",
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
    paddingVertical: 12,
  },
  cardHeaderText: { fontSize: 14, fontWeight: "900" },
  cardBodyPad: { padding: 14 },

  metricsRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  metric: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  metricLabel: { fontSize: 10.5, color: "#64748B", fontWeight: "900" },
  metricValue: { fontSize: 14, color: "#0F172A", fontWeight: "900", marginTop: 2 },

  section: { marginTop: 10, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#0F172A" },

  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4F46E5", marginTop: 6 },
  bulletText: { flex: 1, color: "#374151", fontSize: 13.5, fontWeight: "700", lineHeight: 18 },

  calcItem: { backgroundColor: "#F8FAFC", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#F1F5F9", marginBottom: 8 },
  calcText: { color: "#374151", fontSize: 13, fontWeight: "700", lineHeight: 18 },

  // Documents
  docCategory: { marginTop: 6, marginBottom: 14 },
  docHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  docTitle: { fontSize: 16, fontWeight: "900", color: "#0F172A" },
  subCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 10,
  },
  subTitle: { fontSize: 14, fontWeight: "900", color: "#4F46E5", marginBottom: 8 },

  // Empty
  emptyWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 22, gap: 6 },
  emptyText: { color: "#6B7280", fontWeight: "700" },

  // Centered container
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
})

export default ProductInfoScreen
